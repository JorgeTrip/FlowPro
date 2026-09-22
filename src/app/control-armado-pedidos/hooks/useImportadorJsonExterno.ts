// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useState } from 'react';
import { useArmadoStore } from '../stores/armadoStore';
import { RegistroArmadoDocumento, FilaArmado } from '../types/armado';
import { guardarPlanillaPendienteFirestore } from '../services/firestoreService';
import { procesarFechasPlanilla } from '../utils/fechaUtils';
import { emparejarImagenesConPlanillas } from '../utils/emparejarImagenesPlanilla';
import { optimizarImagenBase64 } from '../utils/imageUtils';

export function useImportadorJsonExterno() {
  const { agregarItemPendiente } = useArmadoStore();
  const [cargando, setCargando] = useState(false);
  const [errorParse, setErrorParse] = useState<string | null>(null);
  const [exitoMensaje, setExitoMensaje] = useState<string | null>(null);
  const [archivosSobrantes, setArchivosSobrantes] = useState<File[]>([]);
  const [cantFotosAsignadas, setCantFotosAsignadas] = useState(0);
  const [modalSobrantesAbierto, setModalSobrantesAbierto] = useState(false);

  const importarTextoJson = async (texto: string, archivosImagenes?: File[]) => {
    setErrorParse(null);
    setExitoMensaje(null);
    const limpio = texto.trim();
    if (!limpio) {
      setErrorParse('Por favor, pega el contenido JSON antes de importar.');
      return { exito: false, cantidad: 0 };
    }

    setCargando(true);
    try {
      let jsonSanitizado = limpio;
      if (jsonSanitizado.startsWith('```')) {
        jsonSanitizado = jsonSanitizado.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      }

      const parsed = JSON.parse(jsonSanitizado);
      const listaPlanillas: any[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.planillas)
        ? parsed.planillas
        : parsed.filas || parsed.registros
        ? [parsed]
        : [];

      if (listaPlanillas.length === 0) throw new Error('El JSON no contiene planillas válidas.');

      const emparejamiento = archivosImagenes?.length
        ? emparejarImagenesConPlanillas(listaPlanillas, archivosImagenes)
        : { asignadas: [], sobrantes: [], planillasSinFoto: listaPlanillas };

      const mapaBase64 = new Map<File, string>();
      for (const { archivo } of emparejamiento.asignadas) {
        if (!mapaBase64.has(archivo)) {
          try {
            mapaBase64.set(archivo, await optimizarImagenBase64(archivo));
          } catch (e) {
            console.warn('Error optimizando foto:', e);
          }
        }
      }

      const mapaArchivosPorPlanilla = new Map<any, File>();
      emparejamiento.asignadas.forEach(({ planilla, archivo }) => mapaArchivosPorPlanilla.set(planilla, archivo));

      const hoyStr = new Date().toISOString().split('T')[0];
      let cantCargadas = 0;

      for (let idxP = 0; idxP < listaPlanillas.length; idxP++) {
        const p = listaPlanillas[idxP];
        const empHeader = (p.empleadoHeader || p.empleado || 'Empleado Externo').toUpperCase();
        const filasRaw = Array.isArray(p.filas) ? p.filas : Array.isArray(p.registros) ? p.registros : [];

        const filasProcesadas: FilaArmado[] = procesarFechasPlanilla(filasRaw, hoyStr).map((f: any, idxF: number) => ({
          id: f.id || `ext-f-${idxP}-${idxF}-${Date.now()}`,
          fecha: f.fecha || hoyStr,
          horaInicio: f.horaInicio || '',
          horaFin: f.horaFin || '',
          cantArticulos: Number(f.cantArticulos) || 0,
          notaIrregularidad: f.notaIrregularidad || null,
          esIrregular: Boolean(f.esIrregular),
          empleadoAsignado: empHeader,
        }));

        const archivoAsignado = mapaArchivosPorPlanilla.get(p);
        const imagenBase64 = archivoAsignado ? mapaBase64.get(archivoAsignado) || '' : '';
        const nombreOriginal =
          archivoAsignado?.name || p.nombreArchivo || p.nombreArchivoOriginal || `Importación Externa (JSON #${idxP + 1})`;

        const itemPendiente: RegistroArmadoDocumento = {
          id: `ext-${Date.now()}-${idxP}-${Math.random().toString(36).substring(2, 6)}`,
          empleadoHeader: empHeader,
          fechaPrimeraFila: filasProcesadas[0]?.fecha || hoyStr,
          horaInicioPrimeraFila: filasProcesadas[0]?.horaInicio || '00:00',
          estado: 'pendiente_verificacion',
          imagenBase64,
          nombreArchivoOriginal: nombreOriginal,
          creadoEn: new Date().toISOString(),
          filas: filasProcesadas,
        };

        const idReal = await guardarPlanillaPendienteFirestore(itemPendiente);
        if (!idReal) agregarItemPendiente(itemPendiente);
        cantCargadas++;
      }

      setCantFotosAsignadas(emparejamiento.asignadas.length);
      if (emparejamiento.sobrantes.length > 0) {
        setArchivosSobrantes(emparejamiento.sobrantes);
        setModalSobrantesAbierto(true);
      }

      const msg = `✨ Se cargaron exitosamente ${cantCargadas} planilla(s) externa(s)${
        emparejamiento.asignadas.length > 0 ? ` con ${emparejamiento.asignadas.length} foto(s) asociada(s)` : ''
      }.`;
      setExitoMensaje(msg);
      return {
        exito: true,
        cantidad: cantCargadas,
        asignadas: emparejamiento.asignadas.length,
        sobrantes: emparejamiento.sobrantes,
      };
    } catch (err: any) {
      const msg = err.message || 'El texto ingresado no es un formato JSON válido.';
      setErrorParse(msg);
      return { exito: false, cantidad: 0, asignadas: 0, sobrantes: [], error: msg };
    } finally {
      setCargando(false);
    }
  };

  const asignarFotosAPlanillasPendientes = async (archivos: File[]) => {
    if (!archivos.length) return { exito: false, asignadas: 0, sobrantes: [] };
    setCargando(true);
    try {
      const items = useArmadoStore.getState().itemsPendientes;
      const itemsSinFoto = items.filter((i) => !i.imagenBase64 || !i.imagenBase64.trim());
      if (itemsSinFoto.length === 0) {
        setArchivosSobrantes(archivos);
        setCantFotosAsignadas(0);
        setModalSobrantesAbierto(true);
        return { exito: true, asignadas: 0, sobrantes: archivos };
      }

      const emp = emparejarImagenesConPlanillas(itemsSinFoto, archivos);
      let count = 0;
      for (const { planilla, archivo } of emp.asignadas) {
        try {
          const b64 = await optimizarImagenBase64(archivo);
          const stateActual = useArmadoStore.getState();
          const idx = stateActual.itemsPendientes.findIndex((i) => i.id === planilla.id);
          if (idx !== -1) {
            const copia = [...stateActual.itemsPendientes];
            copia[idx] = { ...copia[idx], imagenBase64: b64, nombreArchivoOriginal: archivo.name };
            useArmadoStore.setState({ itemsPendientes: copia });
            guardarPlanillaPendienteFirestore(copia[idx]).catch(console.warn);
            count++;
          }
        } catch (e) {
          console.warn('Error asignando foto:', e);
        }
      }

      setCantFotosAsignadas(count);
      if (emp.sobrantes.length > 0) {
        setArchivosSobrantes(emp.sobrantes);
        setModalSobrantesAbierto(true);
      } else {
        setExitoMensaje(`✨ Se asociaron ${count} imagen(es) a planillas pendientes.`);
      }
      return { exito: true, asignadas: count, sobrantes: emp.sobrantes };
    } finally {
      setCargando(false);
    }
  };

  return {
    cargando,
    errorParse,
    exitoMensaje,
    archivosSobrantes,
    cantFotosAsignadas,
    modalSobrantesAbierto,
    setModalSobrantesAbierto,
    importarTextoJson,
    asignarFotosAPlanillasPendientes,
    setErrorParse,
    setExitoMensaje,
  };
}

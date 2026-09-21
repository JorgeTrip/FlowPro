// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useState } from 'react';
import { useArmadoStore } from '../stores/armadoStore';
import { RegistroArmadoDocumento, FilaArmado } from '../types/armado';
import { guardarPlanillaPendienteFirestore } from '../services/firestoreService';
import { procesarFechasPlanilla } from '../utils/fechaUtils';

/**
 * Hook que encapsula la lógica de validación, sanitización de Markdown
 * y persistencia en Firestore de planillas importadas desde JSON externo.
 */
export function useImportadorJsonExterno() {
  const { agregarItemPendiente } = useArmadoStore();
  const [cargando, setCargando] = useState(false);
  const [errorParse, setErrorParse] = useState<string | null>(null);
  const [exitoMensaje, setExitoMensaje] = useState<string | null>(null);

  const importarTextoJson = async (texto: string): Promise<{ exito: boolean; cantidad: number; error?: string }> => {
    setErrorParse(null);
    setExitoMensaje(null);

    const limpio = texto.trim();
    if (!limpio) {
      const msg = 'Por favor, pega el contenido JSON antes de importar.';
      setErrorParse(msg);
      return { exito: false, cantidad: 0, error: msg };
    }

    setCargando(true);
    try {
      // Se limpian posibles bloques de código Markdown generados por la IA
      let jsonSanitizado = limpio;
      if (jsonSanitizado.startsWith('```')) {
        jsonSanitizado = jsonSanitizado.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      }

      const parsed = JSON.parse(jsonSanitizado);
      let listaPlanillas: any[] = [];

      if (Array.isArray(parsed)) {
        listaPlanillas = parsed;
      } else if (Array.isArray(parsed.planillas)) {
        listaPlanillas = parsed.planillas;
      } else if (parsed.filas || parsed.registros) {
        listaPlanillas = [parsed];
      } else {
        throw new Error('El JSON no contiene una lista válida con "planillas" o "filas".');
      }

      if (listaPlanillas.length === 0) {
        throw new Error('El JSON no contiene ningún registro de planilla.');
      }

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

        const primeraFilaHora = filasProcesadas[0]?.horaInicio || '00:00';
        const primeraFilaFecha = filasProcesadas[0]?.fecha || hoyStr;

        const itemPendiente: RegistroArmadoDocumento = {
          id: `ext-${Date.now()}-${idxP}-${Math.random().toString(36).substring(2, 6)}`,
          empleadoHeader: empHeader,
          fechaPrimeraFila: primeraFilaFecha,
          horaInicioPrimeraFila: primeraFilaHora,
          estado: 'pendiente_verificacion',
          imagenBase64: '',
          nombreArchivoOriginal: `Importación Externa (JSON #${idxP + 1})`,
          creadoEn: new Date().toISOString(),
          filas: filasProcesadas,
        };

        const idReal = await guardarPlanillaPendienteFirestore(itemPendiente);
        if (!idReal) {
          agregarItemPendiente(itemPendiente);
        }
        cantCargadas++;
      }

      const msg = `✨ Se cargaron exitosamente ${cantCargadas} planilla(s) externa(s) a la cola de verificación.`;
      setExitoMensaje(msg);
      return { exito: true, cantidad: cantCargadas };
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'El texto ingresado no es un formato JSON válido.';
      setErrorParse(msg);
      return { exito: false, cantidad: 0, error: msg };
    } finally {
      setCargando(false);
    }
  };

  return {
    cargando,
    errorParse,
    exitoMensaje,
    importarTextoJson,
    setErrorParse,
    setExitoMensaje,
  };
}

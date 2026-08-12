// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { useState, useCallback } from 'react';
import { useArmadoStore } from '../stores/armadoStore';
import { guardarPlanillaVerificada } from '../services/firestoreService';
import { guardarImagenLocal } from '../services/localImageStore';
import { rotarImagenBase64 } from '../utils/imageUtils';

export function useLogicaVerificacion() {
  const {
    itemsPendientes,
    itemActualIndex,
    cantVerificadasLote,
    actualizarFilaActual,
    actualizarCabeceraActual,
    removerFilaActual,
    agregarFilaAItemActual,
    reemplazarFilasItemActual,
    saltarASiguientePlanilla,
    irAPlanillaAnterior,
    marcarActualComoVerificado,
    iniciarProgresoScan,
    actualizarProgresoScan,
    finalizarProgresoScan,
    cerrarModalVerificacion,
  } = useArmadoStore();

  const [guardando, setGuardando] = useState(false);
  const [reescaneando, setReescaneando] = useState(false);
  const [rotacionGrados, setRotacionGrados] = useState(0);
  const [mensajeReescanear, setMensajeReescanear] = useState<string | null>(null);

  const actual = itemsPendientes[itemActualIndex];
  const totalLote = cantVerificadasLote + itemsPendientes.length;
  const numActual = cantVerificadasLote + 1;
  const porcentajeProgreso =
    totalLote > 0 ? Math.round((cantVerificadasLote / totalLote) * 100) : 0;

  const faltaEmpleado =
    !actual ||
    !actual.empleadoHeader ||
    actual.empleadoHeader.trim() === '' ||
    actual.empleadoHeader === 'Empleado Desconocido';

  const handleConfirmar = useCallback(async () => {
    if (!actual) return;
    setGuardando(true);
    try {
      const docId = await guardarPlanillaVerificada(actual);
      if (actual.imagenBase64) {
        const imagenAGuardar =
          rotacionGrados !== 0
            ? await rotarImagenBase64(actual.imagenBase64, rotacionGrados)
            : actual.imagenBase64;
        await guardarImagenLocal(docId, imagenAGuardar);
      }

      const cantFilas = actual.filas.length;
      const cantArticulos = actual.filas.reduce((acc, f) => acc + (f.cantArticulos || 0), 0);
      marcarActualComoVerificado({
        empleado: actual.empleadoHeader,
        cantFilas,
        cantArticulos,
        guardadoEn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err: any) {
      console.error(err);
      alert(`Error al guardar en Firestore: ${err?.message || 'Error desconocido'}`);
    } finally {
      setGuardando(false);
    }
  }, [actual, rotacionGrados, marcarActualComoVerificado]);

  const handleReescanear = useCallback(async () => {
    if (!actual || !actual.imagenBase64) return;
    setReescaneando(true);
    setMensajeReescanear(null);

    iniciarProgresoScan(1);
    const nombreRef =
      actual.empleadoHeader && actual.empleadoHeader !== 'Empleado Desconocido'
        ? `Re-escaneo: ${actual.empleadoHeader}`
        : `Re-escaneo: Planilla #${numActual}`;

    actualizarProgresoScan({
      indiceActual: 1,
      nombreArchivo: nombreRef,
      porcentajePlanilla: 5,
      porcentajeGlobal: 100,
    });

    let pctLocal = 5;
    const timerProgreso = setInterval(() => {
      pctLocal = Math.min(92, pctLocal + Math.floor(Math.random() * 8) + 4);
      actualizarProgresoScan({ porcentajePlanilla: pctLocal });
    }, 180);

    try {
      const res = await fetch('/api/control-armado/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagenBase64: actual.imagenBase64,
          modoAltaPrecision: true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al re-escanear planilla.');
      }

      const data = await res.json();
      if (Array.isArray(data.filas)) {
        const nuevasFilas = data.filas.map((f: any, idx: number) => ({
          id: f.id || `f-reescan-${idx}-${Date.now()}`,
          fecha: f.fecha || actual.fechaPrimeraFila,
          horaInicio: f.horaInicio || '',
          horaFin: f.horaFin || '',
          cantArticulos: Number(f.cantArticulos) || 0,
          notaIrregularidad: f.notaIrregularidad || null,
          esIrregular: Boolean(f.esIrregular),
          empleadoAsignado: (data.empleadoHeader || actual.empleadoHeader || '').toUpperCase(),
        }));

        const headerUpper = (data.empleadoHeader || actual.empleadoHeader || '').toUpperCase();
        reemplazarFilasItemActual(nuevasFilas, headerUpper);
        setMensajeReescanear('✨ Re-escaneo completado con prompt de alta atención de IA.');

        clearInterval(timerProgreso);
        actualizarProgresoScan({ porcentajePlanilla: 100, porcentajeGlobal: 100 });
        setTimeout(() => setMensajeReescanear(null), 3000);
      }
    } catch (err: any) {
      clearInterval(timerProgreso);
      console.error(err);
      alert(`Error al re-escanear: ${err.message || 'Error desconocido'}`);
    } finally {
      setReescaneando(false);
      setTimeout(() => finalizarProgresoScan(), 1000);
    }
  }, [
    actual,
    numActual,
    iniciarProgresoScan,
    actualizarProgresoScan,
    reemplazarFilasItemActual,
    finalizarProgresoScan,
  ]);

  return {
    actual,
    itemsPendientes,
    numActual,
    totalLote,
    porcentajeProgreso,
    faltaEmpleado,
    guardando,
    reescaneando,
    rotacionGrados,
    setRotacionGrados,
    mensajeReescanear,
    handleConfirmar,
    handleReescanear,
    actualizarFilaActual,
    actualizarCabeceraActual,
    removerFilaActual,
    agregarFilaAItemActual,
    saltarASiguientePlanilla,
    irAPlanillaAnterior,
    cerrarModalVerificacion,
  };
}

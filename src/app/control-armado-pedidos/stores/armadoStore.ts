// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { indexedDBStorage } from '@/app/lib/indexedDBStorage';
import { FilaArmado } from '../types/armado';
import { ArmadoState } from './armadoStoreTypes';

export const useArmadoStore = create<ArmadoState>()(
  persist(
    (set, get) => ({
      itemsPendientes: [],
      itemActualIndex: 0,
      cantVerificadasLote: 0,
      cargandoScan: false,
      errorScan: null,
      alertaDuplicado: null,
      pestanaActiva: 'carga',
      ultimaGuardadaInfo: null,
      cancelarScanSolicitado: false,
      modalVerificacionAbierta: false,
      progresoScan: {
        activo: false,
        totalArchivos: 0,
        indiceActual: 0,
        nombreArchivo: '',
        porcentajePlanilla: 0,
        porcentajeGlobal: 0,
        minimizado: false,
        oculto: false,
      },

      setPestanaActiva: (pestanaActiva) => set({ pestanaActiva }),
      agregarItemPendiente: (item) => set((state) => ({ itemsPendientes: [...state.itemsPendientes, item] })),
      eliminarItemPendiente: (id) =>
        set((state) => {
          const nuevas = state.itemsPendientes.filter((i) => i.id !== id);
          return {
            itemsPendientes: nuevas,
            itemActualIndex: Math.min(state.itemActualIndex, Math.max(0, nuevas.length - 1)),
            cantVerificadasLote: nuevas.length === 0 ? 0 : state.cantVerificadasLote,
            modalVerificacionAbierta: nuevas.length === 0 ? false : state.modalVerificacionAbierta,
          };
        }),
      setItemActualIndex: (itemActualIndex) => set({ itemActualIndex }),
      setCargandoScan: (cargandoScan) => set({ cargandoScan }),
      setErrorScan: (errorScan) => set({ errorScan }),
      setAlertaDuplicado: (alertaDuplicado) => set({ alertaDuplicado }),
      setModalVerificacionAbierta: (modalVerificacionAbierta) => set({ modalVerificacionAbierta }),
      abrirModalVerificacion: (index) =>
        set((state) => ({
          modalVerificacionAbierta: true,
          itemActualIndex: typeof index === 'number' ? index : state.itemActualIndex,
        })),
      cerrarModalVerificacion: () => set({ modalVerificacionAbierta: false }),

      iniciarProgresoScan: (totalArchivos) =>
        set({
          progresoScan: {
            activo: true,
            totalArchivos,
            indiceActual: 1,
            nombreArchivo: '',
            porcentajePlanilla: 0,
            porcentajeGlobal: 0,
            minimizado: false,
            oculto: false,
          },
        }),
      actualizarProgresoScan: (updates) => set((state) => ({ progresoScan: { ...state.progresoScan, ...updates } })),
      setMinimizadoScan: (minimizado) => set((state) => ({ progresoScan: { ...state.progresoScan, minimizado } })),
      setOcultoScan: (oculto) => set((state) => ({ progresoScan: { ...state.progresoScan, oculto } })),
      finalizarProgresoScan: () => set((state) => ({ progresoScan: { ...state.progresoScan, activo: false } })),
      cancelarEscaneoLote: () =>
        set((state) => ({
          cancelarScanSolicitado: true,
          cargandoScan: false,
          progresoScan: { ...state.progresoScan, activo: false },
        })),
      resetCancelarScan: () => set({ cancelarScanSolicitado: false }),

      actualizarFilaActual: (filaId, updates) => {
        const { itemsPendientes, itemActualIndex } = get();
        if (!itemsPendientes[itemActualIndex]) return;
        const copia = [...itemsPendientes];
        const actual = { ...copia[itemActualIndex] };
        actual.filas = actual.filas.map((f) => (f.id === filaId ? { ...f, ...updates } : f));
        if (actual.filas.length > 0 && actual.filas[0].id === filaId && updates.fecha) {
          actual.fechaPrimeraFila = updates.fecha;
        }
        copia[itemActualIndex] = actual;
        set({ itemsPendientes: copia });
      },

      actualizarCabeceraActual: (empleadoHeader, fechaPlanilla) => {
        const { itemsPendientes, itemActualIndex } = get();
        if (!itemsPendientes[itemActualIndex]) return;
        const copia = [...itemsPendientes];
        const actual = { ...copia[itemActualIndex] };
        actual.empleadoHeader = empleadoHeader;
        if (fechaPlanilla) actual.fechaPlanilla = fechaPlanilla;
        actual.filas = actual.filas.map((f) => ({
          ...f,
          empleadoAsignado:
            f.accionIrregularidad === 'asignar_nuevo' && f.nuevoEmpleado ? f.nuevoEmpleado : empleadoHeader,
        }));
        copia[itemActualIndex] = actual;
        set({ itemsPendientes: copia });
      },

      removerFilaActual: (filaId) => {
        const { itemsPendientes, itemActualIndex } = get();
        if (!itemsPendientes[itemActualIndex]) return;
        const copia = [...itemsPendientes];
        const actual = { ...copia[itemActualIndex] };
        actual.filas = actual.filas.filter((f) => f.id !== filaId);
        copia[itemActualIndex] = actual;
        set({ itemsPendientes: copia });
      },

      agregarFilaAItemActual: (nuevaFila) => {
        const { itemsPendientes, itemActualIndex } = get();
        if (!itemsPendientes[itemActualIndex]) return;
        const copia = [...itemsPendientes];
        const actual = { ...copia[itemActualIndex] };
        const fDef = actual.fechaPrimeraFila || actual.fechaPlanilla || new Date().toISOString().split('T')[0];
        const filaNueva: FilaArmado = {
          id: `fila-man-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          fecha: fDef,
          horaInicio: '',
          horaFin: '',
          cantArticulos: 0,
          empleadoAsignado: actual.empleadoHeader,
          esIrregular: false,
          notaIrregularidad: null,
          ...nuevaFila,
        };
        actual.filas = [...actual.filas, filaNueva];
        copia[itemActualIndex] = actual;
        set({ itemsPendientes: copia });
      },

      reemplazarFilasItemActual: (nuevasFilas, nuevoEmpleadoHeader) => {
        const { itemsPendientes, itemActualIndex } = get();
        if (!itemsPendientes[itemActualIndex]) return;
        const copia = [...itemsPendientes];
        copia[itemActualIndex] = {
          ...copia[itemActualIndex],
          ...(nuevoEmpleadoHeader ? { empleadoHeader: nuevoEmpleadoHeader } : {}),
          filas: nuevasFilas,
        };
        set({ itemsPendientes: copia });
      },

      saltarASiguientePlanilla: () =>
        set((state) => ({
          itemActualIndex:
            state.itemsPendientes.length > 0 ? (state.itemActualIndex + 1) % state.itemsPendientes.length : 0,
        })),

      irAPlanillaAnterior: () =>
        set((state) => ({
          itemActualIndex:
            state.itemsPendientes.length > 0
              ? (state.itemActualIndex - 1 + state.itemsPendientes.length) % state.itemsPendientes.length
              : 0,
        })),

      marcarActualComoVerificado: (infoGuardada) => {
        const { itemsPendientes, itemActualIndex, cantVerificadasLote } = get();
        const res = itemsPendientes.filter((_, idx) => idx !== itemActualIndex);
        const nuevaCantVerificadas = cantVerificadasLote + 1;
        set({
          itemsPendientes: res,
          itemActualIndex: Math.max(0, Math.min(itemActualIndex, res.length - 1)),
          cantVerificadasLote: res.length === 0 ? 0 : nuevaCantVerificadas,
          modalVerificacionAbierta: res.length > 0,
          ...(infoGuardada ? { ultimaGuardadaInfo: infoGuardada } : {}),
        });
      },

      reset: () =>
        set({
          itemsPendientes: [],
          itemActualIndex: 0,
          cantVerificadasLote: 0,
          cargandoScan: false,
          errorScan: null,
          alertaDuplicado: null,
          ultimaGuardadaInfo: null,
          modalVerificacionAbierta: false,
        }),
    }),
    {
      name: 'flowpro-armado-store',
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({
        itemsPendientes: state.itemsPendientes,
        itemActualIndex: state.itemActualIndex,
        pestanaActiva: state.pestanaActiva,
        ultimaGuardadaInfo: state.ultimaGuardadaInfo,
        modalVerificacionAbierta: state.modalVerificacionAbierta,
      }),
    }
  )
);

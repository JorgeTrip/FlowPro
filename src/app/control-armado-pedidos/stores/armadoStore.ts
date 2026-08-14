// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { create } from 'zustand';
import { FilaArmado } from '../types/armado';
import { eliminarPlanillaVerificada } from '../services/firestoreService';
import { ArmadoState } from './armadoStoreTypes';
import { createScanSlice } from './armadoStoreScanSlice';

export const useArmadoStore = create<ArmadoState>()((set, get) => ({
  itemsPendientes: [],
  itemActualIndex: 0,
  cantVerificadasLote: 0,
  cargandoScan: false,
  errorScan: null,
  alertaDuplicado: null,
  pestanaActiva: 'carga',
  busquedaDatos: '',
  ultimaGuardadaInfo: null,
  modalVerificacionAbierta: false,
  ...createScanSlice(set),

  setPestanaActiva: (pestanaActiva) => set({ pestanaActiva }),
  setBusquedaDatos: (busquedaDatos) => set({ busquedaDatos }),
  setItemsPendientes: (itemsDeFirestore) =>
    set((state) => {
      const mapaLocal = new Map<string, any>();
      state.itemsPendientes.forEach((i) => i.id && mapaLocal.set(i.id, i));
      const idsFs = new Set(itemsDeFirestore.map((i) => i.id).filter(Boolean));
      const mapaFinal = new Map<string, any>();
      itemsDeFirestore.forEach((i) => i.id && mapaFinal.set(i.id, mapaLocal.get(i.id) || i));
      state.itemsPendientes.forEach((i) => {
        if (i.id && !idsFs.has(i.id) && (i.id.startsWith('scan-') || i.id.startsWith('ext-') || i.id.startsWith('mock-'))) {
          mapaFinal.set(i.id, i);
        }
      });
      const unicos = Array.from(mapaFinal.values());
      return {
        itemsPendientes: unicos,
        itemActualIndex: Math.min(state.itemActualIndex, Math.max(0, unicos.length - 1)),
        cantVerificadasLote: unicos.length === 0 ? 0 : state.cantVerificadasLote,
        modalVerificacionAbierta: unicos.length === 0 ? false : state.modalVerificacionAbierta,
      };
    }),
  agregarItemPendiente: (item) =>
    set((state) => {
      if (item.id && state.itemsPendientes.some((i) => i.id === item.id)) return state;
      return { itemsPendientes: [...state.itemsPendientes, item] };
    }),
  eliminarItemPendiente: (id) => {
    eliminarPlanillaVerificada(id).catch((e) => console.warn('Error al eliminar borrador de Firestore:', e));
    set((state) => {
      const nuevas = state.itemsPendientes.filter((i) => i.id !== id);
      return {
        itemsPendientes: nuevas,
        itemActualIndex: Math.min(state.itemActualIndex, Math.max(0, nuevas.length - 1)),
        cantVerificadasLote: nuevas.length === 0 ? 0 : state.cantVerificadasLote,
        modalVerificacionAbierta: nuevas.length === 0 ? false : state.modalVerificacionAbierta,
      };
    });
  },
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
      empleadoAsignado: f.accionIrregularidad === 'asignar_nuevo' && f.nuevoEmpleado ? f.nuevoEmpleado : empleadoHeader,
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
      itemActualIndex: state.itemsPendientes.length > 0 ? (state.itemActualIndex + 1) % state.itemsPendientes.length : 0,
    })),

  irAPlanillaAnterior: () =>
    set((state) => ({
      itemActualIndex:
        state.itemsPendientes.length > 0 ? (state.itemActualIndex - 1 + state.itemsPendientes.length) % state.itemsPendientes.length : 0,
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
      busquedaDatos: '',
      ultimaGuardadaInfo: null,
      modalVerificacionAbierta: false,
    }),
}));

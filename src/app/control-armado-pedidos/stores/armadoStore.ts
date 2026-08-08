// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { indexedDBStorage } from '@/app/lib/indexedDBStorage';
import { RegistroArmadoDocumento, FilaArmado } from '../types/armado';

interface UltimoGuardadoInfo {
  empleado: string;
  cantFilas: number;
  cantArticulos: number;
  guardadoEn: string;
}

export interface ProgresoScanInfo {
  activo: boolean;
  totalArchivos: number;
  indiceActual: number;
  nombreArchivo: string;
  porcentajePlanilla: number;
  porcentajeGlobal: number;
  minimizado: boolean;
  oculto: boolean;
  mensajeEstado?: string;
}

interface ArmadoState {
  itemsPendientes: RegistroArmadoDocumento[];
  itemActualIndex: number;
  cantVerificadasLote: number;
  cargandoScan: boolean;
  errorScan: string | null;
  alertaDuplicado: string | null;
  pestanaActiva: 'carga' | 'datos' | 'analisis';
  ultimaGuardadaInfo: UltimoGuardadoInfo | null;
  progresoScan: ProgresoScanInfo;
  cancelarScanSolicitado: boolean;

  setPestanaActiva: (pestana: 'carga' | 'datos' | 'analisis') => void;
  agregarItemPendiente: (item: RegistroArmadoDocumento) => void;
  eliminarItemPendiente: (id: string) => void;
  setItemActualIndex: (index: number) => void;
  setCargandoScan: (cargando: boolean) => void;
  setErrorScan: (error: string | null) => void;
  setAlertaDuplicado: (alerta: string | null) => void;

  iniciarProgresoScan: (totalArchivos: number) => void;
  actualizarProgresoScan: (updates: Partial<ProgresoScanInfo>) => void;
  setMinimizadoScan: (minimizado: boolean) => void;
  setOcultoScan: (oculto: boolean) => void;
  finalizarProgresoScan: () => void;
  cancelarEscaneoLote: () => void;
  resetCancelarScan: () => void;

  actualizarFilaActual: (filaId: string, updates: Partial<FilaArmado>) => void;
  actualizarCabeceraActual: (empleadoHeader: string, fechaPlanilla: string) => void;
  removerFilaActual: (filaId: string) => void;
  reemplazarFilasItemActual: (filas: FilaArmado[], empleadoHeader?: string) => void;
  saltarASiguientePlanilla: () => void;
  irAPlanillaAnterior: () => void;
  marcarActualComoVerificado: (infoGuardada?: UltimoGuardadoInfo) => void;
  reset: () => void;
}

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
      agregarItemPendiente: (item) =>
        set((state) => ({ itemsPendientes: [...state.itemsPendientes, item] })),
      eliminarItemPendiente: (id) =>
        set((state) => {
          const nuevas = state.itemsPendientes.filter((i) => i.id !== id);
          return {
            itemsPendientes: nuevas,
            itemActualIndex: Math.min(state.itemActualIndex, Math.max(0, nuevas.length - 1)),
            cantVerificadasLote: nuevas.length === 0 ? 0 : state.cantVerificadasLote,
          };
        }),
      setItemActualIndex: (itemActualIndex) => set({ itemActualIndex }),
      setCargandoScan: (cargandoScan) => set({ cargandoScan }),
      setErrorScan: (errorScan) => set({ errorScan }),
      setAlertaDuplicado: (alertaDuplicado) => set({ alertaDuplicado }),

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

      actualizarProgresoScan: (updates) =>
        set((state) => ({
          progresoScan: { ...state.progresoScan, ...updates },
        })),

      setMinimizadoScan: (minimizado) =>
        set((state) => ({
          progresoScan: { ...state.progresoScan, minimizado },
        })),

      setOcultoScan: (oculto) =>
        set((state) => ({
          progresoScan: { ...state.progresoScan, oculto },
        })),

      finalizarProgresoScan: () =>
        set((state) => ({
          progresoScan: { ...state.progresoScan, activo: false },
        })),

      cancelarEscaneoLote: () =>
        set((state) => ({
          cancelarScanSolicitado: true,
          cargandoScan: false,
          progresoScan: { ...state.progresoScan, activo: false },
        })),

      resetCancelarScan: () =>
        set({ cancelarScanSolicitado: false }),

      actualizarFilaActual: (filaId, updates) => {
        const { itemsPendientes, itemActualIndex } = get();
        if (!itemsPendientes[itemActualIndex]) return;
        const copia = [...itemsPendientes];
        const actual = { ...copia[itemActualIndex] };
        actual.filas = actual.filas.map((f) => (f.id === filaId ? { ...f, ...updates } : f));
        copia[itemActualIndex] = actual;
        set({ itemsPendientes: copia });
      },

      actualizarCabeceraActual: (empleadoHeader, fechaPlanilla) => {
        const { itemsPendientes, itemActualIndex } = get();
        if (!itemsPendientes[itemActualIndex]) return;
        const copia = [...itemsPendientes];
        copia[itemActualIndex] = {
          ...copia[itemActualIndex],
          empleadoHeader,
          fechaPlanilla,
        };
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
            state.itemsPendientes.length > 0
              ? (state.itemActualIndex + 1) % state.itemsPendientes.length
              : 0,
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
      }),
    }
  )
);

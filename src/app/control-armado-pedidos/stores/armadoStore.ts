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

interface ArmadoState {
  itemsPendientes: RegistroArmadoDocumento[];
  itemActualIndex: number;
  cargandoScan: boolean;
  errorScan: string | null;
  alertaDuplicado: string | null;
  pestanaActiva: 'carga' | 'datos' | 'analisis';
  ultimaGuardadaInfo: UltimoGuardadoInfo | null;

  setPestanaActiva: (pestana: 'carga' | 'datos' | 'analisis') => void;
  agregarItemPendiente: (item: RegistroArmadoDocumento) => void;
  eliminarItemPendiente: (id: string) => void;
  setItemActualIndex: (index: number) => void;
  setCargandoScan: (cargando: boolean) => void;
  setErrorScan: (error: string | null) => void;
  setAlertaDuplicado: (alerta: string | null) => void;

  actualizarFilaActual: (filaId: string, updates: Partial<FilaArmado>) => void;
  actualizarCabeceraActual: (empleadoHeader: string, fechaPlanilla: string) => void;
  removerFilaActual: (filaId: string) => void;
  marcarActualComoVerificado: (infoGuardada?: UltimoGuardadoInfo) => void;
  reset: () => void;
}

export const useArmadoStore = create<ArmadoState>()(
  persist(
    (set, get) => ({
      itemsPendientes: [],
      itemActualIndex: 0,
      cargandoScan: false,
      errorScan: null,
      alertaDuplicado: null,
      pestanaActiva: 'carga',
      ultimaGuardadaInfo: null,

      setPestanaActiva: (pestanaActiva) => set({ pestanaActiva }),
      agregarItemPendiente: (item) =>
        set((state) => ({ itemsPendientes: [...state.itemsPendientes, item] })),
      eliminarItemPendiente: (id) =>
        set((state) => {
          const nuevas = state.itemsPendientes.filter((i) => i.id !== id);
          return {
            itemsPendientes: nuevas,
            itemActualIndex: Math.min(state.itemActualIndex, Math.max(0, nuevas.length - 1)),
          };
        }),
      setItemActualIndex: (itemActualIndex) => set({ itemActualIndex }),
      setCargandoScan: (cargandoScan) => set({ cargandoScan }),
      setErrorScan: (errorScan) => set({ errorScan }),
      setAlertaDuplicado: (alertaDuplicado) => set({ alertaDuplicado }),

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

      marcarActualComoVerificado: (infoGuardada) => {
        const { itemsPendientes, itemActualIndex } = get();
        const res = itemsPendientes.filter((_, idx) => idx !== itemActualIndex);
        set({
          itemsPendientes: res,
          itemActualIndex: Math.max(0, Math.min(itemActualIndex, res.length - 1)),
          ...(infoGuardada ? { ultimaGuardadaInfo: infoGuardada } : {}),
        });
      },

      reset: () =>
        set({
          itemsPendientes: [],
          itemActualIndex: 0,
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

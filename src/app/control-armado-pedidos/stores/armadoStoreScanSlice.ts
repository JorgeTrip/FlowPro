// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { ProgresoScanInfo } from './armadoStoreTypes';
import { PROGRESO_SCAN_INICIAL } from './armadoStoreDefaults';

export interface ScanSlice {
  progresoScan: ProgresoScanInfo;
  cancelarScanSolicitado: boolean;
  iniciarProgresoScan: (totalArchivos: number) => void;
  actualizarProgresoScan: (updates: Partial<ProgresoScanInfo>) => void;
  setMinimizadoScan: (minimizado: boolean) => void;
  setOcultoScan: (oculto: boolean) => void;
  finalizarProgresoScan: () => void;
  cancelarEscaneoLote: () => void;
  resetCancelarScan: () => void;
}

export const createScanSlice = (set: any): ScanSlice => ({
  progresoScan: PROGRESO_SCAN_INICIAL,
  cancelarScanSolicitado: false,

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
  actualizarProgresoScan: (updates) => set((state: any) => ({ progresoScan: { ...state.progresoScan, ...updates } })),
  setMinimizadoScan: (minimizado) => set((state: any) => ({ progresoScan: { ...state.progresoScan, minimizado } })),
  setOcultoScan: (oculto) => set((state: any) => ({ progresoScan: { ...state.progresoScan, oculto } })),
  finalizarProgresoScan: () => set((state: any) => ({ progresoScan: { ...state.progresoScan, activo: false } })),
  cancelarEscaneoLote: () =>
    set((state: any) => ({
      cancelarScanSolicitado: true,
      cargandoScan: false,
      progresoScan: { ...state.progresoScan, activo: false },
    })),
  resetCancelarScan: () => set({ cancelarScanSolicitado: false }),
});

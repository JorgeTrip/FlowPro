// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { RegistroArmadoDocumento, FilaArmado } from '../types/armado';

export interface UltimoGuardadoInfo {
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

export interface ArmadoState {
  itemsPendientes: RegistroArmadoDocumento[];
  itemActualIndex: number;
  cantVerificadasLote: number;
  cargandoScan: boolean;
  errorScan: string | null;
  alertaDuplicado: string | null;
  pestanaActiva: 'carga' | 'datos' | 'analisis';
  busquedaDatos: string;
  ultimaGuardadaInfo: UltimoGuardadoInfo | null;
  progresoScan: ProgresoScanInfo;
  cancelarScanSolicitado: boolean;
  modalVerificacionAbierta: boolean;

  setPestanaActiva: (pestana: 'carga' | 'datos' | 'analisis') => void;
  setBusquedaDatos: (busqueda: string) => void;
  setItemsPendientes: (items: RegistroArmadoDocumento[]) => void;
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

  setModalVerificacionAbierta: (abierta: boolean) => void;
  abrirModalVerificacion: (index?: number) => void;
  cerrarModalVerificacion: () => void;

  actualizarFilaActual: (filaId: string, updates: Partial<FilaArmado>) => void;
  actualizarCabeceraActual: (empleadoHeader: string, fechaPlanilla: string) => void;
  removerFilaActual: (filaId: string) => void;
  agregarFilaAItemActual: (nuevaFila?: Partial<FilaArmado>) => void;
  reemplazarFilasItemActual: (filas: FilaArmado[], empleadoHeader?: string) => void;
  saltarASiguientePlanilla: () => void;
  irAPlanillaAnterior: () => void;
  marcarActualComoVerificado: (infoGuardada?: UltimoGuardadoInfo) => void;
  reset: () => void;
}

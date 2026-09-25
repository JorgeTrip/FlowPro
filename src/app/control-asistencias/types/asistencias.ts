import type { ExcelRow } from '@/app/stores/estimarDemandaStore';

export type TimeHHMM = string; // formato "HH:mm"

export interface AsistenciaConfig {
  mapeo: {
    empleado: string;
    fecha: string;
    hora: string;
    tipo: string; // Entrada/Salida
  } | null;
  defaults: {
    entrada: TimeHHMM;
    salida: TimeHHMM; // por defecto 17:00
    almuerzoInicio: TimeHHMM; // inicio franja
    almuerzoFin: TimeHHMM; // fin franja
    almuerzoDuracionMin: number; // minutos
    francos: number[]; // 0=Dom ... 6=Sab
  };
  horariosPorEmpleado: Record<string, Partial<{
    entrada: TimeHHMM;
    salida: TimeHHMM;
    almuerzoInicio: TimeHHMM;
    almuerzoFin: TimeHHMM;
    almuerzoDuracionMin: number;
    francosExtra: number[];
  }>>;
}

export interface AttendanceEvent {
  empleado: string;
  fecha: string; // YYYY-MM-DD
  hora: TimeHHMM; // HH:mm
  tipo: 'Entrada' | 'Salida';
}

export interface DayAnalysisRow {
  empleado: string;
  fecha: string;
  horaEntrada?: TimeHHMM;
  horaSalida?: TimeHHMM;
  entradaProgramada: TimeHHMM;
  salidaProgramada: TimeHHMM;
  tardanzaMin: number; // > 0 si llegó tarde
  retiroAnticipadoMin: number; // > 0 si se fue antes
  almuerzoInicio?: TimeHHMM;
  almuerzoFin?: TimeHHMM;
  almuerzoDuracionMin?: number;
  almuerzoFueraFranja: boolean;
  almuerzoExcedido: boolean;
  ausente: boolean;
}

export interface AsistenciasState {
  // Stepper
  step: number;

  // Excel
  fichadasFile: File | null;
  fichadasData: ExcelRow[];
  fichadasPreviewData: ExcelRow[];
  fichadasColumnas: string[];

  // Configuración
  config: AsistenciaConfig;

  // Derivados básicos
  empleados: string[]; // únicos a partir de fichadas
  eventos: AttendanceEvent[]; // normalizados tras configurar mapeo

  // Estado UI
  isLoading: boolean;
  error: string | null;

  // Actions
  setStep: (step: number) => void;
  setFichadasFile: (file: File | null) => void;
  setFichadasData: (data: ExcelRow[], columnas: string[], previewData: ExcelRow[]) => void;
  setMapeo: (mapeo: AsistenciaConfig['mapeo']) => void;
  setDefaultConfig: (defaults: Partial<AsistenciaConfig['defaults']>) => void;
  setHorarioEmpleado: (empleado: string, cambios: Partial<AsistenciaConfig['horariosPorEmpleado'][string]>) => void;
  normalizarEventos: () => void;
  recomputarEmpleados: () => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

import { create } from 'zustand';
import type {
  TimeHHMM,
  AsistenciaConfig,
  AttendanceEvent,
  DayAnalysisRow,
  AsistenciasState,
} from '../control-asistencias/types/asistencias';
import {
  generarEventosNormalizados,
  analizarDia,
} from '../control-asistencias/utils/analizadorAsistencias';

// Re-exportamos tipos y funciones para compatibilidad
export type { TimeHHMM, AsistenciaConfig, AttendanceEvent, DayAnalysisRow, AsistenciasState };
export { analizarDia };

const initialState: Omit<
  AsistenciasState,
  | 'setStep'
  | 'setFichadasFile'
  | 'setFichadasData'
  | 'setMapeo'
  | 'setDefaultConfig'
  | 'setHorarioEmpleado'
  | 'normalizarEventos'
  | 'recomputarEmpleados'
  | 'setIsLoading'
  | 'setError'
  | 'reset'
> = {
  step: 1,
  fichadasFile: null,
  fichadasData: [],
  fichadasPreviewData: [],
  fichadasColumnas: [],
  config: {
    mapeo: null,
    defaults: {
      entrada: '08:00',
      salida: '17:00',
      almuerzoInicio: '12:00',
      almuerzoFin: '15:30',
      almuerzoDuracionMin: 45,
      francos: [0, 6],
    },
    horariosPorEmpleado: {},
  },
  empleados: [],
  eventos: [],
  isLoading: false,
  error: null,
};

export const useAsistenciasStore = create<AsistenciasState>()((set, get) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setFichadasFile: (file) => set({ fichadasFile: file, step: 1 }),
  setFichadasData: (data, columnas, previewData) =>
    set({ fichadasData: data, fichadasColumnas: columnas, fichadasPreviewData: previewData }),
  setMapeo: (mapeo) => set((state) => ({ config: { ...state.config, mapeo } })),
  setDefaultConfig: (defaults) =>
    set((state) => ({ config: { ...state.config, defaults: { ...state.config.defaults, ...defaults } } })),
  setHorarioEmpleado: (empleado, cambios) =>
    set((state) => ({
      config: {
        ...state.config,
        horariosPorEmpleado: {
          ...state.config.horariosPorEmpleado,
          [empleado]: { ...(state.config.horariosPorEmpleado[empleado] || {}), ...cambios },
        },
      },
    })),
  recomputarEmpleados: () => {
    const { fichadasData, config } = get();
    const empleadoCol = config.mapeo?.empleado || '';
    const setEmpleadoSet = new Set<string>();
    fichadasData.forEach((row) => {
      const raw = row[empleadoCol];
      const name = String(raw ?? '').trim();
      if (name) setEmpleadoSet.add(name);
    });
    set({ empleados: Array.from(setEmpleadoSet).sort() });
  },
  normalizarEventos: () => {
    const { fichadasData, config } = get();
    const eventos = generarEventosNormalizados(fichadasData, config);
    set({ eventos });
  },
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));

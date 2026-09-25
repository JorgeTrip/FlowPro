// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

export type AccionIrregularidad = 'asignar_cabecera' | 'asignar_nuevo' | 'ignorar';

export type TipoTareaFila = 'armado' | 'atencion_cliente' | 'produccion' | 'otros';

export interface DesgloseOtrasTareas {
  atencionClienteHs: number;
  produccionHs: number;
  otrosHs: number;
}

export interface FilaArmado {
  id: string;
  fecha: string; // YYYY-MM-DD por fila
  horaInicio: string; // HH:MM
  horaFin: string; // HH:MM
  cantArticulos: number;
  notaIrregularidad: string | null;
  esIrregular: boolean;
  empleadoAsignado?: string;
  accionIrregularidad?: AccionIrregularidad;
  nuevoEmpleado?: string;
  tipoTarea?: TipoTareaFila;
  detalleOtraTarea?: string;
}

export interface PlanillaScanResult {
  empleadoHeader: string;
  fechaPlanilla?: string; // Mantenido opcional por compatibilidad
  filas: FilaArmado[];
}

export interface RegistroArmadoDocumento {
  id?: string;
  userId?: string;
  empleadoHeader: string;
  fechaPlanilla?: string;
  fechaPrimeraFila: string;
  horaInicioPrimeraFila: string;
  estado: 'pendiente_verificacion' | 'verificado';
  imagenUrl?: string;
  imagenBase64?: string;
  nombreArchivoOriginal?: string;
  filas: FilaArmado[];
  creadoEn: string;
  verificadoEn?: string;
}

export interface FiltrosAnalisis {
  rango: 'todos' | 'dia' | 'semana' | 'mes' | 'personalizado';
  fechaInicio?: string;
  fechaFin?: string;
  empleado?: string;
}

export interface MetricasKpi {
  totalPedidos: number;
  totalArticulos: number;
  velocidadPromedioEq: number; // Art/hs
  tiempoMedioPedidoMin: number; // Min/pedido
}

export interface RendimientoEmpleado {
  empleado: string;
  totalPedidos: number;
  totalArticulos: number;
  horasTrabajadas: number; // Mantenido por compatibilidad (= horasTotales)
  horasArmado: number;
  horasOtrasTareas: number;
  horasTotales: number;
  desgloseOtrasTareas: DesgloseOtrasTareas;
  velocidadArtHs: number;
  tiempoMedioMin: number;
  totalIrregularidades: number;
}

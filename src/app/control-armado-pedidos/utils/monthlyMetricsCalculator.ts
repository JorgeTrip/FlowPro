import { RegistroArmadoDocumento } from '../types/armado';
import { calcularDiferenciaMinutos } from './metricsCalculator';
import { normalizarFechaYYYYMMDD } from '../services/firestoreService';

export interface InfoMes {
  clave: string; // ej: '2026-07'
  etiqueta: string; // ej: 'Jul 2026'
  etiquetaCorta: string; // ej: 'Jul'
  color: string;
}

export interface ResultadoRendimientoMensual {
  meses: InfoMes[];
  datosVelocidad: Array<{ empleado: string; [claveMes: string]: any }>;
  datosPedidos: Array<{ empleado: string; [claveMes: string]: any }>;
}

const PALETA_COLORES_MESES = [
  '#3B82F6', // Azul
  '#10B981', // Esmeralda
  '#8B5CF6', // Violeta
  '#F59E0B', // Ámbar
  '#EC4899', // Rosa
  '#06B6D4', // Cyan
  '#F97316', // Naranja
  '#6366F1', // Índigo
  '#14B8A6', // Teal
  '#D946EF', // Fucsia
];

const NOMBRES_MESES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export function formatearEtiquetaMes(claveMes: string): string {
  const [anioStr, mesStr] = claveMes.split('-');
  const anio = parseInt(anioStr, 10);
  const mesNum = parseInt(mesStr, 10);
  if (isNaN(anio) || isNaN(mesNum) || mesNum < 1 || mesNum > 12) return claveMes;
  return `${NOMBRES_MESES[mesNum - 1]} ${anio}`;
}

export function calcularRendimientoMensualPorEmpleado(
  registros: RegistroArmadoDocumento[]
): ResultadoRendimientoMensual {
  const mapaMeses = new Set<string>();
  const mapaEmpMes = new Map<string, Map<string, { pedidos: number; articulos: number; minutos: number }>>();

    registros.forEach((reg) => {
    reg.filas?.forEach((f) => {
      if (f.accionIrregularidad === 'ignorar') return;

      const emp = f.empleadoAsignado || f.nuevoEmpleado || reg.empleadoHeader;
      const fechaRaw = f.fecha || reg.fechaPrimeraFila || (reg.creadoEn ? reg.creadoEn.split('T')[0] : '');
      const fechaNorm = normalizarFechaYYYYMMDD(fechaRaw);
      if (!fechaNorm || fechaNorm.length < 7) return;

      const claveMes = fechaNorm.substring(0, 7); // 'YYYY-MM'
      mapaMeses.add(claveMes);

      if (claveMes === '2026-06') {
        console.log(`[DIAG-JUNIO] DocID: ${reg.id} | EmpHeader: "${reg.empleadoHeader}" | FilaEmp: "${emp}" | RowFechaRaw: "${f.fecha}" | DocFechaPrimera: "${reg.fechaPrimeraFila}" | FechaNorm: "${fechaNorm}"`);
      }

      if (!mapaEmpMes.has(emp)) {
        mapaEmpMes.set(emp, new Map());
      }
      const mesMap = mapaEmpMes.get(emp)!;
      const actual = mesMap.get(claveMes) || { pedidos: 0, articulos: 0, minutos: 0 };
      actual.pedidos += 1;
      actual.articulos += f.cantArticulos || 0;
      actual.minutos += calcularDiferenciaMinutos(f.horaInicio, f.horaFin);
      mesMap.set(claveMes, actual);
    });
  });

  console.log('[DIAG-CALC-MENSUAL] Meses detectados:', Array.from(mapaMeses), 'Empleados:', Array.from(mapaEmpMes.keys()));

  const mesesOrdenados = Array.from(mapaMeses).sort();
  const infoMeses: InfoMes[] = mesesOrdenados.map((m, idx) => {
    const [anioStr, mesStr] = m.split('-');
    const mesNum = parseInt(mesStr, 10);
    const nombreMes = mesNum >= 1 && mesNum <= 12 ? NOMBRES_MESES[mesNum - 1] : m;
    return {
      clave: m,
      etiqueta: `${nombreMes} ${anioStr}`,
      etiquetaCorta: nombreMes,
      color: PALETA_COLORES_MESES[idx % PALETA_COLORES_MESES.length],
    };
  });

  const empleados = Array.from(mapaEmpMes.keys()).sort();
  const datosVelocidad: Array<{ empleado: string; [claveMes: string]: any }> = [];
  const datosPedidos: Array<{ empleado: string; [claveMes: string]: any }> = [];

  empleados.forEach((emp) => {
    const mesMap = mapaEmpMes.get(emp)!;
    const objVel: { empleado: string; [claveMes: string]: any } = { empleado: emp };
    const objPed: { empleado: string; [claveMes: string]: any } = { empleado: emp };

    mesesOrdenados.forEach((m) => {
      const stats = mesMap.get(m);
      if (stats) {
        const horas = Math.round((stats.minutos / 60) * 10) / 10;
        const vel = horas > 0 ? Math.round(stats.articulos / horas) : 0;
        objVel[m] = vel;
        objPed[m] = stats.pedidos;
      } else {
        objVel[m] = 0;
        objPed[m] = 0;
      }
    });

    datosVelocidad.push(objVel);
    datosPedidos.push(objPed);
  });

  return {
    meses: infoMeses,
    datosVelocidad,
    datosPedidos,
  };
}

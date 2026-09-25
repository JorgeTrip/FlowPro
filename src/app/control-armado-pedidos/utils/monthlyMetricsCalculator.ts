// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import type { RegistroArmadoDocumento } from '../types/armado.ts';
import { calcularDiferenciaMinutos } from './metricsCalculator.ts';
import { normalizarFechaYYYYMMDD } from './normalizadorFechas.ts';

export interface InfoMes {
  clave: string; // ej: '2026-07'
  etiqueta: string; // ej: 'Jul 2026'
  etiquetaCorta: string; // ej: 'Jul'
  color: string;
}

export interface MetricasMesEmpleado {
  pedidos: number;
  articulos: number;
  horasArmado: number;
  horasOtrasTareas: number;
  horasTotales: number;
  velocidadArtHs: number;
  tiempoMedioMin: number;
  desgloseOtrasTareas: {
    atencionClienteHs: number;
    produccionHs: number;
    otrosHs: number;
  };
}

export interface ResultadoRendimientoMensual {
  meses: InfoMes[];
  datosVelocidad: Array<{ empleado: string; [claveMes: string]: any }>;
  datosPedidos: Array<{ empleado: string; [claveMes: string]: any }>;
  mapaDetalleEmpleado: Map<string, Map<string, MetricasMesEmpleado>>;
}

const PALETA_COLORES_MESES = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899',
  '#06B6D4', '#F97316', '#6366F1', '#14B8A6', '#D946EF',
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

interface AcumuladorMes {
  pedidos: number;
  articulos: number;
  minutosArmado: number;
  minutosAtencionCliente: number;
  minutosProduccion: number;
  minutosOtros: number;
}

export function calcularRendimientoMensualPorEmpleado(
  registros: RegistroArmadoDocumento[]
): ResultadoRendimientoMensual {
  const mapaMeses = new Set<string>();
  const mapaEmpMes = new Map<string, Map<string, AcumuladorMes>>();

  registros.forEach((reg) => {
    reg.filas?.forEach((f) => {
      if (f.accionIrregularidad === 'ignorar') return;

      const emp = f.empleadoAsignado || f.nuevoEmpleado || reg.empleadoHeader;
      const fechaRaw = f.fecha || reg.fechaPrimeraFila || (reg.creadoEn ? reg.creadoEn.split('T')[0] : '');
      const fechaNorm = normalizarFechaYYYYMMDD(fechaRaw);
      if (!fechaNorm || fechaNorm.length < 7) return;

      const claveMes = fechaNorm.substring(0, 7);
      mapaMeses.add(claveMes);

      if (!mapaEmpMes.has(emp)) {
        mapaEmpMes.set(emp, new Map());
      }
      const mesMap = mapaEmpMes.get(emp)!;
      const actual = mesMap.get(claveMes) || {
        pedidos: 0,
        articulos: 0,
        minutosArmado: 0,
        minutosAtencionCliente: 0,
        minutosProduccion: 0,
        minutosOtros: 0,
      };

      const minutos = calcularDiferenciaMinutos(f.horaInicio, f.horaFin);

      if (f.tipoTarea === 'atencion_cliente') {
        actual.minutosAtencionCliente += minutos;
      } else if (f.tipoTarea === 'produccion') {
        actual.minutosProduccion += minutos;
      } else if (f.tipoTarea === 'otros') {
        actual.minutosOtros += minutos;
      } else {
        actual.pedidos += 1;
        actual.articulos += f.cantArticulos || 0;
        actual.minutosArmado += minutos;
      }

      mesMap.set(claveMes, actual);
    });
  });

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
  const mapaDetalleEmpleado = new Map<string, Map<string, MetricasMesEmpleado>>();

  empleados.forEach((emp) => {
    const mesMap = mapaEmpMes.get(emp)!;
    const objVel: { empleado: string; [claveMes: string]: any } = { empleado: emp };
    const objPed: { empleado: string; [claveMes: string]: any } = { empleado: emp };
    const detalleMesMap = new Map<string, MetricasMesEmpleado>();

    mesesOrdenados.forEach((m) => {
      const stats = mesMap.get(m);
      if (stats) {
        const horasArmado = Math.round((stats.minutosArmado / 60) * 10) / 10;
        const atencionHs = Math.round((stats.minutosAtencionCliente / 60) * 10) / 10;
        const prodHs = Math.round((stats.minutosProduccion / 60) * 10) / 10;
        const otrosHs = Math.round((stats.minutosOtros / 60) * 10) / 10;
        const horasOtrasTareas = Math.round((atencionHs + prodHs + otrosHs) * 10) / 10;
        const horasTotales = Math.round((horasArmado + horasOtrasTareas) * 10) / 10;
        const vel = horasArmado > 0 ? Math.round(stats.articulos / horasArmado) : 0;
        const tiempoMedio = stats.pedidos > 0 ? Math.round((stats.minutosArmado / stats.pedidos) * 10) / 10 : 0;

        objVel[m] = vel;
        objPed[m] = stats.pedidos;

        detalleMesMap.set(m, {
          pedidos: stats.pedidos,
          articulos: stats.articulos,
          horasArmado,
          horasOtrasTareas,
          horasTotales,
          velocidadArtHs: vel,
          tiempoMedioMin: tiempoMedio,
          desgloseOtrasTareas: {
            atencionClienteHs: atencionHs,
            produccionHs: prodHs,
            otrosHs,
          },
        });
      } else {
        objVel[m] = 0;
        objPed[m] = 0;
        detalleMesMap.set(m, {
          pedidos: 0,
          articulos: 0,
          horasArmado: 0,
          horasOtrasTareas: 0,
          horasTotales: 0,
          velocidadArtHs: 0,
          tiempoMedioMin: 0,
          desgloseOtrasTareas: { atencionClienteHs: 0, produccionHs: 0, otrosHs: 0 },
        });
      }
    });

    datosVelocidad.push(objVel);
    datosPedidos.push(objPed);
    mapaDetalleEmpleado.set(emp, detalleMesMap);
  });

  return {
    meses: infoMeses,
    datosVelocidad,
    datosPedidos,
    mapaDetalleEmpleado,
  };
}

// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import type { RegistroArmadoDocumento } from '../types/armado.ts';
import { calcularDiferenciaMinutos } from './metricsCalculator.ts';

export interface ItemGraficoTorta {
  name: string;
  value: number; // Horas
  color: string;
  porcentaje: number;
  porcentajeTexto: string;
}

export interface DistribucionTareasEmpleado {
  empleado: string;
  horasArmado: number;
  horasAtencionCliente: number;
  horasProduccion: number;
  horasOtros: number;
  horasTotales: number;
  porcentajes: {
    armado: number;
    atencionCliente: number;
    produccion: number;
    otros: number;
  };
  itemsGrafico: ItemGraficoTorta[];
}

export const COLORES_TAREAS = {
  armado: '#3B82F6', // Azul Pro
  atencionCliente: '#10B981', // Verde Esmeralda
  produccion: '#F59E0B', // Ámbar
  otros: '#8B5CF6', // Violeta
};

interface AcumuladorMinutos {
  minutosArmado: number;
  minutosAtencionCliente: number;
  minutosProduccion: number;
  minutosOtros: number;
}

/**
 * Formatea un porcentaje evitando redondear falsamente a 100% o 0% si hay horas reales.
 */
export function formatearPorcentajeTarea(hs: number, tot: number): string {
  if (tot <= 0 || hs <= 0) return '0%';
  const p = (hs / tot) * 100;
  if (p >= 100) return '100%';
  if (p >= 99.95 && p < 100) return `${p.toFixed(2)}%`;
  if (p > 0 && p < 0.1) return `${p.toFixed(2)}%`;
  if (Number.isInteger(p)) return `${p}%`;
  return `${Number(p.toFixed(1))}%`;
}

function crearItemsGrafico(arm: number, aten: number, prod: number, otr: number, tot: number): ItemGraficoTorta[] {
  const calcNum = (v: number) => (tot > 0 ? Math.round((v / tot) * 1000) / 10 : 0);
  return [
    { name: 'Armado de Pedidos', value: arm, color: COLORES_TAREAS.armado, porcentaje: calcNum(arm), porcentajeTexto: formatearPorcentajeTarea(arm, tot) },
    { name: 'Atención al Cliente', value: aten, color: COLORES_TAREAS.atencionCliente, porcentaje: calcNum(aten), porcentajeTexto: formatearPorcentajeTarea(aten, tot) },
    { name: 'Producción', value: prod, color: COLORES_TAREAS.produccion, porcentaje: calcNum(prod), porcentajeTexto: formatearPorcentajeTarea(prod, tot) },
    { name: 'Otras Tareas', value: otr, color: COLORES_TAREAS.otros, porcentaje: calcNum(otr), porcentajeTexto: formatearPorcentajeTarea(otr, tot) },
  ];
}

/**
 * Calcula la distribución consolidada de todo el equipo sumando horas de todos los armadores.
 */
export function calcularConsolidadoEquipo(distribuciones: DistribucionTareasEmpleado[]): DistribucionTareasEmpleado | null {
  if (distribuciones.length === 0) return null;
  let armHs = 0, atenHs = 0, prodHs = 0, otrHs = 0;
  distribuciones.forEach((d) => {
    armHs += d.horasArmado;
    atenHs += d.horasAtencionCliente;
    prodHs += d.horasProduccion;
    otrHs += d.horasOtros;
  });

  const arm = Math.round(armHs * 10) / 10;
  const aten = Math.round(atenHs * 10) / 10;
  const prod = Math.round(prodHs * 10) / 10;
  const otr = Math.round(otrHs * 10) / 10;
  const tot = Math.round((arm + aten + prod + otr) * 10) / 10;
  const calcNum = (v: number) => (tot > 0 ? Math.round((v / tot) * 1000) / 10 : 0);

  return {
    empleado: 'Equipo Completo',
    horasArmado: arm,
    horasAtencionCliente: aten,
    horasProduccion: prod,
    horasOtros: otr,
    horasTotales: tot,
    porcentajes: { armado: calcNum(arm), atencionCliente: calcNum(aten), produccion: calcNum(prod), otros: calcNum(otr) },
    itemsGrafico: crearItemsGrafico(arm, aten, prod, otr, tot),
  };
}

/**
 * Calcula la distribución horaria y porcentual dedicada a cada tipo de tarea por armador.
 */
export function calcularDistribucionTareasPorEmpleado(
  registros: RegistroArmadoDocumento[]
): DistribucionTareasEmpleado[] {
  const mapa = new Map<string, AcumuladorMinutos>();

  registros.forEach((reg) => {
    reg.filas?.forEach((f) => {
      if (f.accionIrregularidad === 'ignorar') return;
      const emp = f.empleadoAsignado || f.nuevoEmpleado || reg.empleadoHeader;
      if (!emp) return;

      const actual = mapa.get(emp) || { minutosArmado: 0, minutosAtencionCliente: 0, minutosProduccion: 0, minutosOtros: 0 };
      const minutos = calcularDiferenciaMinutos(f.horaInicio, f.horaFin);

      if (f.tipoTarea === 'atencion_cliente') actual.minutosAtencionCliente += minutos;
      else if (f.tipoTarea === 'produccion') actual.minutosProduccion += minutos;
      else if (f.tipoTarea === 'otros') actual.minutosOtros += minutos;
      else actual.minutosArmado += minutos;

      mapa.set(emp, actual);
    });
  });

  const resultado: DistribucionTareasEmpleado[] = [];

  mapa.forEach((val, emp) => {
    const horasArmado = Math.round((val.minutosArmado / 60) * 10) / 10;
    const horasAtencionCliente = Math.round((val.minutosAtencionCliente / 60) * 10) / 10;
    const horasProduccion = Math.round((val.minutosProduccion / 60) * 10) / 10;
    const horasOtros = Math.round((val.minutosOtros / 60) * 10) / 10;
    const horasTotales = Math.round((horasArmado + horasAtencionCliente + horasProduccion + horasOtros) * 10) / 10;
    const calcNum = (hs: number) => (horasTotales > 0 ? Math.round((hs / horasTotales) * 1000) / 10 : 0);

    resultado.push({
      empleado: emp,
      horasArmado,
      horasAtencionCliente,
      horasProduccion,
      horasOtros,
      horasTotales,
      porcentajes: {
        armado: calcNum(horasArmado),
        atencionCliente: calcNum(horasAtencionCliente),
        produccion: calcNum(horasProduccion),
        otros: calcNum(horasOtros),
      },
      itemsGrafico: crearItemsGrafico(horasArmado, horasAtencionCliente, horasProduccion, horasOtros, horasTotales),
    });
  });

  return resultado.sort((a, b) => b.horasTotales - a.horasTotales);
}

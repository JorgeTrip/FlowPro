// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import type { RegistroArmadoDocumento } from '../types/armado.ts';
import { calcularDiferenciaMinutos } from './metricsCalculator.ts';

export interface ItemGraficoTorta {
  name: string;
  value: number; // Horas
  color: string;
  porcentaje: number;
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
 * Calcula la distribución horaria y porcentual dedicada a cada tipo de tarea por armador.
 * Soporta filtros por empleado individual o consolidado general.
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

      const actual = mapa.get(emp) || {
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
        // Por defecto 'armado'
        actual.minutosArmado += minutos;
      }

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

    const calcPorcentaje = (hs: number) => (horasTotales > 0 ? Math.round((hs / horasTotales) * 100) : 0);

    const porcArmado = calcPorcentaje(horasArmado);
    const porcAtencion = calcPorcentaje(horasAtencionCliente);
    const porcProduccion = calcPorcentaje(horasProduccion);
    const porcOtros = calcPorcentaje(horasOtros);

    const itemsGrafico: ItemGraficoTorta[] = [
      { name: 'Armado de Pedidos', value: horasArmado, color: COLORES_TAREAS.armado, porcentaje: porcArmado },
      { name: 'Atención al Cliente', value: horasAtencionCliente, color: COLORES_TAREAS.atencionCliente, porcentaje: porcAtencion },
      { name: 'Producción', value: horasProduccion, color: COLORES_TAREAS.produccion, porcentaje: porcProduccion },
      { name: 'Otras Tareas', value: horasOtros, color: COLORES_TAREAS.otros, porcentaje: porcOtros },
    ];

    resultado.push({
      empleado: emp,
      horasArmado,
      horasAtencionCliente,
      horasProduccion,
      horasOtros,
      horasTotales,
      porcentajes: {
        armado: porcArmado,
        atencionCliente: porcAtencion,
        produccion: porcProduccion,
        otros: porcOtros,
      },
      itemsGrafico,
    });
  });

  return resultado.sort((a, b) => b.horasTotales - a.horasTotales);
}

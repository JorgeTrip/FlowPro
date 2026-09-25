// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import type { RegistroArmadoDocumento, MetricasKpi, RendimientoEmpleado } from '../types/armado.ts';
import { exportarAXLSX as exportarXLSXBase, exportarIrregularidadesAXLSX } from './exportadorMetricasXLSX.ts';

export function calcularDiferenciaMinutos(inicio: string, fin: string): number {
  if (!inicio || !fin) return 0;
  const [h1, m1] = inicio.split(':').map(Number);
  const [h2, m2] = fin.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;
  const min1 = h1 * 60 + m1;
  const min2 = h2 * 60 + m2;
  const dif = min2 - min1;
  return dif > 0 ? dif : dif + 1440;
}

export function calcularMetricasGlobales(registros: RegistroArmadoDocumento[]): MetricasKpi {
  let totalPedidos = 0;
  let totalArticulos = 0;
  let totalMinutosArmado = 0;

  registros.forEach((reg) => {
    reg.filas?.forEach((f) => {
      if (f.accionIrregularidad === 'ignorar') return;
      if (f.tipoTarea && f.tipoTarea !== 'armado') return;
      totalPedidos += 1;
      totalArticulos += f.cantArticulos || 0;
      totalMinutosArmado += calcularDiferenciaMinutos(f.horaInicio, f.horaFin);
    });
  });

  const totalHoras = totalMinutosArmado / 60;
  const velocidadPromedioEq = totalHoras > 0 ? Math.round(totalArticulos / totalHoras) : 0;
  const tiempoMedioPedidoMin = totalPedidos > 0 ? Math.round((totalMinutosArmado / totalPedidos) * 10) / 10 : 0;

  return {
    totalPedidos,
    totalArticulos,
    velocidadPromedioEq,
    tiempoMedioPedidoMin,
  };
}

interface AcumuladorEmpleado {
  pedidosArmado: number;
  articulos: number;
  minutosArmado: number;
  minutosAtencionCliente: number;
  minutosProduccion: number;
  minutosOtros: number;
  irregularidades: number;
}

export function calcularRendimientoPorEmpleado(registros: RegistroArmadoDocumento[]): RendimientoEmpleado[] {
  const mapa = new Map<string, AcumuladorEmpleado>();

  registros.forEach((reg) => {
    reg.filas?.forEach((f) => {
      if (f.accionIrregularidad === 'ignorar') return;
      const emp = f.empleadoAsignado || f.nuevoEmpleado || reg.empleadoHeader;
      const actual = mapa.get(emp) || {
        pedidosArmado: 0,
        articulos: 0,
        minutosArmado: 0,
        minutosAtencionCliente: 0,
        minutosProduccion: 0,
        minutosOtros: 0,
        irregularidades: 0,
      };

      const minutos = calcularDiferenciaMinutos(f.horaInicio, f.horaFin);

      if (f.tipoTarea === 'atencion_cliente') {
        actual.minutosAtencionCliente += minutos;
      } else if (f.tipoTarea === 'produccion') {
        actual.minutosProduccion += minutos;
      } else if (f.tipoTarea === 'otros') {
        actual.minutosOtros += minutos;
      } else {
        // Armado regular por defecto
        actual.pedidosArmado += 1;
        actual.articulos += f.cantArticulos || 0;
        actual.minutosArmado += minutos;
      }

      const esIrregularActiva =
        Boolean(f.esIrregular) &&
        !f.accionIrregularidad &&
        (!f.tipoTarea || f.tipoTarea === 'armado') &&
        Boolean(f.notaIrregularidad && f.notaIrregularidad.trim());

      if (esIrregularActiva) {
        actual.irregularidades += 1;
      }

      mapa.set(emp, actual);
    });
  });

  const resultado: RendimientoEmpleado[] = [];
  mapa.forEach((val, emp) => {
    const horasArmado = Math.round((val.minutosArmado / 60) * 10) / 10;
    const atencionClienteHs = Math.round((val.minutosAtencionCliente / 60) * 10) / 10;
    const produccionHs = Math.round((val.minutosProduccion / 60) * 10) / 10;
    const otrosHs = Math.round((val.minutosOtros / 60) * 10) / 10;

    const horasOtrasTareas = Math.round((atencionClienteHs + produccionHs + otrosHs) * 10) / 10;
    const horasTotales = Math.round((horasArmado + horasOtrasTareas) * 10) / 10;

    // Velocidad calculada exclusivamente sobre horas de armado
    const velocidadArtHs = horasArmado > 0 ? Math.round(val.articulos / horasArmado) : 0;
    const tiempoMedioMin = val.pedidosArmado > 0 ? Math.round((val.minutosArmado / val.pedidosArmado) * 10) / 10 : 0;

    resultado.push({
      empleado: emp,
      totalPedidos: val.pedidosArmado,
      totalArticulos: val.articulos,
      horasTrabajadas: horasTotales,
      horasArmado,
      horasOtrasTareas,
      horasTotales,
      desgloseOtrasTareas: {
        atencionClienteHs,
        produccionHs,
        otrosHs,
      },
      velocidadArtHs,
      tiempoMedioMin,
      totalIrregularidades: val.irregularidades,
    });
  });

  return resultado.sort((a, b) => b.velocidadArtHs - a.velocidadArtHs);
}

export function exportarAXLSX(registros: RegistroArmadoDocumento[]): void {
  exportarXLSXBase(registros, calcularRendimientoPorEmpleado);
}

export { exportarIrregularidadesAXLSX };

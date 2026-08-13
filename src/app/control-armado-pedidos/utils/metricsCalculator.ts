// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { RegistroArmadoDocumento, MetricasKpi, RendimientoEmpleado } from '../types/armado';
import * as XLSX from 'xlsx';

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
  let totalMinutos = 0;

  registros.forEach((reg) => {
    reg.filas?.forEach((f) => {
      if (f.accionIrregularidad === 'ignorar') return;
      totalPedidos += 1;
      totalArticulos += f.cantArticulos || 0;
      totalMinutos += calcularDiferenciaMinutos(f.horaInicio, f.horaFin);
    });
  });

  const totalHoras = totalMinutos / 60;
  const velocidadPromedioEq = totalHoras > 0 ? Math.round(totalArticulos / totalHoras) : 0;
  const tiempoMedioPedidoMin = totalPedidos > 0 ? Math.round((totalMinutos / totalPedidos) * 10) / 10 : 0;

  return {
    totalPedidos,
    totalArticulos,
    velocidadPromedioEq,
    tiempoMedioPedidoMin,
  };
}

export function calcularRendimientoPorEmpleado(registros: RegistroArmadoDocumento[]): RendimientoEmpleado[] {
  const mapa = new Map<string, { pedidos: number; articulos: number; minutos: number; irregularidades: number }>();

  registros.forEach((reg) => {
    reg.filas?.forEach((f) => {
      if (f.accionIrregularidad === 'ignorar') return;
      const emp = f.empleadoAsignado || f.nuevoEmpleado || reg.empleadoHeader;
      const actual = mapa.get(emp) || { pedidos: 0, articulos: 0, minutos: 0, irregularidades: 0 };
      actual.pedidos += 1;
      actual.articulos += f.cantArticulos || 0;
      actual.minutos += calcularDiferenciaMinutos(f.horaInicio, f.horaFin);

      if (f.esIrregular && !f.accionIrregularidad) {
        actual.irregularidades += 1;
      }
      mapa.set(emp, actual);
    });
  });

  const resultado: RendimientoEmpleado[] = [];
  mapa.forEach((val, emp) => {
    const horasTrabajadas = Math.round((val.minutos / 60) * 10) / 10;
    const velocidadArtHs = horasTrabajadas > 0 ? Math.round(val.articulos / horasTrabajadas) : 0;
    const tiempoMedioMin = val.pedidos > 0 ? Math.round((val.minutos / val.pedidos) * 10) / 10 : 0;

    resultado.push({
      empleado: emp,
      totalPedidos: val.pedidos,
      totalArticulos: val.articulos,
      horasTrabajadas,
      velocidadArtHs,
      tiempoMedioMin,
      totalIrregularidades: val.irregularidades,
    });
  });

  return resultado.sort((a, b) => b.velocidadArtHs - a.velocidadArtHs);
}

export function exportarAXLSX(registros: RegistroArmadoDocumento[]): void {
  const rend = calcularRendimientoPorEmpleado(registros);

  const resumenData = rend.map((r) => ({
    'Armador': r.empleado,
    'Total Pedidos': r.totalPedidos,
    'Total Artículos': r.totalArticulos,
    'Horas Trabajadas': r.horasTrabajadas,
    'Velocidad (Art/hs)': r.velocidadArtHs,
    'Min / Pedido': r.tiempoMedioMin,
    'Irregularidades': r.totalIrregularidades,
  }));

  const detalleFilas: any[] = [];
  registros.forEach((reg) => {
    reg.filas?.forEach((f) => {
      if (f.accionIrregularidad === 'ignorar') return;
      const esIrregularActiva = Boolean(f.esIrregular) && !f.accionIrregularidad;
      detalleFilas.push({
        'Empleado Cabecera': reg.empleadoHeader,
        'Armador Asignado': f.empleadoAsignado || f.nuevoEmpleado || reg.empleadoHeader,
        'Fecha': f.fecha,
        'Hora Inicio': f.horaInicio,
        'Hora Fin': f.horaFin,
        'Cant. Artículos': f.cantArticulos,
        'Es Irregular': esIrregularActiva ? 'SÍ' : 'NO',
        'Nota Irregularidad': f.notaIrregularidad || '-',
      });
    });
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumenData), 'Resumen por Armador');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detalleFilas), 'Detalle de Pedidos');

  const hoyStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `flowpro_control_armado_${hoyStr}.xlsx`);
}

export function exportarIrregularidadesAXLSX(registros: RegistroArmadoDocumento[], empleadoFiltro?: string): void {
  const irregularidadesFiltradas: any[] = [];

  registros.forEach((reg) => {
    reg.filas?.forEach((f) => {
      if (f.accionIrregularidad === 'ignorar') return;
      const esIrregularActiva = Boolean(f.esIrregular) && !f.accionIrregularidad;
      if (esIrregularActiva) {
        const armador = f.empleadoAsignado || f.nuevoEmpleado || reg.empleadoHeader;
        if (!empleadoFiltro || armador === empleadoFiltro || reg.empleadoHeader === empleadoFiltro) {
          irregularidadesFiltradas.push({
            'Empleado Cabecera': reg.empleadoHeader,
            'Armador Asignado': armador,
            'Fecha': f.fecha,
            'Hora Inicio': f.horaInicio,
            'Hora Fin': f.horaFin,
            'Cant. Artículos': f.cantArticulos,
            'Nota Irregularidad': f.notaIrregularidad || 'Marca sin detalle',
            'Archivo Origen': reg.nombreArchivoOriginal || 'Escaneo directo',
            'Fecha Registro': reg.verificadoEn ? new Date(reg.verificadoEn).toLocaleString() : reg.creadoEn,
          });
        }
      }
    });
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(irregularidadesFiltradas), 'Irregularidades');

  const hoyStr = new Date().toISOString().split('T')[0];
  const sufijoEmp = empleadoFiltro ? `_${empleadoFiltro.replace(/\s+/g, '_')}` : '';
  XLSX.writeFile(wb, `flowpro_irregularidades${sufijoEmp}_${hoyStr}.xlsx`);
}

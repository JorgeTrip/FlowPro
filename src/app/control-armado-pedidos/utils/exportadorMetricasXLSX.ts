// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as XLSX from 'xlsx';
import type { RegistroArmadoDocumento, RendimientoEmpleado } from '../types/armado.ts';
import { formatearEtiquetaTarea } from './detectorTareasAlternativas.ts';

export function exportarAXLSX(
  registros: RegistroArmadoDocumento[],
  calcularRendimiento: (regs: RegistroArmadoDocumento[]) => RendimientoEmpleado[]
): void {
  const rend = calcularRendimiento(registros);

  const resumenData = rend.map((r) => ({
    'Armador': r.empleado,
    'Total Pedidos': r.totalPedidos,
    'Total Artículos': r.totalArticulos,
    'Hs. Armado': r.horasArmado,
    'Hs. Otras Tareas': r.horasOtrasTareas,
    'Hs. Totales': r.horasTotales,
    'Atención Cliente (hs)': r.desgloseOtrasTareas.atencionClienteHs,
    'Producción (hs)': r.desgloseOtrasTareas.produccionHs,
    'Otros (hs)': r.desgloseOtrasTareas.otrosHs,
    'Velocidad (Art/hs)': r.velocidadArtHs,
    'Min / Pedido': r.tiempoMedioMin,
    'Irregularidades': r.totalIrregularidades,
  }));

  const detalleFilas: any[] = [];
  registros.forEach((reg) => {
    reg.filas?.forEach((f) => {
      if (f.accionIrregularidad === 'ignorar') return;
      const esIrregularActiva = Boolean(f.esIrregular) && !f.accionIrregularidad && (!f.tipoTarea || f.tipoTarea === 'armado');
      detalleFilas.push({
        'Empleado Cabecera': reg.empleadoHeader,
        'Armador Asignado': f.empleadoAsignado || f.nuevoEmpleado || reg.empleadoHeader,
        'Tipo Tarea': formatearEtiquetaTarea(f.tipoTarea, f.detalleOtraTarea),
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
      const esIrregularActiva = Boolean(f.esIrregular) && !f.accionIrregularidad && (!f.tipoTarea || f.tipoTarea === 'armado');
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

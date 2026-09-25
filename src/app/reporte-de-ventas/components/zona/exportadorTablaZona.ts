import { exportToExcel } from '../../lib/exportUtils';
import { FilaTablaZonaAcumulado } from './types';

export function exportarDatosTablaZona(
  modoVista: 'acumulado' | 'comparativo',
  datosProcesados: (FilaTablaZonaAcumulado | any)[],
  totales: any,
  mesesSeleccionados: string[],
  mostrarCantidad: boolean,
  mostrarTotales: boolean,
  mostrarVariacion: boolean
): void {
  if (modoVista === 'acumulado') {
    const headers = mostrarCantidad
      ? ['Zona', 'Cant. Facturas', 'Cant. Remitos', 'Total Cantidad']
      : ['Zona', 'Imp. Facturas', 'Imp. Remitos', 'Total Importe'];

    const rows = (datosProcesados as FilaTablaZonaAcumulado[]).map((item) =>
      mostrarCantidad
        ? [item.zona, item.cantidadA, item.cantidadX, item.totalCantidad]
        : [item.zona, item.importeA, item.importeX, item.total]
    );

    if (mostrarTotales) {
      rows.push(
        mostrarCantidad
          ? ['TOTAL', totales.cantidadA, totales.cantidadX, totales.totalCantidad]
          : ['TOTAL', totales.importeA, totales.importeX, totales.total]
      );
    }

    exportToExcel(
      [headers, ...rows],
      `ventas-por-zona-${mostrarCantidad ? 'cantidad' : 'importe'}`,
      'Ventas Por Zona'
    );
  } else {
    const headers = ['Zona'];
    mesesSeleccionados.forEach((mes, idx) => {
      headers.push(`${mes} (${mostrarCantidad ? 'Cant' : 'Imp'})`);
      if (mostrarVariacion && idx > 0) headers.push('Var %');
    });
    headers.push('Total');

    const rows = (datosProcesados as any[]).map((item) => {
      const row = [item.zona];
      mesesSeleccionados.forEach((mes, idx) => {
        row.push(item.meses[mes] || 0);
        if (mostrarVariacion && idx > 0) {
          row.push(
            item.variaciones[mes] !== undefined ? `${item.variaciones[mes].toFixed(1)}%` : '-'
          );
        }
      });
      row.push(item.total);
      return row;
    });

    if (mostrarTotales) {
      const row = ['TOTAL'];
      mesesSeleccionados.forEach((mes, idx) => {
        row.push(totales.totalesMeses[mes]);
        if (mostrarVariacion && idx > 0) row.push('-');
      });
      row.push(totales.granTotal);
      rows.push(row);
    }

    exportToExcel(
      [headers, ...rows],
      'ventas-por-zona-comparativo',
      'Ventas Por Zona Comparativo'
    );
  }
}

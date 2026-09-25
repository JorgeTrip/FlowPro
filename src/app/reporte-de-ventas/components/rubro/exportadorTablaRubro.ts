import { exportToExcel } from '../../lib/exportUtils';
import { FilaTablaRubroAcumulado, FilaTablaRubroComparativo } from './types';

export function exportarDatosTablaRubro(
  modoVista: 'acumulado' | 'comparativo',
  datosProcesados: (FilaTablaRubroAcumulado | FilaTablaRubroComparativo | any)[],
  totales: any,
  mesesSeleccionados: string[],
  mostrarCantidad: boolean,
  mostrarTotales: boolean,
  mostrarVariacion: boolean
): void {
  if (modoVista === 'acumulado') {
    const headers = mostrarCantidad
      ? ['Rubro', 'Cant. Facturas', 'Cant. Remitos', 'Total Cantidad']
      : ['Rubro', 'Imp. Facturas', 'Imp. Remitos', 'Total Importe'];

    const rows = (datosProcesados as FilaTablaRubroAcumulado[]).map((item) =>
      mostrarCantidad
        ? [item.rubro, item.cantidadA, item.cantidadX, item.totalCantidad]
        : [item.rubro, item.importeA, item.importeX, item.total]
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
      `ventas-por-rubro-${mostrarCantidad ? 'cantidad' : 'importe'}`,
      'Ventas Por Rubro'
    );
  } else {
    const headers = ['Rubro'];
    mesesSeleccionados.forEach((mes, idx) => {
      headers.push(`${mes} (${mostrarCantidad ? 'Cant' : 'Imp'})`);
      if (mostrarVariacion && idx > 0) headers.push('Var %');
    });
    headers.push('Total');

    const rows = (datosProcesados as any[]).map((item) => {
      const row = [item.rubro];
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
      'ventas-por-rubro-comparativo',
      'Ventas Por Rubro Comparativo'
    );
  }
}

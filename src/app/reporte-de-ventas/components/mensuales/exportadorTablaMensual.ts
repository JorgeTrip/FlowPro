import { exportToExcel } from '../../lib/exportUtils';

export interface FilaTablaMensual {
  mes: string;
  importeA: number;
  importeX: number;
  cantidadA: number;
  cantidadX: number;
  total: number;
  totalCantidad: number;
  varImporteA: number;
  varImporteX: number;
  varTotal: number;
  varCantidadA: number;
  varCantidadX: number;
  varTotalCantidad: number;
  tieneVariacion: boolean;
}

export interface TotalesTablaMensual {
  importeA: number;
  importeX: number;
  cantidadA: number;
  cantidadX: number;
  total: number;
  totalCantidad: number;
}

export function exportarDatosTablaMensual(
  datosFiltrados: FilaTablaMensual[],
  totales: TotalesTablaMensual,
  mostrarCantidad: boolean,
  mostrarVariacion: boolean,
  mostrarTotales: boolean
): void {
  let headers: string[];
  let rows: (string | number)[][];

  if (mostrarCantidad) {
    headers = mostrarVariacion
      ? ['Mes', 'Cant. Facturas', 'Var %', 'Cant. Remitos', 'Var %', 'Total Cantidad', 'Var %']
      : ['Mes', 'Cant. Facturas', 'Cant. Remitos', 'Total Cantidad'];

    rows = datosFiltrados.map((item) => {
      if (mostrarVariacion) {
        return [
          item.mes,
          item.cantidadA,
          item.tieneVariacion ? `${item.varCantidadA.toFixed(1)}%` : '-',
          item.cantidadX,
          item.tieneVariacion ? `${item.varCantidadX.toFixed(1)}%` : '-',
          item.totalCantidad,
          item.tieneVariacion ? `${item.varTotalCantidad.toFixed(1)}%` : '-',
        ];
      } else {
        return [item.mes, item.cantidadA, item.cantidadX, item.totalCantidad];
      }
    });

    if (mostrarTotales) {
      const totalRow = mostrarVariacion
        ? ['TOTAL', totales.cantidadA, '-', totales.cantidadX, '-', totales.totalCantidad, '-']
        : ['TOTAL', totales.cantidadA, totales.cantidadX, totales.totalCantidad];
      rows.push(totalRow);
    }
  } else {
    headers = mostrarVariacion
      ? ['Mes', 'Imp. Facturas', 'Var %', 'Imp. Remitos', 'Var %', 'Total Importe', 'Var %']
      : ['Mes', 'Imp. Facturas', 'Imp. Remitos', 'Total Importe'];

    rows = datosFiltrados.map((item) => {
      if (mostrarVariacion) {
        return [
          item.mes,
          item.importeA,
          item.tieneVariacion ? `${item.varImporteA.toFixed(1)}%` : '-',
          item.importeX,
          item.tieneVariacion ? `${item.varImporteX.toFixed(1)}%` : '-',
          item.total,
          item.tieneVariacion ? `${item.varTotal.toFixed(1)}%` : '-',
        ];
      } else {
        return [item.mes, item.importeA, item.importeX, item.total];
      }
    });

    if (mostrarTotales) {
      const totalRow = mostrarVariacion
        ? ['TOTAL', totales.importeA, '-', totales.importeX, '-', totales.total, '-']
        : ['TOTAL', totales.importeA, totales.importeX, totales.total];
      rows.push(totalRow);
    }
  }

  const sufijo = `${mostrarCantidad ? 'cantidad' : 'importe'}${mostrarVariacion ? '-con-variacion' : ''}`;
  exportToExcel([headers, ...rows], `ventas-mensuales-${sufijo}`, 'Ventas Mensuales');
}

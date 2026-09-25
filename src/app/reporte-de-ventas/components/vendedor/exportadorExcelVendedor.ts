import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { FilaVendedorAcumulado, FilaVendedorComparativo } from './types';

export async function exportarExcelVendedor(
  modoVista: 'acumulado' | 'comparativo',
  datosProcesados: (FilaVendedorAcumulado | FilaVendedorComparativo)[],
  totalesAcumulados: any,
  totalesComparativos: any,
  mesesSeleccionados: string[],
  mostrarCantidad: boolean,
  mostrarTotales: boolean,
  mostrarVariacion: boolean
): Promise<void> {
  let headers: string[] = [];
  let rows: (string | number)[][] = [];

  if (modoVista === 'acumulado') {
    headers = mostrarCantidad
      ? ['Vendedor', 'Cant. Facturas', 'Cant. Remitos', 'Total Cantidad']
      : ['Vendedor', 'Imp. Facturas', 'Imp. Remitos', 'Total Importe'];

    rows = (datosProcesados as FilaVendedorAcumulado[]).map((item) =>
      mostrarCantidad
        ? [item.vendedor, item.cantidadA, item.cantidadX, item.totalCantidad]
        : [item.vendedor, item.importeA, item.importeX, item.total]
    );

    if (mostrarTotales && totalesAcumulados) {
      rows.push(
        mostrarCantidad
          ? ['TOTAL', totalesAcumulados.cantidadA, totalesAcumulados.cantidadX, totalesAcumulados.totalCantidad]
          : ['TOTAL', totalesAcumulados.importeA, totalesAcumulados.importeX, totalesAcumulados.total]
      );
    }
  } else {
    headers = ['Vendedor'];
    mesesSeleccionados.forEach((mes) => {
      headers.push(`${mes} (Facturas)`);
      headers.push(`${mes} (Remitos)`);
      headers.push(`${mes} (Total)`);
      if (mostrarVariacion) {
        headers.push(`${mes} (Var %)`);
      }
    });
    headers.push('TOTAL GLOBAL');

    rows = (datosProcesados as FilaVendedorComparativo[]).map((item) => {
      const row: (string | number)[] = [item.vendedor];
      mesesSeleccionados.forEach((mes, index) => {
        const d = item.meses[mes];
        if (mostrarCantidad) {
          row.push(d.cantidadA, d.cantidadX, d.totalCantidad);
        } else {
          row.push(d.importeA, d.importeX, d.totalImporte);
        }
        if (mostrarVariacion) {
          let variacionStr = '-';
          if (index > 0) {
            const dataAnt = item.meses[mesesSeleccionados[index - 1]];
            const valAct = mostrarCantidad ? d.totalCantidad : d.totalImporte;
            const valAnt = mostrarCantidad ? dataAnt.totalCantidad : dataAnt.totalImporte;
            if (valAnt > 0) variacionStr = (((valAct - valAnt) / valAnt) * 100).toFixed(1) + '%';
          }
          row.push(variacionStr);
        }
      });
      row.push(mostrarCantidad ? item.totalGlobalCantidad : item.totalGlobalImporte);
      return row;
    });

    if (mostrarTotales && totalesComparativos) {
      const totalRow: (string | number)[] = ['TOTAL'];
      mesesSeleccionados.forEach((mes, index) => {
        const d = totalesComparativos.meses[mes];
        if (mostrarCantidad) {
          totalRow.push(d.cantidadA, d.cantidadX, d.totalCantidad);
        } else {
          totalRow.push(d.importeA, d.importeX, d.totalImporte);
        }
        if (mostrarVariacion) {
          let variacionStr = '-';
          if (index > 0) {
            const dataAnt = totalesComparativos.meses[mesesSeleccionados[index - 1]];
            const valAct = mostrarCantidad ? d.totalCantidad : d.totalImporte;
            const valAnt = mostrarCantidad ? dataAnt.totalCantidad : dataAnt.totalImporte;
            if (valAnt > 0) variacionStr = (((valAct - valAnt) / valAnt) * 100).toFixed(1) + '%';
          }
          totalRow.push(variacionStr);
        }
      });
      totalRow.push(mostrarCantidad ? totalesComparativos.totalGlobalCantidad : totalesComparativos.totalGlobalImporte);
      rows.push(totalRow);
    }
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Ventas');
  const headerRow = sheet.addRow(headers);
  headerRow.font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(
    blob,
    `ventas-por-vendedor-${mostrarCantidad ? 'cantidad' : 'importe'}-${modoVista}.xlsx`
  );
}

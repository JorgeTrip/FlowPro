// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { ResultadoItem } from '@/app/lib/demandEstimator';

export async function exportarResultadosDemandaExcel(resultados: ResultadoItem[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Resultados');

  const headers = [
    'ID Producto',
    'Descripción',
    'Venta Mensual',
    'Stock CABA',
    'Stock Reservado CABA',
    'Stock Neto CABA',
    'Stock Entre Ríos',
    'Pedir a Entre Ríos',
    'Meses Cobertura',
    'Criticidad',
    'Sugerencia',
  ];

  const data = resultados.map((item) => [
    item.productoId,
    item.descripcion,
    item.venta,
    item.stockCABA,
    item.stockReservadoCABA,
    item.stockNetoCABA,
    item.stockEntreRios,
    item.pedirAEntreRios,
    item.mesesCobertura,
    item.criticidad,
    item.sugerencia,
  ]);

  worksheet.columns = headers.map((header, index) => ({
    header,
    key: header.toLowerCase().replace(' ', ''),
    width: index === 1 ? 40 : index === 8 ? 25 : index === 10 ? 50 : index === 9 ? 15 : 20,
  }));

  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2F75B5' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  data.forEach((row) => {
    worksheet.addRow(row);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, 'analisis_demanda.xlsx');
}

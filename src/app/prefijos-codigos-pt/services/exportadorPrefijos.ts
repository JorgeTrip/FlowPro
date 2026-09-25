// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { ReglaPrefijo } from '@/app/gestion-formulas/lib/types';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export function exportarPrefijosJSON(reglas: ReglaPrefijo[]): void {
  const blob = new Blob([JSON.stringify(reglas, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flowpro_prefijos_codigos_pt_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportarPrefijosExcel(reglas: ReglaPrefijo[]): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Prefijos');

  ws.columns = [
    { header: 'Prefijo', key: 'prefijo', width: 15 },
    { header: 'Línea', key: 'linea', width: 25 },
    { header: 'Sitio de Fabricación', key: 'sitioFabricacion', width: 25 },
    { header: 'Descripción', key: 'descripcion', width: 35 },
  ];

  const headerRow = ws.getRow(1);
  headerRow.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1E3A8A' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  reglas.forEach((r) => {
    ws.addRow({
      prefijo: r.prefijo,
      linea: r.linea,
      sitioFabricacion: r.sitioFabricacion,
      descripcion: r.descripcion || '',
    });
  });

  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(3).alignment = { horizontal: 'center' };
    row.font = { name: 'Arial', size: 9 };
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `flowpro_prefijos_codigos_pt_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportarPrefijosCSV(reglas: ReglaPrefijo[]): void {
  const cabeceras = ['Prefijo', 'Línea', 'Sitio de Fabricación', 'Descripción'];
  const filas = reglas.map((r) => [
    `"${(r.prefijo || '').replace(/"/g, '""')}"`,
    `"${(r.linea || '').replace(/"/g, '""')}"`,
    `"${(r.sitioFabricacion || '').replace(/"/g, '""')}"`,
    `"${(r.descripcion || '').replace(/"/g, '""')}"`,
  ]);
  const csvContent = '\ufeff' + [cabeceras.join(','), ...filas.map((f) => f.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `flowpro_prefijos_codigos_pt_${new Date().toISOString().split('T')[0]}.csv`);
}

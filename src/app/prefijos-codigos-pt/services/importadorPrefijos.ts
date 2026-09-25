// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as ExcelJS from 'exceljs';
export async function parsearArchivoReglasPrefijo(file: File): Promise<any[]> {
  const nombreArchivo = file.name.toLowerCase();
  const contenido: any[] = [];

  if (nombreArchivo.endsWith('.json')) {
    const text = await file.text();
    return JSON.parse(text);
  }

  if (nombreArchivo.endsWith('.xlsx')) {
    const arrayBuffer = await file.arrayBuffer();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(arrayBuffer);
    const ws = wb.worksheets[0];
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const prefijo = row.getCell(1).value?.toString();
      const linea = row.getCell(2).value?.toString();
      const sitioFabricacion = row.getCell(3).value?.toString();
      const descripcion = row.getCell(4).value?.toString();
      if (prefijo && linea && sitioFabricacion) {
        contenido.push({
          prefijo: prefijo.trim(),
          linea: linea.trim(),
          sitioFabricacion: sitioFabricacion.trim().toUpperCase(),
          descripcion: descripcion ? descripcion.trim() : undefined,
        });
      }
    });
    return contenido;
  }

  if (nombreArchivo.endsWith('.csv')) {
    const text = await file.text();
    const lineas = text.split(/\r?\n/);
    for (let i = 1; i < lineas.length; i++) {
      const lineaStr = lineas[i].trim();
      if (!lineaStr) continue;

      const celdas: string[] = [];
      let dentroDeComillas = false;
      let celdaActual = '';
      for (let j = 0; j < lineaStr.length; j++) {
        const char = lineaStr[j];
        if (char === '"') {
          dentroDeComillas = !dentroDeComillas;
        } else if (char === ',' && !dentroDeComillas) {
          celdas.push(celdaActual.trim());
          celdaActual = '';
        } else {
          celdaActual += char;
        }
      }
      celdas.push(celdaActual.trim());

      const [prefijo, linea, sitioFabricacion, descripcion] = celdas;
      if (prefijo && linea && sitioFabricacion) {
        contenido.push({
          prefijo: prefijo.replace(/^"(.*)"$/, '$1').trim(),
          linea: linea.replace(/^"(.*)"$/, '$1').trim(),
          sitioFabricacion: sitioFabricacion.replace(/^"(.*)"$/, '$1').trim().toUpperCase(),
          descripcion: descripcion ? descripcion.replace(/^"(.*)"$/, '$1').trim() : undefined,
        });
      }
    }
    return contenido;
  }

  throw new Error('Formato de archivo no soportado. Use .json, .csv o .xlsx');
}

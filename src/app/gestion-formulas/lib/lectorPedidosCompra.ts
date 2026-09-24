// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as XLSX from 'xlsx';
import {
  RegistroFilaCompra,
  IndicesMapeoCompra,
  mapearFilasCompra,
} from './evaluarPedidosCompraPendientes';

export interface ResultadoLecturaPedidosCompra {
  registros: RegistroFilaCompra[];
  columnas: string[];
  previewData: any[];
}

export function getColLetter(idx: number): string {
  let letter = '';
  let temp = idx;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

function normalizarNombreSolapa(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Lee un archivo Excel (local o descargado de Drive) y procesa las solapas
 * 'Solicitud de compras' y 'Solicitud Hierbas'
 */
export async function procesarLibroPedidosCompra(
  file: File,
  indices?: IndicesMapeoCompra
): Promise<ResultadoLecturaPedidosCompra> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const nombresHojas = workbook.SheetNames || [];
  if (nombresHojas.length === 0) {
    throw new Error('La planilla de pedidos de compra no contiene hojas válidas.');
  }

  const resultados: RegistroFilaCompra[] = [];
  let columnasDetectadas: string[] = [];
  const previewData: any[] = [];

  const encontrarSolapa = (keywords: string[]): string | undefined => {
    return nombresHojas.find((nombre) => {
      const normal = normalizarNombreSolapa(nombre);
      return keywords.every((k) => normal.includes(k));
    });
  };

  const solapaCompras =
    encontrarSolapa(['solicitud', 'compra']) ||
    (nombresHojas.length > 0 ? nombresHojas[0] : undefined);

  const solapaHierbas =
    encontrarSolapa(['solicitud', 'hierba']) ||
    (nombresHojas.length > 1 ? nombresHojas[1] : undefined);

  if (solapaCompras && workbook.Sheets[solapaCompras]) {
    const ws = workbook.Sheets[solapaCompras];
    const filas: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

    let headerIdx = -1;
    for (let r = 0; r < Math.min(5, filas.length); r++) {
      const fila = filas[r];
      if (Array.isArray(fila)) {
        const celdasTexto = fila.filter((c) => typeof c === 'string' && c.trim().length > 0);
        if (celdasTexto.length >= 3) {
          headerIdx = r;
          break;
        }
      }
    }

    if (headerIdx >= 0) {
      columnasDetectadas = (filas[headerIdx] || []).map((col: any, i: number) => {
        const t = String(col || '').trim();
        return t || `Columna ${getColLetter(i)}`;
      });
      for (let r = headerIdx + 1; r < Math.min(headerIdx + 11, filas.length); r++) {
        const obj: Record<string, any> = {};
        columnasDetectadas.forEach((col, idx) => {
          obj[col] = filas[r]?.[idx] ?? '';
        });
        previewData.push(obj);
      }
      const registrosCompras = mapearFilasCompra(filas.slice(headerIdx + 1), 'Solicitud de compras', indices);
      resultados.push(...registrosCompras);
    } else {
      const registrosCompras = mapearFilasCompra(filas, 'Solicitud de compras', indices);
      resultados.push(...registrosCompras);
    }
  }

  if (solapaHierbas && solapaHierbas !== solapaCompras && workbook.Sheets[solapaHierbas]) {
    const ws = workbook.Sheets[solapaHierbas];
    const filas: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    const registrosHierbas = mapearFilasCompra(filas, 'Solicitud Hierbas', indices);
    resultados.push(...registrosHierbas);
  }

  if (columnasDetectadas.length === 0) {
    columnasDetectadas = [
      'A - Fecha Solicitud', 'B', 'C', 'D - Código Insumo',
      'E', 'F - Cantidad Solicitada', 'V - Cantidad Recibida'
    ];
  }

  return { registros: resultados, columnas: columnasDetectadas, previewData };
}

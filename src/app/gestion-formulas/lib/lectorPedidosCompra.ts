// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as XLSX from 'xlsx';
import type {
  RegistroFilaCompra,
  IndicesMapeoCompra,
} from './evaluarPedidosCompraPendientes.ts';
import { mapearFilasCompra } from './evaluarPedidosCompraPendientes.ts';

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

function normalizarTexto(txt: any): string {
  if (txt === null || txt === undefined) return '';
  return String(txt)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Escanea las filas buscando la fila cabecera real por coincidencia semántica
 * con los términos clave (Fecha, Código, Cantidad, Recibido).
 * Descarta títulos o notas previas a los encabezados.
 */
export function encontrarFilaCabecera(filas: any[][]): number {
  if (!filas || filas.length === 0) return 0;

  const gruposClave = [
    ['fecha', 'solicitud', 'pedido', 'fec'],
    ['codigo', 'insumo', 'articulo', 'producto'],
    ['cantidad', 'cant', 'solicitada'],
    ['recib', 'entrega', 'recepcion'],
  ];

  let mejorFila = 0;
  let maxCoincidencias = 0;
  const limite = Math.min(30, filas.length);

  for (let r = 0; r < limite; r++) {
    const fila = filas[r];
    if (!Array.isArray(fila)) continue;

    const textosFila = fila.map(normalizarTexto);
    let coincidenciasGrupo = 0;

    for (const grupo of gruposClave) {
      const coincide = textosFila.some((c) =>
        c !== '' && grupo.some((palabra) => c.includes(palabra))
      );
      if (coincide) coincidenciasGrupo++;
    }

    if (coincidenciasGrupo >= 2 && coincidenciasGrupo > maxCoincidencias) {
      maxCoincidencias = coincidenciasGrupo;
      mejorFila = r;
    }
  }

  return mejorFila;
}

/**
 * Deduce los índices de columna para Fecha, Código, Cant. Solicitada y Cant. Recibida
 * directamente desde la fila de cabecera detectada en la hoja.
 */
export function deducirIndicesDeCabecera(filaCabecera: any[], base?: IndicesMapeoCompra): IndicesMapeoCompra {
  const celdas = (filaCabecera || []).map(normalizarTexto);

  const buscarIndex = (keywords: string[]): number => {
    for (const kw of keywords) {
      const idx = celdas.findIndex((c) => c === kw);
      if (idx !== -1) return idx;
    }
    for (const kw of keywords) {
      const idx = celdas.findIndex((c) => c.includes(kw));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const fIdx = buscarIndex(['fecha solicitud', 'fecha pedido', 'fecha', 'fec']);
  const cIdx = buscarIndex(['codigo insumo', 'codigo producto', 'codigo tango', 'codigo', 'insumo', 'articulo']);
  const sIdx = buscarIndex(['cantidad solicitada', 'cant solicitada', 'cantidad pedida', 'cant pedida', 'cantidad', 'cant']);
  const rIdx = buscarIndex(['cantidad recibida', 'cant recibida', 'recibida', 'recibido', 'entrega', 'recepcion']);

  return {
    idxFecha: base?.idxFecha !== undefined ? base.idxFecha : (fIdx !== -1 ? fIdx : 0),
    idxCodigo: base?.idxCodigo !== undefined ? base.idxCodigo : (cIdx !== -1 ? cIdx : 3),
    idxCantSol: base?.idxCantSol !== undefined ? base.idxCantSol : (sIdx !== -1 ? sIdx : 5),
    idxCantRec: base?.idxCantRec !== undefined ? base.idxCantRec : (rIdx !== -1 ? rIdx : 21),
  };
}

/**
 * Lee un archivo Excel (local o de Drive) identificando dinámicamente la fila cabecera
 * en 'Solicitud de compras' y 'Solicitud Hierbas', descartando filas previas de metadatos.
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

  const encontrarSolapa = (keywords: string[]) =>
    nombresHojas.find((n) => keywords.every((k) => normalizarTexto(n).includes(k)));

  const solapaCompras = encontrarSolapa(['solicitud', 'compra']) || nombresHojas[0];
  const solapaHierbas = encontrarSolapa(['solicitud', 'hierba']) || (nombresHojas.length > 1 ? nombresHojas[1] : undefined);

  if (solapaCompras && workbook.Sheets[solapaCompras]) {
    const ws = workbook.Sheets[solapaCompras];
    const filas: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    const headerIdx = encontrarFilaCabecera(filas);
    const indicesCompras = deducirIndicesDeCabecera(filas[headerIdx], indices);

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

    const registrosCompras = mapearFilasCompra(filas.slice(headerIdx + 1), 'Solicitud de compras', indicesCompras);
    resultados.push(...registrosCompras);
  }

  if (solapaHierbas && solapaHierbas !== solapaCompras && workbook.Sheets[solapaHierbas]) {
    const ws = workbook.Sheets[solapaHierbas];
    const filas: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    const headerIdxHierbas = encontrarFilaCabecera(filas);
    const indicesHierbas = deducirIndicesDeCabecera(filas[headerIdxHierbas], indices);

    const registrosHierbas = mapearFilasCompra(filas.slice(headerIdxHierbas + 1), 'Solicitud Hierbas', indicesHierbas);
    resultados.push(...registrosHierbas);
  }

  if (columnasDetectadas.length === 0) {
    columnasDetectadas = ['A - Fecha Solicitud', 'B', 'C', 'D - Código Insumo', 'E', 'F - Cant. Solicitada', 'V - Cantidad Recibida'];
  }

  return { registros: resultados, columnas: columnasDetectadas, previewData };
}

// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import * as XLSX from 'xlsx';
import {
  RegistroFilaCompra,
  mapearFilasCompra,
} from './evaluarPedidosCompraPendientes';

/**
 * Normaliza nombres de solapas eliminando tildes y pasando a minúsculas
 */
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
export async function procesarLibroPedidosCompra(file: File): Promise<RegistroFilaCompra[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const nombresHojas = workbook.SheetNames || [];
  if (nombresHojas.length === 0) {
    throw new Error('La planilla de pedidos de compra no contiene hojas válidas.');
  }

  const resultados: RegistroFilaCompra[] = [];

  // Buscar solapas por nombre o recurrir a las 2 primeras hojas
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
    const registrosCompras = mapearFilasCompra(filas, 'Solicitud de compras');
    resultados.push(...registrosCompras);
  }

  if (solapaHierbas && solapaHierbas !== solapaCompras && workbook.Sheets[solapaHierbas]) {
    const ws = workbook.Sheets[solapaHierbas];
    const filas: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    const registrosHierbas = mapearFilasCompra(filas, 'Solicitud Hierbas');
    resultados.push(...registrosHierbas);
  }

  return resultados;
}

// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { ExcelRow } from '@/app/stores/estimarDemandaStore';

export function findDefaultColumn(columns: string[], keywords: string[]): string {
  for (const keyword of keywords) {
    const exactMatch = columns.find((col) => col.toLowerCase() === keyword.toLowerCase());
    if (exactMatch) return exactMatch;
  }
  for (const keyword of keywords) {
    const partialMatch = columns.find((col) => col.toLowerCase().includes(keyword.toLowerCase()));
    if (partialMatch) return partialMatch;
  }
  return '';
}

export function findValidDescriptionColumn(
  data: ExcelRow[],
  columns: string[],
  keywords: string[]
): string {
  const candidateColumns: string[] = [];
  for (const keyword of keywords) {
    const exactMatch = columns.find((col) => col.toLowerCase() === keyword.toLowerCase());
    if (exactMatch) candidateColumns.push(exactMatch);
  }
  for (const keyword of keywords) {
    const partialMatch = columns.find(
      (col) => col.toLowerCase().includes(keyword.toLowerCase()) && !candidateColumns.includes(col)
    );
    if (partialMatch) candidateColumns.push(partialMatch);
  }

  for (const column of candidateColumns) {
    let hasValidData = false;
    for (let i = 0; i < Math.min(3, data.length); i++) {
      const value = data[i][column];
      if (value && String(value).trim() !== '' && String(value).toLowerCase() !== 'null') {
        hasValidData = true;
        break;
      }
    }
    if (hasValidData) return column;
  }
  return '';
}

export function deducirMapeoInicialDemanda(
  ventasData: ExcelRow[],
  stockData: ExcelRow[],
  ventasColumnas: string[],
  stockColumnas: string[]
) {
  const descripcionVentas = findValidDescriptionColumn(ventasData, ventasColumnas, [
    'descripcion',
    'descripción',
    'desc',
    'desc.',
    'detalle',
    'producto',
    'articulo',
    'artículo',
  ]);
  const descripcionStock = findValidDescriptionColumn(stockData, stockColumnas, [
    'descripcion',
    'descripción',
    'desc',
    'desc.',
  ]);

  const usarDescripcionVentas = descripcionVentas && descripcionVentas.trim();
  const usarDescripcionStock = !usarDescripcionVentas && descripcionStock && descripcionStock.trim();

  return {
    ventas: {
      productoId: findDefaultColumn(ventasColumnas, ['cod', 'cód', 'cod.', 'cód.']),
      cantidad: findDefaultColumn(ventasColumnas, ['Cantidad Control Stock', 'control stock', 'cantidad']),
      fecha: findDefaultColumn(ventasColumnas, ['fecha']),
      descripcion: usarDescripcionVentas ? descripcionVentas : '',
    },
    stock: {
      productoId: findDefaultColumn(stockColumnas, ['cod', 'cód', 'cod.', 'cód.']),
      cantidad: findDefaultColumn(stockColumnas, ['saldo control stock', 'stock', 'saldo']),
      deposito: findDefaultColumn(stockColumnas, ['deposito', 'depósito', 'almacen', 'almacén', 'sucursal']),
      stockReservado: findDefaultColumn(stockColumnas, ['comprometida', 'reservado']),
      descripcion: usarDescripcionStock ? descripcionStock : '',
    },
  };
}

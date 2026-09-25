// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { ExcelCellValue, ExcelRow } from '@/app/stores/estimarDemandaStore';
import type { Mapeo } from './demandEstimator';

export function parseExcelDate(rawDate: ExcelCellValue): Date | null {
  if (rawDate instanceof Date) return rawDate;
  if (typeof rawDate === 'string') {
    const parsedDate = new Date(rawDate);
    if (!isNaN(parsedDate.getTime())) return parsedDate;
  }
  if (typeof rawDate === 'number') {
    const excelDate = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
    if (!isNaN(excelDate.getTime())) return excelDate;
  }
  return null;
}

export function agruparVentasPorProducto(datosMes: ExcelRow[], mapeo: Mapeo) {
  const ventasPorProducto: Record<string, { cantidad: number; descripcion?: string }> = {};

  datosMes.forEach((row) => {
    const productoId = String(row[mapeo.ventas.productoId]);
    const cantidad = Number(row[mapeo.ventas.cantidad]);

    let descripcion = undefined;
    if (mapeo.ventas.descripcion && row[mapeo.ventas.descripcion]) {
      const rawDesc = String(row[mapeo.ventas.descripcion]).trim();
      descripcion = rawDesc !== '' ? rawDesc : undefined;
    }

    if (productoId && !isNaN(cantidad)) {
      if (!ventasPorProducto[productoId]) {
        ventasPorProducto[productoId] = { cantidad: 0, descripcion };
      } else if (!ventasPorProducto[productoId].descripcion && descripcion) {
        ventasPorProducto[productoId].descripcion = descripcion;
      }
      ventasPorProducto[productoId].cantidad += cantidad;
    }
  });

  return ventasPorProducto;
}

export function agruparStockPorProducto(stockData: ExcelRow[], mapeo: Mapeo) {
  const stockPorProducto: Record<
    string,
    { stockCABA: number; stockReservadoCABA: number; stockEntreRios: number; descripcion?: string }
  > = {};

  stockData.forEach((row) => {
    const productoId = String(row[mapeo.stock.productoId]);
    const cantidad = Number(row[mapeo.stock.cantidad]);
    const deposito = String(row[mapeo.stock.deposito]).toLowerCase().trim();
    const stockReservado = Number(mapeo.stock.stockReservado ? row[mapeo.stock.stockReservado] || 0 : 0);

    let descripcion = undefined;
    if (mapeo.stock.descripcion && row[mapeo.stock.descripcion]) {
      const rawDesc = String(row[mapeo.stock.descripcion]).trim();
      descripcion = rawDesc !== '' ? rawDesc : undefined;
    }

    if (productoId && !isNaN(cantidad)) {
      if (!stockPorProducto[productoId]) {
        stockPorProducto[productoId] = {
          stockCABA: 0,
          stockReservadoCABA: 0,
          stockEntreRios: 0,
          descripcion,
        };
      }

      const esCABA = deposito.includes('caba') || deposito.includes('capital') || deposito.includes('buenos aires');
      const esEntreRios = deposito.includes('entre') && (deposito.includes('rios') || deposito.includes('ríos'));

      if (esCABA) {
        stockPorProducto[productoId].stockCABA += cantidad;
        stockPorProducto[productoId].stockReservadoCABA += stockReservado;
      } else if (esEntreRios) {
        stockPorProducto[productoId].stockEntreRios += cantidad;
      }

      if (!stockPorProducto[productoId].descripcion && descripcion) {
        stockPorProducto[productoId].descripcion = descripcion;
      }
    }
  });

  return stockPorProducto;
}

// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { ExcelRow } from '@/app/stores/estimarDemandaStore';
import {
  parseExcelDate,
  agruparVentasPorProducto,
  agruparStockPorProducto,
} from './agrupadorDatosDemanda';
import { evaluarCriticidadDemanda } from './calculadorCriticidadDemanda';

export interface Mapeo {
  ventas: {
    productoId: string;
    cantidad: string;
    fecha: string;
    descripcion?: string;
  };
  stock: {
    productoId: string;
    cantidad: string;
    deposito: string;
    stockReservado?: string;
    descripcion?: string;
  };
}

export type Criticidad = 'alta' | 'media' | 'baja';

export interface ResultadoItem {
  productoId: string | number;
  descripcion: string;
  venta: number;
  stockCABA: number;
  stockReservadoCABA: number;
  stockNetoCABA: number;
  stockEntreRios: number;
  mesesCobertura: number;
  demandaInsatisfecha: number;
  pedirAEntreRios: string;
  sugerencia: string;
  criticidad: Criticidad;
}

export function getCriticalityColor(criticidad: 'alta' | 'media' | 'baja'): string {
  switch (criticidad) {
    case 'alta':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    case 'media':
      return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    case 'baja':
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

export function estimarDemanda(
  ventasData: ExcelRow[],
  stockData: ExcelRow[],
  mapeo: Mapeo
): ResultadoItem[] {
  const ventasPorMes: Record<string, ExcelRow[]> = {};
  ventasData.forEach((row) => {
    const fechaCruda = row[mapeo.ventas.fecha];
    if (fechaCruda === null || fechaCruda === undefined) return;
    const fecha = parseExcelDate(fechaCruda);
    if (!fecha) return;

    const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    if (!ventasPorMes[mesKey]) ventasPorMes[mesKey] = [];
    ventasPorMes[mesKey].push(row);
  });

  const mesesConVentas = Object.keys(ventasPorMes);
  if (mesesConVentas.length === 0) return [];

  const mesConMasVentas = mesesConVentas.reduce((a, b) =>
    ventasPorMes[a].length > ventasPorMes[b].length ? a : b
  );
  const datosMesSeleccionado = ventasPorMes[mesConMasVentas];

  const ventasPorProducto = agruparVentasPorProducto(datosMesSeleccionado, mapeo);
  const stockPorProducto = agruparStockPorProducto(stockData, mapeo);

  const resultados: ResultadoItem[] = Object.keys(ventasPorProducto).map((productoId) => {
    const ventaInfo = ventasPorProducto[productoId];
    const stockInfo = stockPorProducto[productoId];

    const stockCABA = stockInfo ? stockInfo.stockCABA : 0;
    const stockReservadoCABA = stockInfo ? stockInfo.stockReservadoCABA : 0;
    const stockNetoCABA = Math.max(0, stockCABA - stockReservadoCABA);
    const stockEntreRios = stockInfo ? stockInfo.stockEntreRios : 0;

    const ventaMensual = Math.abs(ventaInfo.cantidad);
    const mesesCoberturaCABA = ventaMensual > 0 ? stockNetoCABA / ventaMensual : 999;

    const evaluacion = evaluarCriticidadDemanda(
      ventaMensual,
      stockNetoCABA,
      stockCABA,
      stockEntreRios,
      mesesCoberturaCABA
    );

    const descripcionFinal = ventaInfo.descripcion || stockInfo?.descripcion || 'Sin descripción';

    return {
      productoId,
      descripcion: descripcionFinal,
      venta: ventaMensual,
      stockCABA,
      stockReservadoCABA,
      stockNetoCABA,
      stockEntreRios,
      mesesCobertura: Math.round(mesesCoberturaCABA),
      demandaInsatisfecha: Math.max(0, ventaMensual * 4 - stockNetoCABA),
      pedirAEntreRios: evaluacion.pedirAEntreRios,
      sugerencia: evaluacion.sugerencia,
      criticidad: evaluacion.criticidad,
    };
  });

  return resultados.sort((a, b) => {
    const criticalityOrder: Record<Criticidad, number> = { alta: 0, media: 1, baja: 2 };
    const aCriticality = criticalityOrder[a.criticidad];
    const bCriticality = criticalityOrder[b.criticidad];
    if (aCriticality !== bCriticality) return aCriticality - bCriticality;
    return a.mesesCobertura - b.mesesCobertura;
  });
}

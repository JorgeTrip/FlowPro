// © 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

import { Venta } from '../reporte-de-ventas/lib/types';
import type { ReporteResultados } from '../reporte-de-ventas/types/reporte';
import {
  obtenerMesesConDatos,
  agruparVentasPorMes,
  agruparVentasPorMesCantidad,
} from '../reporte-de-ventas/services/agrupadorVentasGenerales';
import {
  agruparPorRubro,
  agruparPorRubroCantidad,
  agruparPorZona,
  agruparPorZonaCantidad,
} from '../reporte-de-ventas/services/agrupadorVentasRubroZona';
import {
  agruparPorVendedor,
  agruparPorVendedorCantidad,
  generarDebugLogVendedores,
} from '../reporte-de-ventas/services/agrupadorVentasVendedor';
import {
  topProductosMasVendidos,
  topProductosMasVendidosImporte,
  topProductosMenosVendidos,
  topProductosPorCategoria,
  topClientesPorRubro,
} from '../reporte-de-ventas/services/agrupadorTopsVentas';

export type { ReporteResultados };

/**
 * Genera un reporte completo a partir de los datos de ventas.
 * @param clienteVendorMap - Mapa opcional de Cód. cliente → vendedor real (desde nómina de clientes)
 */
export function generarReporte(
  ventas: Venta[],
  clienteVendorMap?: Map<string, string>
): ReporteResultados {
  const debugLog = generarDebugLogVendedores(ventas, clienteVendorMap);
  const mesesConDatos = obtenerMesesConDatos(ventas);

  return {
    // Por importe
    ventasPorMes: agruparVentasPorMes(ventas),
    ventasPorRubro: agruparPorRubro(ventas),
    ventasPorZona: agruparPorZona(ventas),
    ventasPorVendedor: agruparPorVendedor(ventas, clienteVendorMap),
    // Por cantidad
    cantidadesPorMes: agruparVentasPorMesCantidad(ventas),
    cantidadesPorRubro: agruparPorRubroCantidad(ventas),
    cantidadesPorZona: agruparPorZonaCantidad(ventas),
    cantidadesPorVendedor: agruparPorVendedorCantidad(ventas, clienteVendorMap),
    // Tops
    topProductosMasVendidos: topProductosMasVendidos(ventas, -1, 'conDatos', mesesConDatos),
    topProductosMasVendidosPorImporte: topProductosMasVendidosImporte(ventas, -1, 'conDatos', mesesConDatos),
    topProductosMenosVendidos: topProductosMenosVendidos(ventas, -1, 'conDatos', mesesConDatos),
    topProductosPorCategoriaPorCantidad: topProductosPorCategoria(ventas, -1, 'conDatos', mesesConDatos, 'cantidad'),
    topProductosPorCategoriaPorImporte: topProductosPorCategoria(ventas, -1, 'conDatos', mesesConDatos, 'importe'),
    topClientesMinoristas: topClientesPorRubro(ventas, 'Minoristas', 20, 'importe', 'mas', 'conDatos', mesesConDatos),
    topClientesDistribuidores: topClientesPorRubro(ventas, 'Distribuidores', 20, 'importe', 'mas', 'conDatos', mesesConDatos),
    topClientesMinoristasPorCantidad: topClientesPorRubro(ventas, 'Minoristas', 20, 'cantidad', 'mas', 'conDatos', mesesConDatos),
    topClientesDistribuidoresPorCantidad: topClientesPorRubro(ventas, 'Distribuidores', 20, 'cantidad', 'mas', 'conDatos', mesesConDatos),
    // Log de debug del cruce de vendedores
    vendedorDebugLog: debugLog,
  };
}

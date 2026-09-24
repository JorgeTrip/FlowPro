// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

/**
 * ==========================================
 * CONFIGURACIONES DE MAPEO DE EXCEL
 * ==========================================
 */

export interface MapeoProductos {
  codigo: string;
  descripcion: string;
  unidadMedida: string;
  puntoPedido?: string;
}

export interface MapeoFormulas {
  codigoProducto: string;
  descripcionProducto: string;
  codigoComponente: string;
  descripcionComponente: string;
  cantidad: string;
  unidadMedidaComponente: string;
  contenido?: string;
}

export interface MapeoStock {
  codigoProducto: string;
  deposito: string;
  stockFisico: string;
  stockReservado?: string;
  unidadMedida?: string;
  cantidadARecibir?: string;
}

export interface MapeoConsumo {
  codigoProducto: string;
  cantidadConsumida: string;
  anio?: string;
  mes?: string;
}

export interface MapeoStockPT {
  codigo: string;
  descripcion: string;
  descripcionAdicional?: string;
}

export interface MapeoPedidosCompra {
  fechaSolicitud: string;
  codigoProducto: string;
  cantidadSolicitada: string;
  cantidadRecibida: string;
}

export interface ProductoTerminadoMaestro {
  codigo: string;
  descripcion: string;
  descripcionAdicional: string;
}

/**
 * Objeto unificado que consolida la configuración de los mapeos de Excel del módulo.
 */
export interface ConfiguracionMapeoFormulas {
  productos: MapeoProductos | null;
  formulas: MapeoFormulas | null;
  stock: MapeoStock | null;
  consumo: MapeoConsumo | null;
  stockPT: MapeoStockPT | null;
  consumoSemi?: MapeoConsumo | null;
  pedidosCompra?: MapeoPedidosCompra | null;
}

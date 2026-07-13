// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

/**
 * ==========================================
 * SECCIÓN 1: MODELOS DE DATOS PRINCIPALES (BOM)
 * ==========================================
 */

/**
 * Representa un producto del catálogo, que puede ser tanto una materia prima (MP),
 * un producto semielaborado (SE) o un producto terminado (PT).
 */
export interface Producto {
  /** Código único del producto (código Tango o código de barras) */
  codigo: string;
  /** Nombre o descripción detallada del artículo */
  descripcion: string;
  /** Unidad de Medida (ej: "kg", "u", "l", "m") */
  unidadMedida: string;
  /** Nivel de existencias mínimo a partir del cual se debe emitir un pedido de reposición */
  puntoPedido: number;
  /** Categoría a la que pertenece el producto para facilitar filtrados (ej: "Hierbas", "Envases") */
  categoria?: string;
  /** Costo unitario estimado para análisis de costo de fórmulas */
  costo?: number;
  /** Contenido o presentación del producto terminado (ej: X 1 KG, X 1/2 KG) */
  contenido?: string;
}

/**
 * Representa un insumo o componente dentro de una receta o fórmula.
 */
export interface ComponenteFormula {
  /** Código del producto componente (materia prima o semielaborado) */
  codigoComponente: string;
  /** Descripción del componente para rápida lectura visual en UI sin necesidad de un join manual */
  descripcion: string;
  /** Cantidad neta requerida del componente para la base de la fórmula */
  cantidad: number;
  /** Unidad de medida del componente (debe ser compatible con el catálogo de productos) */
  unidadMedida: string;
}

/**
 * Representa una Receta o Estructura de Producto (Bill of Materials - BOM).
 * Define qué componentes componen a un producto terminado o semielaborado.
 */
export interface Formula {
  /** Código del producto principal (el que se fabrica, habitualmente PT o SE) */
  codigoProducto: string;
  /** Descripción del producto resultante de la fórmula */
  descripcion: string;
  /** Listado de insumos y materiales requeridos para su elaboración */
  componentes: ComponenteFormula[];
  /** Unidad de medida del producto resultante */
  unidadMedida: string;
  /** Cantidad base producida con esta receta (generalmente 1, 100 o 1000 unidades) */
  rendimiento: number;
  /** Número incremental de la versión de la receta */
  version: number;
  /** Estado del ciclo de vida de esta versión */
  estado: 'activa' | 'obsoleta' | 'borrador';
  /** Fecha de creación o importación del registro (ISO String) */
  fechaCreacion: string;
  /** Contenido o presentación del producto (ej: X 1 KG, X 1/2 KG) */
  contenido?: string;
}

/**
 * ==========================================
 * SECCIÓN 2: ESTRUCTURAS DE STOCK Y CONSUMO (MRP)
 * ==========================================
 */

/**
 * Estructura de almacenamiento del stock desagregada por depósito físico.
 * Permite realizar análisis de disponibilidad local e interdepósito.
 */
export interface StockPorDeposito {
  /** Código del producto (debe coincidir con Producto.codigo) */
  codigoProducto: string;
  /** Identificador o nombre del depósito (ej: "CABA", "Entre Ríos") */
  deposito: string;
  /** Cantidad total de inventario físicamente presente en el depósito */
  stockFisico: number;
  /** Cantidad de stock ya comprometida o reservada para órdenes existentes */
  stockReservado: number;
  /** Cantidad real utilizable para producción (Calculado: stockFisico - stockReservado) */
  stockDisponible: number;
  /** Unidad de Medida del control de stock */
  unidadMedida?: string;
  /** Cantidad pendiente de recepción */
  cantidadARecibir?: number;
}

/**
 * Registro de consumos históricos de un insumo o producto terminado.
 * Útil para calcular la demanda futura y alimentar la lógica MRP de planificación.
 */
export interface ConsumoMensual {
  /** Código del producto consumido */
  codigoProducto: string;
  /** Año del registro (ej: 2026) */
  anio: number;
  /** Mes del registro (1 a 12) */
  mes: number;
  /** Cantidad total consumida en ese período */
  cantidadConsumida: number;
}

/**
 * ==========================================
 * SECCIÓN 3: CONFIGURACIONES DE MAPEO DE EXCEL
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
}

/**
 * ==========================================
 * SECCIÓN 4: ESTRUCTURAS DE RESULTADOS MRP
 * ==========================================
 */

/**
 * Representa el desglose del producto terminado que demanda una materia prima.
 */
export interface DesgloseProducto {
  codigoProducto: string;
  descripcion: string;
  rotacion: number;
  stockPTEntreRios: number;
  stockPTCABA: number;
  cantidadFabricarCABA: number;
  cantidadFabricarER: number;
  transferirPT: number;
}

/**
 * Representa el cálculo de requerimiento sugerido de una materia prima.
 */
export interface ResultadoMRP {
  codigoMP: string;
  descripcionMP: string;
  unidadMedida: string;
  stockMPEntreRios: number;
  stockMPCABA: number;
  cantidadSugerida: number;
  movimientoSugerido: {
    tipo: 'sin_accion' | 'transferencia' | 'compra' | 'combinado';
    transferencia?: number;
    compra?: number;
  };
  criticidad: 'alta' | 'media' | 'baja';
  productosUsados: DesgloseProducto[];
}

/**
 * Representa la propuesta de abastecimiento de un producto terminado tercerizado.
 */
export interface ResultadoTercerizadosMRP {
  codigoPT: string;
  descripcionPT: string;
  stockPTEntreRios: number;
  stockPTCABA: number;
  rotacion: number;
  movimientoSugerido: {
    tipo: 'sin_accion' | 'transferencia' | 'compra' | 'combinado';
    transferencia?: number;
    compra?: number;
  };
  criticidad: 'alta' | 'media' | 'baja';
}

/**
 * Agrupa los resultados consolidados de productos propios y tercerizados.
 */
export interface ResultadosMRPFinal {
  propios: ResultadoMRP[];
  tercerizados: ResultadoTercerizadosMRP[];
}


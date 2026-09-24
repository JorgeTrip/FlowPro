// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

/**
 * Representa un producto del catálogo (materia prima MP, semielaborado SE o terminado PT).
 */
export interface Producto {
  codigo: string;
  descripcion: string;
  unidadMedida: string;
  puntoPedido: number;
  categoria?: string;
  costo?: number;
  contenido?: string;
}

/**
 * Representa un insumo o componente dentro de una receta o fórmula.
 */
export interface ComponenteFormula {
  codigoComponente: string;
  descripcion: string;
  cantidad: number;
  unidadMedida: string;
}

/**
 * Representa una Receta o Estructura de Producto (Bill of Materials - BOM).
 */
export interface Formula {
  codigoProducto: string;
  descripcion: string;
  componentes: ComponenteFormula[];
  unidadMedida: string;
  rendimiento: number;
  version: number;
  estado: 'activa' | 'obsoleta' | 'borrador';
  fechaCreacion: string;
  contenido?: string;
}

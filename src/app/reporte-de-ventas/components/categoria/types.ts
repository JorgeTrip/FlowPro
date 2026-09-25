export interface Producto {
  articulo: string;
  descripcion: string;
  cantidad: number;
  total: number;
}

export interface CategoriaData {
  categoria: string;
  cantidadCategoria: number;
  totalCategoria: number;
  productos: Producto[];
}

export interface DatoGraficoCategoria {
  name: string;
  value: number;
  isCategory?: boolean;
  categoria?: string;
  porcentaje?: number;
  articulo?: string;
  descripcion?: string;
}

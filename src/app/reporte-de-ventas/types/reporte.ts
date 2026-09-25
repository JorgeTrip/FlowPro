// Define la estructura para los resultados del reporte final de ventas
export interface ReporteResultados {
  // Por importe
  ventasPorMes: Record<string, { A: number; X: number; AX: number }>;
  ventasPorRubro: Record<string, Record<string, { A: number; X: number; AX: number }>>;
  ventasPorZona: Record<string, Record<string, { A: number; X: number; AX: number }>>;
  ventasPorVendedor: {
    resultado: Record<string, Record<string, { A: number; X: number; AX: number }>>;
    vendedores: string[];
  };
  // Por cantidad
  cantidadesPorMes: Record<string, { A: number; X: number; AX: number }>;
  cantidadesPorRubro: Record<string, Record<string, { A: number; X: number; AX: number }>>;
  cantidadesPorZona: Record<string, Record<string, { A: number; X: number; AX: number }>>;
  cantidadesPorVendedor: {
    resultado: Record<string, Record<string, { A: number; X: number; AX: number }>>;
    vendedores: string[];
  };
  // Tops
  topProductosMasVendidos: { articulo: string; descripcion: string; cantidad: number }[];
  topProductosMasVendidosPorImporte: { articulo: string; descripcion: string; total: number }[];
  topProductosMenosVendidos: { articulo: string; descripcion: string; cantidad: number }[];
  topProductosPorCategoriaPorCantidad: {
    categoria: string;
    cantidadCategoria: number;
    totalCategoria: number;
    productos: { articulo: string; descripcion: string; cantidad: number; total: number }[];
  }[];
  topProductosPorCategoriaPorImporte: {
    categoria: string;
    cantidadCategoria: number;
    totalCategoria: number;
    productos: { articulo: string; descripcion: string; cantidad: number; total: number }[];
  }[];
  topClientesMinoristas: { cliente: string; total: number }[];
  topClientesDistribuidores: { cliente: string; total: number }[];
  topClientesMinoristasPorCantidad: { cliente: string; total: number }[];
  topClientesDistribuidoresPorCantidad: { cliente: string; total: number }[];
  // Debug log del cruce de vendedores
  vendedorDebugLog: string[];
}

import { exportToExcel } from '../../lib/exportUtils';
import { CategoriaData } from './types';

export function exportarDatosTablaCategoria(
  datosProcesados: CategoriaData[],
  totalesGenerales: { cantidad: number; importe: number },
  mostrarCantidad: boolean,
  mostrarPorcentajes: boolean
): void {
  const calcularPorcentaje = (valor: number, total: number) => {
    return total > 0 ? ((valor / total) * 100).toFixed(1) + '%' : '0%';
  };

  const headers = mostrarPorcentajes
    ? ['Categoría/Producto', 'Artículo', 'Descripción', mostrarCantidad ? 'Cantidad' : 'Importe', '% Total', '% Categoría']
    : ['Categoría/Producto', 'Artículo', 'Descripción', mostrarCantidad ? 'Cantidad' : 'Importe'];

  const rows: (string | number)[][] = [];

  datosProcesados.forEach((categoria) => {
    const totalGeneral = mostrarCantidad ? totalesGenerales.cantidad : totalesGenerales.importe;
    const valorCategoria = mostrarCantidad ? categoria.cantidadCategoria : categoria.totalCategoria;

    const filaCat = [
      `CATEGORÍA: ${categoria.categoria}`,
      '',
      '',
      valorCategoria,
    ];

    if (mostrarPorcentajes) {
      filaCat.push(calcularPorcentaje(valorCategoria, totalGeneral));
      filaCat.push('100%');
    }

    rows.push(filaCat);

    categoria.productos.forEach((producto) => {
      const valorProducto = mostrarCantidad ? producto.cantidad : producto.total;
      const filaProducto = [
        `  ${producto.articulo}`,
        producto.articulo,
        producto.descripcion,
        valorProducto,
      ];

      if (mostrarPorcentajes) {
        filaProducto.push(calcularPorcentaje(valorProducto, totalGeneral));
        filaProducto.push(calcularPorcentaje(valorProducto, valorCategoria));
      }

      rows.push(filaProducto);
    });
  });

  exportToExcel(
    [headers, ...rows],
    `top-productos-categoria-${mostrarCantidad ? 'cantidad' : 'importe'}`,
    'Top Productos Categoria'
  );
}

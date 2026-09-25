import { Venta } from '../lib/types';
import { filtrarVentasPorMes } from './agrupadorVentasGenerales';
import { obtenerCategoria } from './categoriasArticulos';

export { obtenerCategoria };

export function topProductosMasVendidosImporte(
  ventas: Venta[],
  n: number = 20,
  filtroMes: string = 'todos',
  mesesConDatos: string[] = []
) {
  const ventasFiltradas = filtrarVentasPorMes(ventas, filtroMes, mesesConDatos);
  const map: Record<string, { total: number; descripcion: string }> = {};
  ventasFiltradas.forEach((v) => {
    if (!v.Articulo) return;
    if (!map[v.Articulo]) {
      map[v.Articulo] = { total: 0, descripcion: v.Descripcion || '' };
    }
    const comprobante = v.NroComprobante.toUpperCase();
    const importe = comprobante.startsWith('X') ? v.Total : v.TotalCIVA;
    map[v.Articulo].total += importe;
    if (!map[v.Articulo].descripcion && v.Descripcion) {
      map[v.Articulo].descripcion = v.Descripcion;
    }
  });

  const resultado = Object.entries(map)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([articulo, data]) => ({ articulo, descripcion: data.descripcion, total: data.total }));

  return n > 0 ? resultado.slice(0, n) : resultado;
}

export function topProductosMasVendidos(
  ventas: Venta[],
  n: number = 20,
  filtroMes: string = 'todos',
  mesesConDatos: string[] = []
) {
  const ventasFiltradas = filtrarVentasPorMes(ventas, filtroMes, mesesConDatos);
  const map: Record<string, { cantidad: number; descripcion: string }> = {};
  ventasFiltradas.forEach((v) => {
    if (!v.Articulo) return;
    if (!map[v.Articulo]) {
      map[v.Articulo] = { cantidad: 0, descripcion: v.Descripcion || '' };
    }
    map[v.Articulo].cantidad += v.Cantidad;
    if (!map[v.Articulo].descripcion && v.Descripcion) {
      map[v.Articulo].descripcion = v.Descripcion;
    }
  });

  const resultado = Object.entries(map)
    .sort((a, b) => b[1].cantidad - a[1].cantidad)
    .map(([articulo, data]) => ({ articulo, descripcion: data.descripcion, cantidad: data.cantidad }));

  return n > 0 ? resultado.slice(0, n) : resultado;
}

export function topProductosMenosVendidos(
  ventas: Venta[],
  n: number = 20,
  filtroMes: string = 'todos',
  mesesConDatos: string[] = []
) {
  const ventasFiltradas = filtrarVentasPorMes(ventas, filtroMes, mesesConDatos);
  const map: Record<string, { cantidad: number; descripcion: string }> = {};
  ventasFiltradas.forEach((v) => {
    if (!v.Articulo) return;
    if (!map[v.Articulo]) {
      map[v.Articulo] = { cantidad: 0, descripcion: v.Descripcion };
    }
    map[v.Articulo].cantidad += v.Cantidad;
  });

  const resultado = Object.entries(map)
    .filter(([, data]) => data.cantidad > 0)
    .sort((a, b) => a[1].cantidad - b[1].cantidad)
    .map(([articulo, data]) => ({ articulo, descripcion: data.descripcion, cantidad: data.cantidad }));

  return n > 0 ? resultado.slice(0, n) : resultado;
}

export function topProductosPorCategoria(
  ventas: Venta[],
  n: number = 5,
  filtroMes: string = 'todos',
  mesesConDatos: string[] = [],
  sortBy: 'cantidad' | 'importe' = 'cantidad'
) {
  const ventasFiltradas = filtrarVentasPorMes(ventas, filtroMes, mesesConDatos);
  const categoriasMap: Record<string, {
    productos: Record<string, { articulo: string; descripcion: string; cantidad: number; total: number }>;
    cantidadCategoria: number;
    totalCategoria: number;
  }> = {};

  ventasFiltradas.forEach((v) => {
    if (!v.Articulo) return;
    const categoria = obtenerCategoria(v.Articulo);
    if (!categoriasMap[categoria]) {
      categoriasMap[categoria] = { productos: {}, cantidadCategoria: 0, totalCategoria: 0 };
    }

    if (!categoriasMap[categoria].productos[v.Articulo]) {
      categoriasMap[categoria].productos[v.Articulo] = {
        articulo: v.Articulo,
        descripcion: v.Descripcion,
        cantidad: 0,
        total: 0,
      };
    }

    const comprobante = v.NroComprobante.toUpperCase();
    const importe = comprobante.startsWith('X') ? v.Total : v.TotalCIVA;
    categoriasMap[categoria].productos[v.Articulo].cantidad += v.Cantidad;
    categoriasMap[categoria].productos[v.Articulo].total += importe;
    categoriasMap[categoria].cantidadCategoria += v.Cantidad;
    categoriasMap[categoria].totalCategoria += importe;
  });

  return Object.entries(categoriasMap).map(([categoria, data]) => {
    const productosArray = Object.values(data.productos);
    const sortedProductos = [...productosArray].sort((a, b) => {
      return sortBy === 'cantidad' ? b.cantidad - a.cantidad : b.total - a.total;
    });
    return {
      categoria,
      cantidadCategoria: data.cantidadCategoria,
      totalCategoria: data.totalCategoria,
      productos: n > 0 ? sortedProductos.slice(0, n) : sortedProductos,
    };
  }).sort((a, b) => {
    return sortBy === 'cantidad' ? b.cantidadCategoria - a.cantidadCategoria : b.totalCategoria - a.totalCategoria;
  });
}

export function topClientesPorRubro(
  ventas: Venta[],
  tipo: 'Minoristas' | 'Distribuidores',
  n: number = 20,
  metrica: 'importe' | 'cantidad' = 'importe',
  orden: 'mas' | 'menos' = 'mas',
  filtroMes: string = 'todos',
  mesesConDatos: string[] = []
) {
  const ventasFiltradas = filtrarVentasPorMes(ventas, filtroMes, mesesConDatos);
  const mapImporte: Record<string, number> = {};
  const mapCantidad: Record<string, number> = {};

  ventasFiltradas.forEach((v) => {
    const esDistribuidor = v.DescRubro === 'DISTRIBUIDOR';
    if ((tipo === 'Distribuidores' && !esDistribuidor) || (tipo === 'Minoristas' && esDistribuidor)) return;
    if (!v.Cliente) return;

    const comprobante = v.NroComprobante.toUpperCase();
    const importe = comprobante.startsWith('X') ? v.Total : v.TotalCIVA;
    mapImporte[v.Cliente] = (mapImporte[v.Cliente] || 0) + importe;
    mapCantidad[v.Cliente] = (mapCantidad[v.Cliente] || 0) + v.Cantidad;
  });

  const map = metrica === 'importe' ? mapImporte : mapCantidad;
  const entries = Object.entries(map).filter(([_, value]) => value > 0);
  const sortedEntries = orden === 'mas'
    ? entries.sort((a, b) => b[1] - a[1])
    : entries.sort((a, b) => a[1] - b[1]);

  return sortedEntries.slice(0, n).map(([cliente, total]) => ({ cliente, total }));
}

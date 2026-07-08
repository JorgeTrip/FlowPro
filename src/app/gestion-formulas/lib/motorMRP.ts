// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import {
  Producto,
  Formula,
  StockPorDeposito,
  ConsumoMensual,
} from './types';

export interface ResultadoMRP {
  codigoProducto: string;
  descripcion: string;
  stockCABAMP: number;
  stockERMP: number;
  stockCABAPT: number;
  stockERPT: number;
  stockTotalDisponible: number;
  puntoPedido: number;
  consumoMensual: number;
  demandaBruta: number;
  cantidadSugerida: number;
  criticidad: 'alta' | 'media' | 'baja';
  tipo: 'PT' | 'MP';
  contenido?: string;
  cantidadARecibirCABA: number;
  cantidadARecibirER: number;
  cantidadARecibirTotal: number;
}

/**
 * Determina el nivel de criticidad según el stock disponible, la demanda y el punto de pedido.
 */
function calcularCriticidad(
  stockTotal: number,
  puntoPedido: number,
  demandaBruta: number,
  consumoMensual: number
): 'alta' | 'media' | 'baja' {
  // Quiebre o punto de pedido superado negativamente
  if (stockTotal <= puntoPedido || (demandaBruta > 0 && stockTotal < consumoMensual)) {
    return 'alta';
  }
  // Alerta preventiva: stock cubre consumo inmediato pero no cubre la proyección completa
  if (stockTotal < demandaBruta || stockTotal <= puntoPedido * 1.2) {
    return 'media';
  }
  return 'baja';
}

/**
 * Función pura que implementa el algoritmo MRP con explosión de materiales BOM.
 * Procesa stocks multi-depósito (CABA y Entre Ríos) y genera las sugerencias de compras.
 */
export function calcularRequerimientosMRP(
  productos: Producto[],
  formulas: Formula[],
  stocks: StockPorDeposito[],
  consumos: ConsumoMensual[],
  mesesProyeccion: number = 3
): ResultadoMRP[] {
  // 1. Filtrar recetas que estén en estado 'activa'
  const recetasActivas = formulas.filter((f) => f.estado === 'activa');
  const recetasMap = new Map<string, Formula>();
  recetasActivas.forEach((r) => recetasMap.set(r.codigoProducto, r));

  // Mapa para acumular las demandas explotadas de insumos (Materias Primas)
  const demandaInsumosExplotados = new Map<string, number>();

  // 2. Primer paso: Calcular necesidades netas y fabricaciones sugeridas para Productos Terminados (PT)
  const productosPT = productos.filter((p) => recetasMap.has(p.codigo));
  const resultadosPT: ResultadoMRP[] = [];

  productosPT.forEach((prod) => {
    const receta = recetasMap.get(prod.codigo)!;

    // Calcular consumo mensual promedio histórico
    const consumosFiltrados = consumos.filter((c) => c.codigoProducto === prod.codigo);
    const consumoMensual =
      consumosFiltrados.length > 0
        ? consumosFiltrados.reduce((sum, c) => sum + c.cantidadConsumida, 0) / consumosFiltrados.length
        : 0;

    const demandaBruta = consumoMensual * mesesProyeccion;

    // Consolidar existencias de PT
    const stocksProducto = stocks.filter((s) => s.codigoProducto === prod.codigo);
    const stockCABA = stocksProducto.find((s) => s.deposito.toLowerCase().includes('caba'))?.stockDisponible || 0;
    const stockER = stocksProducto.find((s) => s.deposito.toLowerCase().includes('entre') || s.deposito.toLowerCase().includes('rios'))?.stockDisponible || 0;
    const stockTotal = stockCABA + stockER;

    const aRecibirCABA = stocksProducto.find((s) => s.deposito.toLowerCase().includes('caba'))?.cantidadARecibir || 0;
    const aRecibirER = stocksProducto.find((s) => s.deposito.toLowerCase().includes('entre') || s.deposito.toLowerCase().includes('rios'))?.cantidadARecibir || 0;

    // Faltante o necesidad neta de PT
    const necesidadNeta = Math.max(0, demandaBruta - stockTotal);

    resultadosPT.push({
      codigoProducto: prod.codigo,
      descripcion: prod.descripcion,
      stockCABAMP: 0,
      stockERMP: 0,
      stockCABAPT: stockCABA,
      stockERPT: stockER,
      stockTotalDisponible: stockTotal,
      puntoPedido: prod.puntoPedido,
      consumoMensual,
      demandaBruta,
      cantidadSugerida: necesidadNeta,
      criticidad: calcularCriticidad(stockTotal, prod.puntoPedido, demandaBruta, consumoMensual),
      tipo: 'PT',
      contenido: prod.contenido,
      cantidadARecibirCABA: aRecibirCABA,
      cantidadARecibirER: aRecibirER,
      cantidadARecibirTotal: aRecibirCABA + aRecibirER,
    });

    // Explosión de Materiales (BOM Explosion): si falta PT, cargamos proporcionalmente la demanda a las materias primas
    if (necesidadNeta > 0) {
      receta.componentes.forEach((comp) => {
        const proporc = comp.cantidad / (receta.rendimiento || 1);
        const demandaMP = necesidadNeta * proporc;
        const acumulado = demandaInsumosExplotados.get(comp.codigoComponente) || 0;
        demandaInsumosExplotados.set(comp.codigoComponente, acumulado + demandaMP);
      });
    }
  });

  // 3. Segundo paso: Calcular necesidades netas y compras sugeridas para Materias Primas (MP)
  const productosMP = productos.filter((p) => !recetasMap.has(p.codigo));
  const resultadosMP: ResultadoMRP[] = [];

  productosMP.forEach((prod) => {
    // La demanda bruta de la MP es el consumo histórico del producto + la demanda explotada de recetas
    const consumosFiltrados = consumos.filter((c) => c.codigoProducto === prod.codigo);
    const consumoHistorico =
      consumosFiltrados.length > 0
        ? consumosFiltrados.reduce((sum, c) => sum + c.cantidadConsumida, 0) / consumosFiltrados.length
        : 0;

    const demandaHistorica = consumoHistorico * mesesProyeccion;
    const demandaBOM = demandaInsumosExplotados.get(prod.codigo) || 0;
    const demandaBruta = demandaHistorica + demandaBOM;

    // Consolidar existencias de MP
    const stocksProducto = stocks.filter((s) => s.codigoProducto === prod.codigo);
    const stockCABA = stocksProducto.find((s) => s.deposito.toLowerCase().includes('caba'))?.stockDisponible || 0;
    const stockER = stocksProducto.find((s) => s.deposito.toLowerCase().includes('entre') || s.deposito.toLowerCase().includes('rios'))?.stockDisponible || 0;
    const stockTotal = stockCABA + stockER;

    const aRecibirCABA = stocksProducto.find((s) => s.deposito.toLowerCase().includes('caba'))?.cantidadARecibir || 0;
    const aRecibirER = stocksProducto.find((s) => s.deposito.toLowerCase().includes('entre') || s.deposito.toLowerCase().includes('rios'))?.cantidadARecibir || 0;

    const necesidadNeta = Math.max(0, demandaBruta - stockTotal);

    resultadosMP.push({
      codigoProducto: prod.codigo,
      descripcion: prod.descripcion,
      stockCABAMP: stockCABA,
      stockERMP: stockER,
      stockCABAPT: 0,
      stockERPT: 0,
      stockTotalDisponible: stockTotal,
      puntoPedido: prod.puntoPedido,
      consumoMensual: consumoHistorico,
      demandaBruta,
      cantidadSugerida: necesidadNeta,
      criticidad: calcularCriticidad(stockTotal, prod.puntoPedido, demandaBruta, consumoHistorico),
      tipo: 'MP',
      contenido: prod.contenido,
      cantidadARecibirCABA: aRecibirCABA,
      cantidadARecibirER: aRecibirER,
      cantidadARecibirTotal: aRecibirCABA + aRecibirER,
    });
  });

  // Retornar la unificación ordenada por tipo de producto y luego por criticidad/código
  return [...resultadosPT, ...resultadosMP].sort((a, b) => {
    if (a.tipo !== b.tipo) return a.tipo === 'PT' ? -1 : 1;
    const pesoCriticidad = { alta: 3, media: 2, baja: 1 };
    return pesoCriticidad[b.criticidad] - pesoCriticidad[a.criticidad] || a.codigoProducto.localeCompare(b.codigoProducto);
  });
}

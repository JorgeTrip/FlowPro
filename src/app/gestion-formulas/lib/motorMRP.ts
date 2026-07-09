// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import {
  Producto, Formula, StockPorDeposito, ConsumoMensual, ProductoTerminadoMaestro,
} from './types';

export interface DesgloseProducto {
  codigoProducto: string;
  descripcion: string;
  rotacion: number;
}

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

export interface ResultadosMRPFinal {
  propios: ResultadoMRP[];
  tercerizados: ResultadoTercerizadosMRP[];
}

export function calcularMovimientoSugerido(
  demanda: number, stockCABA: number, stockER: number
): ResultadoMRP['movimientoSugerido'] {
  const dispCABA = Math.max(0, stockCABA);
  const dispER = Math.max(0, stockER);
  if (dispCABA >= demanda) return { tipo: 'sin_accion' };
  const faltante = demanda - dispCABA;
  const transf = Math.min(faltante, dispER);
  const compra = faltante - transf;
  if (transf > 0 && compra > 0) return { tipo: 'combinado', transferencia: transf, compra };
  return transf > 0 ? { tipo: 'transferencia', transferencia: transf } : { tipo: 'compra', compra };
}

export function calcularCriticidad(stockTotal: number, consumo: number): 'alta' | 'media' | 'baja' {
  if (consumo <= 0) return 'baja';
  const meses = stockTotal / consumo;
  return meses <= 1 ? 'alta' : meses < 3 ? 'media' : 'baja';
}

export function calcularRequerimientosMRP(
  productos: Producto[], formulas: Formula[], stocks: StockPorDeposito[],
  consumos: ConsumoMensual[], stockPT: ProductoTerminadoMaestro[] = []
): ResultadosMRPFinal {
  const recetasActivas = formulas.filter((f) => f.estado === 'activa');
  const productosMap = new Map<string, Producto>();
  productos.forEach((p) => productosMap.set(p.codigo, p));

  const stockPTMap = new Map<string, ProductoTerminadoMaestro>();
  stockPT.forEach((s) => stockPTMap.set(s.codigo, s));

  const requerimientosMP = new Map<string, {
    descripcion: string; unidadMedida: string; cantidadTotal: number; productosUsados: DesgloseProducto[];
  }>();

  recetasActivas.forEach((receta) => {
    const productoPT = productosMap.get(receta.codigoProducto);
    if (!productoPT) return;

    const consumosPT = consumos.filter((c) => c.codigoProducto === receta.codigoProducto);
    const rotacionMensual = consumosPT.length > 0
      ? consumosPT.reduce((sum, c) => sum + c.cantidadConsumida, 0) / consumosPT.length : 0;
    if (rotacionMensual <= 0) return;

    const maestroPT = stockPTMap.get(receta.codigoProducto);
    const descPTConcat = maestroPT && maestroPT.descripcionAdicional
      ? `${maestroPT.descripcion} (${maestroPT.descripcionAdicional})`
      : (maestroPT?.descripcion || productoPT.descripcion || receta.descripcion);

    receta.componentes.forEach((componente) => {
      const cantidadRequerida = rotacionMensual * componente.cantidad;
      const existente = requerimientosMP.get(componente.codigoComponente);
      if (existente) {
        existente.cantidadTotal += cantidadRequerida;
        const yaUsado = existente.productosUsados.find((p) => p.codigoProducto === receta.codigoProducto);
        if (yaUsado) yaUsado.rotacion += rotacionMensual;
        else existente.productosUsados.push({ codigoProducto: receta.codigoProducto, descripcion: descPTConcat, rotacion: rotacionMensual });
      } else {
        const productoMP = productosMap.get(componente.codigoComponente);
        requerimientosMP.set(componente.codigoComponente, {
          descripcion: productoMP?.descripcion || componente.descripcion,
          unidadMedida: productoMP?.unidadMedida || componente.unidadMedida,
          cantidadTotal: cantidadRequerida,
          productosUsados: [{ codigoProducto: receta.codigoProducto, descripcion: descPTConcat, rotacion: rotacionMensual }],
        });
      }
    });
  });

  const resultadosPropios: ResultadoMRP[] = [];
  requerimientosMP.forEach((req, codigoMP) => {
    const stocksMP = stocks.filter((s) => s.codigoProducto === codigoMP);
    const stockCABA = stocksMP.find((s) => s.deposito.toLowerCase().includes('caba'))?.stockFisico || 0;
    const stockER = stocksMP.find((s) => s.deposito.toLowerCase().includes('entre') || s.deposito.toLowerCase().includes('rios'))?.stockFisico || 0;
    const movimiento = calcularMovimientoSugerido(req.cantidadTotal, stockCABA, stockER);
    resultadosPropios.push({
      codigoMP, descripcionMP: req.descripcion, unidadMedida: req.unidadMedida,
      stockMPEntreRios: stockER, stockMPCABA: stockCABA, cantidadSugerida: req.cantidadTotal,
      movimientoSugerido: movimiento, criticidad: calcularCriticidad(stockCABA + stockER, req.cantidadTotal),
      productosUsados: req.productosUsados,
    });
  });
  resultadosPropios.sort((a, b) => b.cantidadSugerida - a.cantidadSugerida);

  const codigosPropios = new Set(recetasActivas.map((f) => f.codigoProducto));
  const listaTercerizados = stockPT.filter((pt) => !codigosPropios.has(pt.codigo));

  const resultadosTercerizados: ResultadoTercerizadosMRP[] = [];
  listaTercerizados.forEach((pt) => {
    const consumosPT = consumos.filter((c) => c.codigoProducto === pt.codigo);
    const rotacion = consumosPT.length > 0 ? consumosPT.reduce((sum, c) => sum + c.cantidadConsumida, 0) / consumosPT.length : 0;

    const stocksPT = stocks.filter((s) => s.codigoProducto === pt.codigo);
    const stockCABA = stocksPT.find((s) => s.deposito.toLowerCase().includes('caba'))?.stockFisico || 0;
    const stockER = stocksPT.find((s) => s.deposito.toLowerCase().includes('entre') || s.deposito.toLowerCase().includes('rios'))?.stockFisico || 0;
    const movimiento = calcularMovimientoSugerido(rotacion, stockCABA, stockER);
    resultadosTercerizados.push({
      codigoPT: pt.codigo, descripcionPT: pt.descripcionAdicional ? `${pt.descripcion} (${pt.descripcionAdicional})` : pt.descripcion,
      stockPTEntreRios: stockER, stockPTCABA: stockCABA, rotacion,
      movimientoSugerido: movimiento, criticidad: calcularCriticidad(stockCABA + stockER, rotacion),
    });
  });
  resultadosTercerizados.sort((a, b) => b.rotacion - a.rotacion);

  return { propios: resultadosPropios, tercerizados: resultadosTercerizados };
}

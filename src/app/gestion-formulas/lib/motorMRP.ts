// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import {
  Producto,
  Formula,
  StockPorDeposito,
  ConsumoMensual,
  ProductoTerminadoMaestro,
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
}

export interface ResultadosMRPFinal {
  propios: ResultadoMRP[];
  tercerizados: ResultadoTercerizadosMRP[];
}

/**
 * Calcula el movimiento sugerido según la cascada de distribución logística.
 * Prioridad 1: Stock CABA
 * Prioridad 2: Transferencia de Entre Ríos
 * Prioridad 3: Compra
 */
export function calcularMovimientoSugerido(
  demanda: number,
  stockCABA: number,
  stockER: number
): ResultadoMRP['movimientoSugerido'] {
  const disponibleCABA = Math.max(0, stockCABA);
  const disponibleER = Math.max(0, stockER);

  if (disponibleCABA >= demanda) {
    return { tipo: 'sin_accion' };
  }

  const faltante = demanda - disponibleCABA;
  const transferencia = Math.min(faltante, disponibleER);
  const compra = faltante - transferencia;

  if (transferencia > 0 && compra > 0) {
    return { tipo: 'combinado', transferencia, compra };
  }
  if (transferencia > 0) {
    return { tipo: 'transferencia', transferencia };
  }
  return { tipo: 'compra', compra };
}

/**
 * Función pura que implementa el algoritmo MRP con explosión inversa.
 * Agrupa requerimientos por Materia Prima e Insumos para Propios,
 * y calcula stock de PT para Tercerizados.
 */
export function calcularRequerimientosMRP(
  productos: Producto[],
  formulas: Formula[],
  stocks: StockPorDeposito[],
  consumos: ConsumoMensual[],
  stockPT: ProductoTerminadoMaestro[] = []
): ResultadosMRPFinal {
  // 1. Filtrar recetas activas
  const recetasActivas = formulas.filter((f) => f.estado === 'activa');
  const productosMap = new Map<string, Producto>();
  productos.forEach((p) => productosMap.set(p.codigo, p));

  const stockPTMap = new Map<string, ProductoTerminadoMaestro>();
  stockPT.forEach((s) => stockPTMap.set(s.codigo, s));

  // Mapa para consolidar requerimientos de Materias Primas (Propios)
  const requerimientosMP = new Map<string, {
    descripcion: string;
    unidadMedida: string;
    cantidadTotal: number;
    productosUsados: DesgloseProducto[];
  }>();

  // 2. Explosión inversa para Propios
  recetasActivas.forEach((receta) => {
    const productoPT = productosMap.get(receta.codigoProducto);
    if (!productoPT) return;

    // Obtener rotación mensual del PT
    const consumosPT = consumos.filter((c) => c.codigoProducto === receta.codigoProducto);
    const rotacionMensual = consumosPT.length > 0
      ? consumosPT.reduce((sum, c) => sum + c.cantidadConsumida, 0) / consumosPT.length
      : 0;

    if (rotacionMensual <= 0) return;

    // Obtener descripción concatenada con descripción adicional si existe
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
        if (yaUsado) {
          yaUsado.rotacion += rotacionMensual;
        } else {
          existente.productosUsados.push({
            codigoProducto: receta.codigoProducto,
            descripcion: descPTConcat,
            rotacion: rotacionMensual,
          });
        }
      } else {
        const productoMP = productosMap.get(componente.codigoComponente);
        requerimientosMP.set(componente.codigoComponente, {
          descripcion: productoMP?.descripcion || componente.descripcion,
          unidadMedida: productoMP?.unidadMedida || componente.unidadMedida,
          cantidadTotal: cantidadRequerida,
          productosUsados: [{
            codigoProducto: receta.codigoProducto,
            descripcion: descPTConcat,
            rotacion: rotacionMensual,
          }],
        });
      }
    });
  });

  // Consolidar resultados de Propios
  const resultadosPropios: ResultadoMRP[] = [];
  requerimientosMP.forEach((req, codigoMP) => {
    const stocksMP = stocks.filter((s) => s.codigoProducto === codigoMP);
    const stockCABA = stocksMP.find((s) => s.deposito.toLowerCase().includes('caba'))?.stockFisico || 0;
    const stockER = stocksMP.find((s) => s.deposito.toLowerCase().includes('entre') || s.deposito.toLowerCase().includes('rios'))?.stockFisico || 0;

    const movimiento = calcularMovimientoSugerido(req.cantidadTotal, stockCABA, stockER);
    resultadosPropios.push({
      codigoMP,
      descripcionMP: req.descripcion,
      unidadMedida: req.unidadMedida,
      stockMPEntreRios: stockER,
      stockMPCABA: stockCABA,
      cantidadSugerida: req.cantidadTotal,
      movimientoSugerido: movimiento,
      productosUsados: req.productosUsados,
    });
  });
  resultadosPropios.sort((a, b) => b.cantidadSugerida - a.cantidadSugerida);

  // 3. Procesar Canal Tercerizados
  const codigosPropios = new Set(recetasActivas.map((f) => f.codigoProducto));
  const listaTercerizados = stockPT.filter((pt) => !codigosPropios.has(pt.codigo));

  const resultadosTercerizados: ResultadoTercerizadosMRP[] = [];
  listaTercerizados.forEach((pt) => {
    const consumosPT = consumos.filter((c) => c.codigoProducto === pt.codigo);
    const rotacion = consumosPT.length > 0
      ? consumosPT.reduce((sum, c) => sum + c.cantidadConsumida, 0) / consumosPT.length
      : 0;

    const stocksPT = stocks.filter((s) => s.codigoProducto === pt.codigo);
    const stockCABA = stocksPT.find((s) => s.deposito.toLowerCase().includes('caba'))?.stockFisico || 0;
    const stockER = stocksPT.find((s) => s.deposito.toLowerCase().includes('entre') || s.deposito.toLowerCase().includes('rios'))?.stockFisico || 0;

    const movimiento = calcularMovimientoSugerido(rotacion, stockCABA, stockER);
    const descripcionPT = pt.descripcionAdicional ? `${pt.descripcion} (${pt.descripcionAdicional})` : pt.descripcion;

    resultadosTercerizados.push({
      codigoPT: pt.codigo,
      descripcionPT,
      stockPTEntreRios: stockER,
      stockPTCABA: stockCABA,
      rotacion,
      movimientoSugerido: movimiento,
    });
  });
  resultadosTercerizados.sort((a, b) => b.rotacion - a.rotacion);

  return {
    propios: resultadosPropios,
    tercerizados: resultadosTercerizados,
  };
}

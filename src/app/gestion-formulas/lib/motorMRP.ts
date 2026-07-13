// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import {
  Producto, Formula, StockPorDeposito, ConsumoMensual, ProductoTerminadoMaestro,
  DesgloseProducto, ResultadoMRP, ResultadoTercerizadosMRP, ResultadosMRPFinal,
} from './types';
import { calcularMovimientoSugerido, calcularCriticidad } from './calculosAuxiliares';

/**
 * Determina si el nombre de un depósito corresponde a CABA.
 */
function esDepositoCABA(deposito: string): boolean {
  const dep = deposito.toLowerCase();
  return dep.includes('caba') || dep.includes('capital') || dep.includes('buenos aires') || dep.includes('bue') || dep.includes('central');
}

/**
 * Determina si el nombre de un depósito corresponde a Entre Ríos.
 */
function esDepositoEntreRios(deposito: string): boolean {
  const dep = deposito.toLowerCase();
  return dep.includes('entre') || dep.includes('rios') || dep.includes('ríos') || dep.includes('er') || dep.includes('e.r');
}

/**
 * Calcula los requerimientos de Material Requirements Planning (MRP) para productos propios
 * y tercerizados, aplicando la priorización de abastecimiento (CABA fabricable -> ER transferible -> ER fabricable)
 * de forma independiente para cada materia prima en su desglose respectivo.
 * 
 * @param productos Catálogo completo de artículos
 * @param formulas Recetas de fabricación activas
 * @param stocks Existencias físicas por depósito
 * @param consumos Historial de consumos para cálculo de rotación
 * @param stockPT Maestro complementario de productos terminados
 * @param mesesRotacion Factor de proyección de demanda
 */
export function calcularRequerimientosMRP(
  productos: Producto[], formulas: Formula[], stocks: StockPorDeposito[],
  consumos: ConsumoMensual[], stockPT: ProductoTerminadoMaestro[] = [],
  mesesRotacion: number = 1
): ResultadosMRPFinal {
  const recetasActivas = formulas.filter((f) => f.estado === 'activa');
  const productosMap = new Map<string, Producto>();
  productos.forEach((p) => productosMap.set(p.codigo, p));

  const stockPTMap = new Map<string, ProductoTerminadoMaestro>();
  stockPT.forEach((s) => stockPTMap.set(s.codigo, s));

  // Mapa para consolidar la necesidad total de materia prima (MP) requerida por la producción
  const requerimientosMP = new Map<string, {
    descripcion: string;
    unidadMedida: string;
    cantidadTotal: number;
    productosUsados: DesgloseProducto[];
  }>();

  recetasActivas.forEach((receta) => {
    const productoPT = productosMap.get(receta.codigoProducto);
    if (!productoPT) return;

    // Calcular la demanda (rotación proyectada) para el Producto Terminado
    const consumosPT = consumos.filter((c) => c.codigoProducto === receta.codigoProducto);
    const rotacionMensual = consumosPT.length > 0
      ? consumosPT.reduce((sum, c) => sum + c.cantidadConsumida, 0) / consumosPT.length : 0;
    if (rotacionMensual <= 0) return;

    const rotacionTotal = rotacionMensual * mesesRotacion;

    const maestroPT = stockPTMap.get(receta.codigoProducto);
    const descPTConcat = maestroPT && maestroPT.descripcionAdicional
      ? `${maestroPT.descripcion} (${maestroPT.descripcionAdicional})`
      : (maestroPT?.descripcion || productoPT.descripcion || receta.descripcion);

    // Obtener stocks físicos del Producto Terminado por depósito
    const stocksPT = stocks.filter((s) => s.codigoProducto === receta.codigoProducto);
    const stockPTCABA = stocksPT.find((s) => esDepositoCABA(s.deposito))?.stockFisico || 0;
    const stockPTER = stocksPT.find((s) => esDepositoEntreRios(s.deposito))?.stockFisico || 0;

    // Acotar stocks a 0 para prevenir errores de cálculo por saldos negativos en el sistema
    const dispPTCABA = Math.max(0, stockPTCABA);
    const dispPTER = Math.max(0, stockPTER);

    // Faltante inicial en CABA para cubrir la demanda (rotación) de PT
    const faltantePTCABA = Math.max(0, rotacionTotal - dispPTCABA);

    receta.componentes.forEach((componente) => {
      // Obtener el stock físico de esta materia prima específica en CABA
      const stocksMP = stocks.filter((s) => s.codigoProducto === componente.codigoComponente);
      const stockMPCABA = stocksMP.find((s) => esDepositoCABA(s.deposito))?.stockFisico || 0;
      const dispMPCABA = Math.max(0, stockMPCABA);

      // Calcular cuánto PT podemos fabricar en CABA basándonos ÚNICAMENTE en esta materia prima
      let maxFabricablePT = Infinity;
      if (stocksMP.length > 0 && componente.cantidad > 0) {
        maxFabricablePT = dispMPCABA / componente.cantidad;
      }
      if (maxFabricablePT === Infinity) maxFabricablePT = 99999999;

      // 1. Prioridad 1: Fabricación en CABA (limitada por el stock de esta materia prima)
      const cantidadFabricarCABA = Math.min(faltantePTCABA, maxFabricablePT);

      // 2. Faltante remanente tras la simulación de fabricación local
      const faltanteRemanentePT = Math.max(0, faltantePTCABA - cantidadFabricarCABA);

      // 3. Prioridad 2: Transferencia desde Entre Ríos a CABA (si hay stock físico disponible de PT en ER)
      const transferirPT = faltanteRemanentePT > 0 && dispPTER > 0 ? Math.min(faltanteRemanentePT, dispPTER) : 0;

      // 4. Prioridad 3: Fabricar el remanente no cubierto en Entre Ríos
      const cantidadFabricarER = Math.max(0, faltanteRemanentePT - transferirPT);

      // Calcular consumo de esta materia prima basado en la fabricación simulada (CABA + ER)
      const cantidadFabricarTotal = cantidadFabricarCABA + cantidadFabricarER;
      const cantidadRequerida = cantidadFabricarTotal * componente.cantidad;

      const existente = requerimientosMP.get(componente.codigoComponente);
      if (existente) {
        existente.cantidadTotal += cantidadRequerida;
        const yaUsado = existente.productosUsados.find((p) => p.codigoProducto === receta.codigoProducto);
        if (yaUsado) {
          yaUsado.rotacion += rotacionTotal;
          yaUsado.stockPTEntreRios = stockPTER;
          yaUsado.stockPTCABA = stockPTCABA;
          yaUsado.cantidadFabricarCABA += cantidadFabricarCABA;
          yaUsado.cantidadFabricarER += cantidadFabricarER;
          yaUsado.transferirPT += transferirPT;
        } else {
          existente.productosUsados.push({
            codigoProducto: receta.codigoProducto,
            descripcion: descPTConcat,
            rotacion: rotacionTotal,
            stockPTEntreRios: stockPTER,
            stockPTCABA: stockPTCABA,
            cantidadFabricarCABA,
            cantidadFabricarER,
            transferirPT,
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
            rotacion: rotacionTotal,
            stockPTEntreRios: stockPTER,
            stockPTCABA: stockPTCABA,
            cantidadFabricarCABA,
            cantidadFabricarER,
            transferirPT,
          }],
        });
      }
    });
  });

  // Consolidar resultados para productos propios (Materias Primas requeridas)
  const resultadosPropios: ResultadoMRP[] = [];
  requerimientosMP.forEach((req, codigoMP) => {
    const stocksMP = stocks.filter((s) => s.codigoProducto === codigoMP);
    const stockCABA = stocksMP.find((s) => esDepositoCABA(s.deposito))?.stockFisico || 0;
    const stockER = stocksMP.find((s) => esDepositoEntreRios(s.deposito))?.stockFisico || 0;
    const movimiento = calcularMovimientoSugerido(req.cantidadTotal, stockCABA, stockER);

    // Evitar que saldos negativos de stock afecten la criticidad restando disponibilidad real
    const dispMPCABA = Math.max(0, stockCABA);
    const dispMPER = Math.max(0, stockER);

    resultadosPropios.push({
      codigoMP, descripcionMP: req.descripcion, unidadMedida: req.unidadMedida,
      stockMPEntreRios: stockER, stockMPCABA: stockCABA, cantidadSugerida: req.cantidadTotal,
      movimientoSugerido: movimiento, criticidad: calcularCriticidad(dispMPCABA + dispMPER, req.cantidadTotal),
      productosUsados: req.productosUsados,
    });
  });
  resultadosPropios.sort((a, b) => b.cantidadSugerida - a.cantidadSugerida);

  // Consolidar resultados para productos tercerizados (sin fórmula propia)
  const codigosPropios = new Set(recetasActivas.map((f) => f.codigoProducto));
  const listaTercerizados = stockPT.filter((pt) => !codigosPropios.has(pt.codigo));

  const resultadosTercerizados: ResultadoTercerizadosMRP[] = [];
  listaTercerizados.forEach((pt) => {
    const consumosPT = consumos.filter((c) => c.codigoProducto === pt.codigo);
    const rotacionMensual = consumosPT.length > 0 ? consumosPT.reduce((sum, c) => sum + c.cantidadConsumida, 0) / consumosPT.length : 0;
    const rotacion = rotacionMensual * mesesRotacion;

    const stocksPT = stocks.filter((s) => s.codigoProducto === pt.codigo);
    const stockCABA = stocksPT.find((s) => esDepositoCABA(s.deposito))?.stockFisico || 0;
    const stockER = stocksPT.find((s) => esDepositoEntreRios(s.deposito))?.stockFisico || 0;
    const movimiento = calcularMovimientoSugerido(rotacion, stockCABA, stockER);

    // Evitar que saldos negativos afecten la criticidad
    const dispPTCABA = Math.max(0, stockCABA);
    const dispPTER = Math.max(0, stockER);

    resultadosTercerizados.push({
      codigoPT: pt.codigo, descripcionPT: pt.descripcionAdicional ? `${pt.descripcion} (${pt.descripcionAdicional})` : pt.descripcion,
      stockPTEntreRios: stockER, stockPTCABA: stockCABA, rotacion,
      movimientoSugerido: movimiento, criticidad: calcularCriticidad(dispPTCABA + dispPTER, rotacion),
    });
  });
  resultadosTercerizados.sort((a, b) => b.rotacion - a.rotacion);

  return { propios: resultadosPropios, tercerizados: resultadosTercerizados };
}

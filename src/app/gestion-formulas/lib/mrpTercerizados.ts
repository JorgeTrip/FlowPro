// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import {
  ProductoTerminadoMaestro,
  StockPorDeposito,
  ConsumoMensual,
  ResultadoTercerizadosMRP,
  ReglaPrefijo
} from './types';
import {
  calcularMovimientoSugerido,
  calcularCriticidad,
  obtenerReglaParaProducto,
  esDepositoCABA,
  esDepositoEntreRios
} from './calculosAuxiliares';

/**
 * Calcula el MRP para productos tercerizados (sin receta de fabricación propia)
 * aplicando los criterios de compra/abastecimiento parametrizados.
 */
export function calcularMRPTercerizados(
  stockPT: ProductoTerminadoMaestro[],
  recetasActivasCodigos: Set<string>,
  stocks: StockPorDeposito[],
  consumos: ConsumoMensual[],
  mesesRotacion: number,
  reglasPrefijos: ReglaPrefijo[] = []
): ResultadoTercerizadosMRP[] {
  const listaTercerizados = stockPT.filter((pt) => !recetasActivasCodigos.has(pt.codigo));

  const resultadosTercerizados: ResultadoTercerizadosMRP[] = [];
  listaTercerizados.forEach((pt) => {
    const consumosPT = consumos.filter((c) => c.codigoProducto === pt.codigo);
    const rotacionMensual =
      consumosPT.length > 0
        ? consumosPT.reduce((sum, c) => sum + c.cantidadConsumida, 0) / consumosPT.length
        : 0;
    const rotacion = rotacionMensual * mesesRotacion;

    const stocksPT = stocks.filter((s) => s.codigoProducto === pt.codigo);
    const stockCABA = stocksPT.find((s) => esDepositoCABA(s.deposito))?.stockFisico || 0;
    const stockER = stocksPT.find((s) => esDepositoEntreRios(s.deposito))?.stockFisico || 0;

    const dispPTCABA = Math.max(0, stockCABA);
    const dispPTER = Math.max(0, stockER);

    // Obtener regla para el producto tercerizado
    const regla = obtenerReglaParaProducto(pt.codigo, reglasPrefijos);
    const sitio = regla ? regla.sitioFabricacion : 'CABA + ENTRE RIOS';

    let movimiento: ResultadoTercerizadosMRP['movimientoSugerido'];

    if (sitio === 'TERC. ENTRE RIOS') {
      // Abastecimiento con base en Entre Ríos: priorizar stock de ER, transferir de CABA, comprar en ER
      if (dispPTER >= rotacion) {
        movimiento = { tipo: 'sin_accion' };
      } else {
        const faltante = rotacion - dispPTER;
        const transf = Math.min(faltante, dispPTCABA);
        const compra = faltante - transf;

        if (transf > 0 && compra > 0) {
          movimiento = { tipo: 'combinado', transferencia: transf, compra };
        } else {
          movimiento =
            transf > 0
              ? { tipo: 'transferencia', transferencia: transf }
              : { tipo: 'compra', compra };
        }
      }
    } else {
      // Comportamiento por defecto (sitio === 'TERC. CABA' o cualquier otro sitio / sin regla)
      // Prioriza stock de CABA, transfiere de ER, compra en CABA
      movimiento = calcularMovimientoSugerido(rotacion, stockCABA, stockER);
    }

    resultadosTercerizados.push({
      codigoPT: pt.codigo,
      descripcionPT: pt.descripcionAdicional ? `${pt.descripcion} (${pt.descripcionAdicional})` : pt.descripcion,
      stockPTEntreRios: stockER,
      stockPTCABA: stockCABA,
      rotacion,
      movimientoSugerido: movimiento,
      criticidad: calcularCriticidad(dispPTCABA + dispPTER, rotacion)
    });
  });

  resultadosTercerizados.sort((a, b) => b.rotacion - a.rotacion);
  return resultadosTercerizados;
}

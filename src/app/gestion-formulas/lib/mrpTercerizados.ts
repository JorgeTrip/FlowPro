// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import {
  ProductoTerminadoMaestro,
  StockPorDeposito,
  ConsumoMensual,
  ResultadoTercerizadosMRP,
  ReglaPrefijo
} from './types';
import {
  calcularMovimientoSugeridoDoble,
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
  mesesTransferencia: number,
  mesesCompra: number,
  reglasPrefijos: ReglaPrefijo[] = [],
  modoMacro: boolean = false
): ResultadoTercerizadosMRP[] {
  let listaTercerizados = stockPT.filter((pt) => !recetasActivasCodigos.has(pt.codigo));
  if (modoMacro) {
    listaTercerizados = listaTercerizados.filter((pt) => pt.codigo.toLowerCase().endsWith('k'));
  }

  const resultadosTercerizados: ResultadoTercerizadosMRP[] = [];
  listaTercerizados.forEach((pt) => {
    const consumosPT = consumos.filter((c) => c.codigoProducto === pt.codigo);
    const rotacionMensual =
      consumosPT.length > 0
        ? consumosPT.reduce((sum, c) => sum + c.cantidadConsumida, 0) / consumosPT.length
        : 0;
    
    const rotacionTransferencia = rotacionMensual * mesesTransferencia;
    const rotacionCompra = rotacionMensual * mesesCompra;

    const stocksPT = stocks.filter((s) => s.codigoProducto === pt.codigo);
    const stockCABA = stocksPT.find((s) => esDepositoCABA(s.deposito))?.stockFisico || 0;
    const stockER = stocksPT.find((s) => esDepositoEntreRios(s.deposito))?.stockFisico || 0;

    const dispPTCABA = Math.max(0, stockCABA);
    const dispPTER = Math.max(0, stockER);

    const regla = obtenerReglaParaProducto(pt.codigo, reglasPrefijos);
    const sitio = regla ? regla.sitioFabricacion : 'CABA + ENTRE RIOS';

    let movimiento: ResultadoTercerizadosMRP['movimientoSugerido'];

    if (sitio === 'TERC. ENTRE RIOS') {
      const transf = Math.min(Math.max(0, rotacionTransferencia - dispPTER), dispPTCABA);
      const compra = Math.max(0, rotacionCompra - dispPTER - transf);

      let tipo: ResultadoTercerizadosMRP['movimientoSugerido']['tipo'] = 'sin_accion';
      if (transf > 0 && compra > 0) tipo = 'combinado';
      else if (transf > 0) tipo = 'transferencia';
      else if (compra > 0) tipo = 'compra';

      movimiento = {
        tipo,
        transferencia: transf > 0 ? transf : undefined,
        compra: compra > 0 ? compra : undefined,
      };
    } else {
      movimiento = calcularMovimientoSugeridoDoble(rotacionTransferencia, rotacionCompra, stockCABA, stockER);
    }

    resultadosTercerizados.push({
      codigoPT: pt.codigo,
      descripcionPT: pt.descripcionAdicional ? `${pt.descripcion} (${pt.descripcionAdicional})` : pt.descripcion,
      stockPTEntreRios: stockER,
      stockPTCABA: stockCABA,
      rotacion: rotacionCompra,
      rotacionMensual,
      movimientoSugerido: movimiento,
      criticidad: calcularCriticidad(dispPTCABA, rotacionCompra),
      linea: regla?.linea
    });
  });

  resultadosTercerizados.sort((a, b) => b.rotacion - a.rotacion);
  return resultadosTercerizados;
}

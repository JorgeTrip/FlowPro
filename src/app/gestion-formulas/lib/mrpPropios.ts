// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import {
  Producto,
  Formula,
  StockPorDeposito,
  ConsumoMensual,
  ProductoTerminadoMaestro,
  DesgloseProducto,
  ResultadoMRP,
  ReglaPrefijo
} from './types';
import {
  esDepositoCABA,
  esDepositoEntreRios,
  obtenerReglaParaProducto,
  calcularCriticidad,
  calcularDecisionStock
} from './calculosAuxiliares';

/**
 * Calcula el MRP para productos de fabricación propia e integra las reglas de prefijos de códigos PT.
 */
export function calcularMRPPropios(
  productos: Producto[],
  formulas: Formula[],
  stocks: StockPorDeposito[],
  consumos: ConsumoMensual[],
  stockPT: ProductoTerminadoMaestro[],
  mesesTransferencia: number,
  mesesCompra: number,
  reglasPrefijos: ReglaPrefijo[],
  modoMacro: boolean = false
): ResultadoMRP[] {
  let recetasActivas = formulas.filter((f) => f.estado === 'activa');
  if (modoMacro) {
    recetasActivas = recetasActivas.filter((f) => f.codigoProducto.toLowerCase().endsWith('k'));
  }
  const productosMap = new Map(productos.map((p) => [p.codigo, p]));
  const stockPTMap = new Map(stockPT.map((s) => [s.codigo, s]));
  const requerimientosMP = new Map<string, any>();

  recetasActivas.forEach((receta) => {
    const productoPT = productosMap.get(receta.codigoProducto);
    if (!productoPT) return;
    const consumosPT = consumos.filter((c) => c.codigoProducto === receta.codigoProducto);
    const rotacionMensual = consumosPT.length > 0 ? consumosPT.reduce((sum, c) => sum + c.cantidadConsumida, 0) / consumosPT.length : 0;
    if (rotacionMensual <= 0) return;

    const maestroPT = stockPTMap.get(receta.codigoProducto);
    const descPTConcat = maestroPT?.descripcionAdicional ? `${maestroPT.descripcion} (${maestroPT.descripcionAdicional})` : maestroPT?.descripcion || productoPT.descripcion || receta.descripcion;
    const stocksPT = stocks.filter((s) => s.codigoProducto === receta.codigoProducto);
    const dispPTCABA = Math.max(0, stocksPT.find((s) => esDepositoCABA(s.deposito))?.stockFisico || 0);
    const dispPTER = Math.max(0, stocksPT.find((s) => esDepositoEntreRios(s.deposito))?.stockFisico || 0);
    const regla = obtenerReglaParaProducto(receta.codigoProducto, reglasPrefijos);
    const sitio = regla ? regla.sitioFabricacion : 'CABA + ENTRE RIOS';

    receta.componentes.forEach((componente) => {
      const stocksMP = stocks.filter((s) => s.codigoProducto === componente.codigoComponente);
      const dispMPCABA = Math.max(0, stocksMP.find((s) => esDepositoCABA(s.deposito))?.stockFisico || 0);
      const dispMPER = Math.max(0, stocksMP.find((s) => esDepositoEntreRios(s.deposito))?.stockFisico || 0);
      
      const cantidadComponente = modoMacro ? 1 : componente.cantidad;
      const maxCABA = cantidadComponente > 0 ? dispMPCABA / cantidadComponente : 99999999;
      const maxER = cantidadComponente > 0 ? dispMPER / cantidadComponente : 99999999;

      const dTransf = calcularDecisionStock(sitio, rotacionMensual * mesesTransferencia, dispPTCABA, dispPTER, maxCABA, maxER, dispMPER, cantidadComponente, modoMacro);
      const dCompra = calcularDecisionStock(sitio, rotacionMensual * mesesCompra, dispPTCABA, dispPTER, maxCABA, maxER, dispMPER, cantidadComponente, modoMacro);

      const deduccion = cantidadComponente > 0 ? dCompra.compraMP / cantidadComponente : 0;
      const prodCABA = sitio === 'ENTRE RIOS' ? dCompra.cantidadFabricarCABA : Math.max(0, dCompra.cantidadFabricarCABA - deduccion);
      const prodER = sitio === 'ENTRE RIOS' ? Math.max(0, dCompra.cantidadFabricarER - deduccion) : dCompra.cantidadFabricarER;

      const nuevoDesglose: DesgloseProducto = {
        codigoProducto: receta.codigoProducto, descripcion: descPTConcat, rotacion: rotacionMensual * mesesCompra, rotacionMensual, stockPTEntreRios: dispPTER, stockPTCABA: dispPTCABA,
        cantidadFabricarCABA: dCompra.cantidadFabricarCABA, cantidadFabricarER: dCompra.cantidadFabricarER, produccionExistenteCABA: prodCABA, produccionExistenteER: prodER,
        transferirPT: dTransf.transferirPT, linea: regla?.linea, sitioFabricacion: regla?.sitioFabricacion
      };

      const req = requerimientosMP.get(componente.codigoComponente) || { cantidadTotal: 0, compraTotal: 0, transfTotal: 0, transfCabaErTotal: 0, productosUsados: [] };
      req.cantidadTotal += (dCompra.cantidadFabricarCABA + dCompra.cantidadFabricarER) * cantidadComponente;
      req.compraTotal += dCompra.compraMP; req.transfTotal += dTransf.transfMP; req.transfCabaErTotal += dTransf.transfMPCabaEr || 0;
      const yaUsado = req.productosUsados.find((p: DesgloseProducto) => p.codigoProducto === receta.codigoProducto);
      if (yaUsado) {
        yaUsado.rotacion += nuevoDesglose.rotacion; yaUsado.rotacionMensual += rotacionMensual;
        yaUsado.cantidadFabricarCABA += dCompra.cantidadFabricarCABA; yaUsado.cantidadFabricarER += dCompra.cantidadFabricarER;
        yaUsado.produccionExistenteCABA += prodCABA; yaUsado.produccionExistenteER += prodER; yaUsado.transferirPT += dTransf.transferirPT;
      } else { req.productosUsados.push(nuevoDesglose); }
      if (!requerimientosMP.has(componente.codigoComponente)) {
        const pMP = productosMap.get(componente.codigoComponente);
        req.descripcion = pMP?.descripcion || componente.descripcion; req.unidadMedida = pMP?.unidadMedida || componente.unidadMedida;
        requerimientosMP.set(componente.codigoComponente, req);
      }
    });
  });

  const res: ResultadoMRP[] = [];
  requerimientosMP.forEach((req, codigoMP) => {
    const sMP = stocks.filter((s) => s.codigoProducto === codigoMP);
    const sC = Math.max(0, sMP.find((s) => esDepositoCABA(s.deposito))?.stockFisico || 0);
    const sE = Math.max(0, sMP.find((s) => esDepositoEntreRios(s.deposito))?.stockFisico || 0);
     res.push({
      codigoMP, descripcionMP: req.descripcion, unidadMedida: req.unidadMedida, stockMPEntreRios: sE, stockMPCABA: sC,
      cantidadSugerida: req.compraTotal + req.transfTotal + req.transfCabaErTotal,
      movimientoSugerido: {
        tipo: req.compraTotal > 0 && (req.transfTotal > 0 || req.transfCabaErTotal > 0) ? 'combinado' : req.compraTotal > 0 ? 'compra' : (req.transfTotal > 0 || req.transfCabaErTotal > 0) ? 'transferencia' : 'sin_accion',
        compra: req.compraTotal || undefined,
        transferencia: req.transfTotal || undefined,
        transferenciaCabaEr: req.transfCabaErTotal || undefined
      },
      criticidad: calcularCriticidad(sC, req.cantidadTotal), productosUsados: req.productosUsados
    });
  });
  return res.sort((a, b) => b.cantidadSugerida - a.cantidadSugerida);
}

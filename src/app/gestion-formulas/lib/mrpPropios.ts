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
  mesesRotacion: number,
  reglasPrefijos: ReglaPrefijo[]
): ResultadoMRP[] {
  const recetasActivas = formulas.filter((f) => f.estado === 'activa');
  const productosMap = new Map<string, Producto>();
  productos.forEach((p) => productosMap.set(p.codigo, p));

  const stockPTMap = new Map<string, ProductoTerminadoMaestro>();
  stockPT.forEach((s) => stockPTMap.set(s.codigo, s));

  const requerimientosMP = new Map<
    string,
    {
      descripcion: string;
      unidadMedida: string;
      cantidadTotal: number;
      compraTotal: number;
      transfTotal: number;
      productosUsados: DesgloseProducto[];
    }
  >();

  recetasActivas.forEach((receta) => {
    const productoPT = productosMap.get(receta.codigoProducto);
    if (!productoPT) return;

    const consumosPT = consumos.filter((c) => c.codigoProducto === receta.codigoProducto);
    const rotacionMensual =
      consumosPT.length > 0
        ? consumosPT.reduce((sum, c) => sum + c.cantidadConsumida, 0) / consumosPT.length
        : 0;
    if (rotacionMensual <= 0) return;

    const rotacionTotal = rotacionMensual * mesesRotacion;

    const maestroPT = stockPTMap.get(receta.codigoProducto);
    const descPTConcat =
      maestroPT && maestroPT.descripcionAdicional
        ? `${maestroPT.descripcion} (${maestroPT.descripcionAdicional})`
        : maestroPT?.descripcion || productoPT.descripcion || receta.descripcion;

    const stocksPT = stocks.filter((s) => s.codigoProducto === receta.codigoProducto);
    const stockPTCABA = stocksPT.find((s) => esDepositoCABA(s.deposito))?.stockFisico || 0;
    const stockPTER = stocksPT.find((s) => esDepositoEntreRios(s.deposito))?.stockFisico || 0;

    const dispPTCABA = Math.max(0, stockPTCABA);
    const dispPTER = Math.max(0, stockPTER);

    // Obtener sitio de fabricación según el prefijo de código PT
    const regla = obtenerReglaParaProducto(receta.codigoProducto, reglasPrefijos);
    const sitio = regla ? regla.sitioFabricacion : 'CABA + ENTRE RIOS';

    receta.componentes.forEach((componente) => {
      const stocksMP = stocks.filter((s) => s.codigoProducto === componente.codigoComponente);
      const stockMPCABA = stocksMP.find((s) => esDepositoCABA(s.deposito))?.stockFisico || 0;
      const stockMPER = stocksMP.find((s) => esDepositoEntreRios(s.deposito))?.stockFisico || 0;
      const dispMPCABA = Math.max(0, stockMPCABA);
      const dispMPER = Math.max(0, stockMPER);

      const maxCABA =
        stocksMP.length > 0 && componente.cantidad > 0 ? dispMPCABA / componente.cantidad : 99999999;
      const maxER =
        stocksMP.length > 0 && componente.cantidad > 0 ? dispMPER / componente.cantidad : 99999999;

      // Calcular asignaciones matemáticas de recursos y cortocircuitos
      const {
        cantidadFabricarCABA,
        cantidadFabricarER,
        transferirPT,
        compraMP,
        transfMP
      } = calcularDecisionStock(
        sitio,
        rotacionTotal,
        dispPTCABA,
        dispPTER,
        maxCABA,
        maxER,
        dispMPER,
        componente.cantidad
      );

      const cantidadRequerida = (cantidadFabricarCABA + cantidadFabricarER) * componente.cantidad;

      const existente = requerimientosMP.get(componente.codigoComponente);
      if (existente) {
        existente.cantidadTotal += cantidadRequerida;
        existente.compraTotal += compraMP;
        existente.transfTotal += transfMP;
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
            linea: regla?.linea,
            sitioFabricacion: regla?.sitioFabricacion
          });
        }
      } else {
        const productoMP = productosMap.get(componente.codigoComponente);
        requerimientosMP.set(componente.codigoComponente, {
          descripcion: productoMP?.descripcion || componente.descripcion,
          unidadMedida: productoMP?.unidadMedida || componente.unidadMedida,
          cantidadTotal: cantidadRequerida,
          compraTotal: compraMP,
          transfTotal: transfMP,
          productosUsados: [
            {
              codigoProducto: receta.codigoProducto,
              descripcion: descPTConcat,
              rotacion: rotacionTotal,
              stockPTEntreRios: stockPTER,
              stockPTCABA: stockPTCABA,
              cantidadFabricarCABA,
              cantidadFabricarER,
              transferirPT,
              linea: regla?.linea,
              sitioFabricacion: regla?.sitioFabricacion
            }
          ]
        });
      }
    });
  });

  const resultadosPropios: ResultadoMRP[] = [];
  requerimientosMP.forEach((req, codigoMP) => {
    const stocksMP = stocks.filter((s) => s.codigoProducto === codigoMP);
    const stockCABA = stocksMP.find((s) => esDepositoCABA(s.deposito))?.stockFisico || 0;
    const stockER = stocksMP.find((s) => esDepositoEntreRios(s.deposito))?.stockFisico || 0;

    let tipo: 'sin_accion' | 'transferencia' | 'compra' | 'combinado' = 'sin_accion';
    if (req.compraTotal > 0 && req.transfTotal > 0) tipo = 'combinado';
    else if (req.compraTotal > 0) tipo = 'compra';
    else if (req.transfTotal > 0) tipo = 'transferencia';

    const movimientoSugerido = {
      tipo,
      compra: req.compraTotal > 0 ? req.compraTotal : undefined,
      transferencia: req.transfTotal > 0 ? req.transfTotal : undefined
    };

    resultadosPropios.push({
      codigoMP,
      descripcionMP: req.descripcion,
      unidadMedida: req.unidadMedida,
      stockMPEntreRios: stockER,
      stockMPCABA: stockCABA,
      cantidadSugerida: req.compraTotal + req.transfTotal,
      movimientoSugerido,
      criticidad: calcularCriticidad(Math.max(0, stockCABA) + Math.max(0, stockER), req.cantidadTotal),
      productosUsados: req.productosUsados
    });
  });

  resultadosPropios.sort((a, b) => b.cantidadSugerida - a.cantidadSugerida);
  return resultadosPropios;
}

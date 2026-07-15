// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import {
  Producto,
  Formula,
  StockPorDeposito,
  ConsumoMensual,
  ProductoTerminadoMaestro,
  ResultadosMRPFinal,
  ReglaPrefijo
} from './types';
import { calcularMRPPropios } from './mrpPropios';
import { calcularMRPTercerizados } from './mrpTercerizados';

/**
 * Calcula los requerimientos de Material Requirements Planning (MRP) para productos propios
 * y tercerizados, aplicando los algoritmos de abastecimiento parametrizados por los prefijos de PT.
 *
 * @param productos Catálogo completo de artículos
 * @param formulas Recetas de fabricación activas
 * @param stocks Existencias físicas por depósito
 * @param consumos Historial de consumos para cálculo de rotación
 * @param stockPT Maestro complementario de productos terminados
 * @param mesesRotacion Factor de proyección de demanda
 * @param reglasPrefijos Listado de prefijos con su sitio de fabricación y línea asociada
 */
export function calcularRequerimientosMRP(
  productos: Producto[],
  formulas: Formula[],
  stocks: StockPorDeposito[],
  consumos: ConsumoMensual[],
  stockPT: ProductoTerminadoMaestro[] = [],
  mesesRotacion: number = 1,
  reglasPrefijos: ReglaPrefijo[] = []
): ResultadosMRPFinal {
  const recetasActivas = formulas.filter((f) => f.estado === 'activa');
  const recetasActivasCodigos = new Set(recetasActivas.map((f) => f.codigoProducto));

  const propios = calcularMRPPropios(
    productos,
    formulas,
    stocks,
    consumos,
    stockPT,
    mesesRotacion,
    reglasPrefijos
  );

  const tercerizados = calcularMRPTercerizados(
    stockPT,
    recetasActivasCodigos,
    stocks,
    consumos,
    mesesRotacion,
    reglasPrefijos
  );

  return { propios, tercerizados };
}

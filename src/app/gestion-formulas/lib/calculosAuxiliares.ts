// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { ResultadoMRP } from './types';

/**
 * Calcula el movimiento sugerido (compra o transferencia) para cubrir una demanda
 * considerando el stock de CABA y el de Entre Ríos.
 * Se prioriza abastecer con stock físico disponible en CABA. Si no alcanza,
 * se transfiere desde Entre Ríos. Si aún así falta, se sugiere compra.
 * 
 * @param demanda Cantidad de recurso requerida
 * @param stockCABA Stock físico en CABA
 * @param stockER Stock físico en Entre Ríos
 */
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

/**
 * Determina el nivel de criticidad (alta, media, baja) según el stock total
 * disponible en comparación con el consumo o demanda calculada.
 * 
 * @param stockTotal Sumatoria de stock de ambos depósitos
 * @param consumo Demanda o rotación a cubrir
 */
export function calcularCriticidad(stockTotal: number, consumo: number): 'alta' | 'media' | 'baja' {
  if (consumo <= 0) return 'baja';
  const meses = stockTotal / consumo;
  return meses <= 1 ? 'alta' : meses < 3 ? 'media' : 'baja';
}

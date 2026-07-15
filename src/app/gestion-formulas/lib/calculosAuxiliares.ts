import { ResultadoMRP, ReglaPrefijo } from './types';

/**
 * Determina si un depósito corresponde a CABA.
 */
export function esDepositoCABA(deposito: string): boolean {
  const dep = deposito.toLowerCase();
  return (
    dep.includes('caba') ||
    dep.includes('capital') ||
    dep.includes('buenos aires') ||
    dep.includes('bue') ||
    dep.includes('central')
  );
}

/**
 * Determina si un depósito corresponde a Entre Ríos.
 */
export function esDepositoEntreRios(deposito: string): boolean {
  const dep = deposito.toLowerCase();
  return (
    dep.includes('entre') ||
    dep.includes('rios') ||
    dep.includes('ríos') ||
    dep.includes('er') ||
    dep.includes('e.r')
  );
}

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
 * Calcula sugerencias con doble horizonte de demanda.
 */
export function calcularMovimientoSugeridoDoble(
  demandaTransferencia: number, demandaCompra: number, stockCABA: number, stockER: number
): ResultadoMRP['movimientoSugerido'] {
  const dispCABA = Math.max(0, stockCABA);
  const dispER = Math.max(0, stockER);
  const transf = Math.min(Math.max(0, demandaTransferencia - dispCABA), dispER);
  const compra = Math.max(0, demandaCompra - dispCABA - transf);

  let tipo: ResultadoMRP['movimientoSugerido']['tipo'] = 'sin_accion';
  if (transf > 0 && compra > 0) tipo = 'combinado';
  else if (transf > 0) tipo = 'transferencia';
  else if (compra > 0) tipo = 'compra';

  return {
    tipo,
    transferencia: transf > 0 ? transf : undefined,
    compra: compra > 0 ? compra : undefined,
  };
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

/**
 * Busca y retorna la regla de prefijo de código más larga y específica que coincida con el código de producto.
 */
export function obtenerReglaParaProducto(codigo: string, reglas: ReglaPrefijo[]): ReglaPrefijo | undefined {
  const reglasOrdenadas = [...reglas].sort((a, b) => b.prefijo.length - a.prefijo.length);
  return reglasOrdenadas.find((r) => codigo.startsWith(r.prefijo));
}

export interface ResultadoDecisionStock {
  cantidadFabricarCABA: number;
  cantidadFabricarER: number;
  transferirPT: number;
  compraMP: number;
  transfMP: number;
}

/**
 * Aplica los pasos de cortocircuito (short-circuits) lógicos y las prioridades de planta
 * para determinar las transferencias, fabricaciones y compras de MP o PT requeridas.
 */
export function calcularDecisionStock(
  sitio: string,
  rotacionTotal: number,
  dispPTCABA: number,
  dispPTER: number,
  maxCABA: number,
  maxER: number,
  dispMPER: number,
  cantidadComponente: number
): ResultadoDecisionStock {
  let cantidadFabricarCABA = 0;
  let cantidadFabricarER = 0;
  let transferirPT = 0;
  let compraMP = 0;
  let transfMP = 0;

  const R = Math.max(0, rotacionTotal - dispPTCABA);

  if (R > 0) {
    if (sitio === 'ENTRE RIOS') {
      if (dispPTER >= R) {
        transferirPT = R;
      } else {
        const PT_pot = maxER;
        if (dispPTER + PT_pot >= R) {
          cantidadFabricarER = R - dispPTER;
          transferirPT = R;
        } else {
          cantidadFabricarER = PT_pot;
          transferirPT = dispPTER + PT_pot;
          const R_falta = R - (dispPTER + PT_pot);
          cantidadFabricarER += R_falta;
          transferirPT += R_falta;
          compraMP = R_falta * cantidadComponente;
        }
      }
    } else if (sitio === 'CABA') {
      if (maxCABA >= R) {
        cantidadFabricarCABA = R;
      } else {
        const PT_ER = maxER;
        if (maxCABA + PT_ER >= R) {
          cantidadFabricarCABA = R;
          transfMP = (R - maxCABA) * cantidadComponente;
        } else {
          transfMP = dispMPER;
          cantidadFabricarCABA = maxCABA + PT_ER;
          const R_falta = R - (maxCABA + PT_ER);
          cantidadFabricarCABA += R_falta;
          compraMP = R_falta * cantidadComponente;
        }
      }
    } else if (sitio === 'TERC. CON PROV. MP') {
      // Caso Maquila: Fabricación externa proveyendo materias primas desde depósitos propios
      cantidadFabricarCABA = R; // Representa el PT que requerirá elaboración externa con nuestra MP
      const dispMPCABA_real = maxCABA === 99999999 ? 0 : maxCABA * cantidadComponente;
      const MP_Req = R * cantidadComponente;

      if (dispMPCABA_real >= MP_Req) {
        transfMP = 0;
        compraMP = 0;
      } else {
        transfMP = 0; // No se consulta ni se transfiere desde Entre Ríos
        compraMP = MP_Req - dispMPCABA_real; // Se compra la materia prima faltante directamente en CABA
      }
    } else {
      // CABA + ENTRE RIOS (Ambas plantas)
      if (maxCABA >= R) {
        cantidadFabricarCABA = R;
      } else {
        const R_restante = R - maxCABA;
        cantidadFabricarCABA = maxCABA;
        if (dispPTER >= R_restante) {
          transferirPT = R_restante;
        } else {
          transferirPT = dispPTER;
          const PT_ER = maxER;
          const falta_PT = R_restante - dispPTER;
          if (PT_ER >= falta_PT) {
            cantidadFabricarER = falta_PT;
            transferirPT += falta_PT;
          } else {
            cantidadFabricarER = PT_ER;
            transferirPT += PT_ER;
            const R_final = falta_PT - PT_ER;
            cantidadFabricarCABA += R_final;
            compraMP = R_final * cantidadComponente;
          }
        }
      }
    }
  }

  return { cantidadFabricarCABA, cantidadFabricarER, transferirPT, compraMP, transfMP };
}

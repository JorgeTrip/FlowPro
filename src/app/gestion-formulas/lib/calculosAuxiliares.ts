import { ResultadoMRP, ReglaPrefijo } from './types';

/**
 * Determina si un depósito corresponde a CABA.
 */
export function esDepositoCABA(deposito: string): boolean {
  const d = deposito.toLowerCase();
  return d.includes('caba') || d.includes('capital') || d.includes('buenos aires') || d.includes('bue') || d.includes('central');
}

/**
 * Determina si un depósito corresponde a Entre Ríos.
 */
export function esDepositoEntreRios(deposito: string): boolean {
  const d = deposito.toLowerCase();
  return d.includes('entre') || d.includes('rios') || d.includes('ríos') || d.includes('er') || d.includes('e.r');
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
  const codNormalizado = (codigo || '').trim().toUpperCase();
  const reglasOrdenadas = [...reglas].sort((a, b) => b.prefijo.length - a.prefijo.length);
  return reglasOrdenadas.find((r) => {
    const prefNormalizado = (r.prefijo || '').trim().toUpperCase();
    return codNormalizado.startsWith(prefNormalizado);
  });
}

export interface ResultadoDecisionStock {
  cantidadFabricarCABA: number;
  cantidadFabricarER: number;
  transferirPT: number;
  compraMP: number;
  transfMP: number; // representa ER -> CABA
  transfMPCabaEr?: number; // representa CABA -> ER
}

/**
 * Aplica los pasos de cortocorticuitos lógicos y las prioridades de planta
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
  let transfMPCabaEr = 0;

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
          // No alcanza con la MP local de ER. Se intenta transferir MP de CABA.
          const dispMPCABA = maxCABA === 99999999 ? 0 : maxCABA * cantidadComponente;
          const R_restante = R - (dispPTER + PT_pot);
          
          if (maxCABA >= R_restante) {
            transfMPCabaEr = R_restante * cantidadComponente;
            cantidadFabricarER = R - dispPTER;
            transferirPT = R;
          } else {
            transfMPCabaEr = dispMPCABA;
            cantidadFabricarER = PT_pot + maxCABA;
            transferirPT = dispPTER + PT_pot + maxCABA;
            const R_falta = R_restante - maxCABA;
            cantidadFabricarER += R_falta;
            transferirPT += R_falta;
            compraMP = R_falta * cantidadComponente;
          }
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
      cantidadFabricarCABA = R;
      const dispMPCABA_real = maxCABA === 99999999 ? 0 : maxCABA * cantidadComponente;
      const MP_Req = R * cantidadComponente;

      if (dispMPCABA_real >= MP_Req) {
        transfMP = 0;
        compraMP = 0;
      } else {
        transfMP = 0;
        compraMP = MP_Req - dispMPCABA_real;
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

  return { cantidadFabricarCABA, cantidadFabricarER, transferirPT, compraMP, transfMP, transfMPCabaEr };
}

// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import type { Criticidad } from './demandEstimator';

export interface EvaluacionCriticidadDemanda {
  criticidad: Criticidad;
  pedirAEntreRios: string;
  sugerencia: string;
}

export function evaluarCriticidadDemanda(
  ventaMensual: number,
  stockNetoCABA: number,
  stockCABA: number,
  stockEntreRios: number,
  mesesCoberturaCABA: number
): EvaluacionCriticidadDemanda {
  if (mesesCoberturaCABA >= 4) {
    return {
      criticidad: 'baja',
      pedirAEntreRios: 'No necesario',
      sugerencia: 'Stock CABA adecuado.',
    };
  }

  const demandaInsatisfecha = Math.max(0, ventaMensual * 4 - stockNetoCABA);
  const stockEntreRiosParaTresMeses = ventaMensual * 3;

  if (stockEntreRios >= stockEntreRiosParaTresMeses) {
    const cantidadAPedir = Math.min(demandaInsatisfecha, stockEntreRios);
    return {
      criticidad: 'media',
      pedirAEntreRios: `${Math.ceil(cantidadAPedir)}`,
      sugerencia: `Pedir ${Math.ceil(cantidadAPedir)} unidades de Entre Ríos para completar 4 meses de cobertura.`,
    };
  }

  if (stockEntreRios > 0) {
    const faltante = demandaInsatisfecha - stockEntreRios;
    if (stockNetoCABA > 0) {
      return {
        criticidad: 'alta',
        pedirAEntreRios: 'Stock insuficiente en CABA y Entre Ríos',
        sugerencia: `Pedir ${stockEntreRios} unidades de Entre Ríos y comprar ${Math.ceil(faltante)} unidades adicionales.`,
      };
    }
    return {
      criticidad: 'alta',
      pedirAEntreRios: 'Stock insuficiente en Entre Ríos',
      sugerencia: `Pedir ${stockEntreRios} unidades de Entre Ríos y comprar ${Math.ceil(faltante)} unidades adicionales.`,
    };
  }

  // No hay stock en Entre Ríos
  if (stockNetoCABA > 0) {
    return {
      criticidad: 'alta',
      pedirAEntreRios: 'Stock CABA insuficiente, Entre Ríos sin stock',
      sugerencia: `Stock CABA insuficiente (${mesesCoberturaCABA.toFixed(1)} meses). Comprar ${Math.ceil(demandaInsatisfecha)} unidades para 4 meses de cobertura.`,
    };
  }

  let pedirAEntreRios = 'Stock CABA insuficiente, Entre Ríos sin stock';
  if (stockCABA === 0 && stockEntreRios === 0) {
    pedirAEntreRios = 'Sin stock disponible en ambos';
  }

  return {
    criticidad: 'alta',
    pedirAEntreRios,
    sugerencia: `Comprar ${Math.ceil(demandaInsatisfecha)} unidades para 4 meses de cobertura.`,
  };
}

// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

export interface VariacionPorcentualFormateada {
  porcentaje: number | null;
  texto: string;
  esPositivo: boolean;
  esNegativo: boolean;
}

/**
 * Calcula la variación porcentual entre el valor del mes actual y el mes anterior.
 * Devuelve un número entero redondeado (ej. 25 para +25%, -10 para -10%) o null si no aplica.
 */
export function calcularVariacionPorcentual(
  actual: number,
  anterior: number
): number | null {
  if (anterior === 0 && actual === 0) return null;
  if (anterior === 0 && actual > 0) return 100;
  if (anterior === 0 && actual < 0) return -100;

  const variacion = ((actual - anterior) / Math.abs(anterior)) * 100;
  return Math.round(variacion);
}

/**
 * Formatea la variación porcentual con prefijos (+/-), texto legible y flags semánticos.
 */
export function formatearVariacionPorcentual(
  actual: number,
  anterior: number
): VariacionPorcentualFormateada {
  const p = calcularVariacionPorcentual(actual, anterior);

  if (p === null) {
    return {
      porcentaje: null,
      texto: '-',
      esPositivo: false,
      esNegativo: false,
    };
  }

  if (p > 0) {
    return {
      porcentaje: p,
      texto: `+${p}%`,
      esPositivo: true,
      esNegativo: false,
    };
  }

  if (p < 0) {
    return {
      porcentaje: p,
      texto: `${p}%`,
      esPositivo: false,
      esNegativo: true,
    };
  }

  return {
    porcentaje: 0,
    texto: '0%',
    esPositivo: false,
    esNegativo: false,
  };
}

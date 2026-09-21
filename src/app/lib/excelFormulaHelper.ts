// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import type { ExcelCellValue } from '@/app/stores/estimarDemandaStore';

export interface RichTextElement {
  text: string;
}

export interface FormulaResult {
  richText?: RichTextElement[];
  text?: string;
  error?: unknown;
  formula?: string;
  sharedFormula?: string;
  result?: unknown;
}

/**
 * Procesa el valor de celda devuelto por ExcelJS resolviendo fórmulas, textos enriquecidos o fechas
 * para devolver un valor plano estándar interpretable por el estimador de demanda.
 */
export function processFormulaResult(result: unknown): ExcelCellValue {
  if (result instanceof Date) {
    return result.toISOString();
  }
  if (typeof result === 'object' && result !== null) {
    const formulaResult = result as FormulaResult;
    if ('richText' in formulaResult && formulaResult.richText) {
      return formulaResult.richText.map((rt: RichTextElement) => rt.text).join('');
    }
    if ('hyperlink' in formulaResult && formulaResult.text) {
      return formulaResult.text;
    }
    if ('error' in formulaResult) {
      return '';
    }
    if ('formula' in formulaResult || 'sharedFormula' in formulaResult) {
      return processFormulaResult(formulaResult.result);
    }
    return '';
  }
  return result === null || result === undefined ? '' : (result as ExcelCellValue);
}

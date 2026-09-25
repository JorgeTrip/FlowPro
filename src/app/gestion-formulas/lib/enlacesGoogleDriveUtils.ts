// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

export interface EnlacesGoogleDriveUsuario {
  formulas: string | null;
  stock: string | null;
  pedidosCompra: string | null;
  actualizadoEn?: string;
}

/**
 * Normaliza y limpia una URL de planilla Google Sheets.
 */
export function normalizarUrlPlanilla(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Prepara el objeto de enlaces listo para persistir en Firestore o sincronizar en el store.
 */
export function prepararPayloadEnlaces(
  enlaces: Partial<EnlacesGoogleDriveUsuario>
): EnlacesGoogleDriveUsuario {
  return {
    formulas: normalizarUrlPlanilla(enlaces.formulas),
    stock: normalizarUrlPlanilla(enlaces.stock),
    pedidosCompra: normalizarUrlPlanilla(enlaces.pedidosCompra),
    actualizadoEn: new Date().toISOString(),
  };
}

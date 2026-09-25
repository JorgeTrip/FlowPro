// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import type { ReglaPrefijo, ReglaPrefijoDocumento, SitioFabricacion } from '../types/prefijos.ts';

const SITIOS_VALIDOS: SitioFabricacion[] = [
  'CABA',
  'ENTRE RIOS',
  'CABA + ENTRE RIOS',
  'TERC. CABA',
  'TERC. ENTRE RIOS',
  'TERC. CON PROV. MP',
];

/**
 * Normaliza variantes escritas del sitio de fabricación a la nomenclatura canónica.
 */
export function normalizarSitioFabricacion(sitioStr: string): SitioFabricacion | null {
  if (!sitioStr) return null;
  const limpio = String(sitioStr)
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (limpio === 'E.R.' || limpio === 'ER' || limpio === 'ENTRE RIOS' || limpio === 'ENTRE RÍOS') {
    return 'ENTRE RIOS';
  }
  if (
    limpio === 'CABA + E.R.' ||
    limpio === 'CABA + ER' ||
    limpio === 'CABA + ENTRE RIOS' ||
    limpio === 'CABA+ENTRE RIOS'
  ) {
    return 'CABA + ENTRE RIOS';
  }
  if (
    limpio === 'TERC. E.R.' ||
    limpio === 'TERC. ER' ||
    limpio === 'TERC. ENTRE RIOS' ||
    limpio === 'TERCERIZADOS ENTRE RIOS'
  ) {
    return 'TERC. ENTRE RIOS';
  }
  if (limpio === 'TERC. CABA' || limpio === 'TERCERIZADOS CABA') {
    return 'TERC. CABA';
  }
  if (limpio === 'TERC. CON PROV. MP' || limpio === 'TERCERIZADO CON PROV MP') {
    return 'TERC. CON PROV. MP';
  }
  if (limpio === 'CABA') {
    return 'CABA';
  }

  return (SITIOS_VALIDOS.find((s) => s === limpio) as SitioFabricacion) || null;
}

/**
 * Valida que una regla contenga los campos requeridos y coherencia de datos.
 */
export function validarReglaPrefijo(regla: Partial<ReglaPrefijo>): { valida: boolean; error?: string } {
  if (!regla) {
    return { valida: false, error: 'La regla no puede ser nula.' };
  }
  const prefijo = String(regla.prefijo || '').trim();
  if (!prefijo) {
    return { valida: false, error: 'El prefijo es obligatorio.' };
  }
  const linea = String(regla.linea || '').trim();
  if (!linea) {
    return { valida: false, error: 'La línea de producto es obligatoria.' };
  }
  const sitioNormalizado = normalizarSitioFabricacion(regla.sitioFabricacion || '');
  if (!sitioNormalizado) {
    return {
      valida: false,
      error: `Sitio inválido: "${regla.sitioFabricacion}". Válidos: ${SITIOS_VALIDOS.join(', ')}`,
    };
  }

  return { valida: true };
}

/**
 * Transforma una regla de negocio a su formato de documento persistente en Firestore.
 */
export function normalizarReglaParaFirestore(
  regla: ReglaPrefijo,
  emailUsuario?: string
): ReglaPrefijoDocumento {
  const prefijoLimpio = String(regla.prefijo || '').trim().toUpperCase();
  const lineaLimpia = String(regla.linea || '').trim();
  const sitioNormalizado = normalizarSitioFabricacion(regla.sitioFabricacion) || 'CABA';

  return {
    id: regla.id,
    prefijo: prefijoLimpio,
    linea: lineaLimpia,
    sitioFabricacion: sitioNormalizado,
    descripcion: regla.descripcion ? String(regla.descripcion).trim() : undefined,
    actualizadoEn: new Date().toISOString(),
    actualizadoPor: emailUsuario || undefined,
  };
}

/**
 * Mapea los datos leídos de un documento de Firestore a la interfaz de dominio ReglaPrefijo.
 */
export function mapearDocumentoAFirestore(docData: any, docId: string): ReglaPrefijo | null {
  if (!docData || typeof docData !== 'object') return null;
  const prefijo = String(docData.prefijo || '').trim();
  const linea = String(docData.linea || '').trim();
  const sitio = normalizarSitioFabricacion(docData.sitioFabricacion);

  if (!prefijo || !linea || !sitio) {
    return null;
  }

  return {
    id: docId || docData.id || `pref-${prefijo}`,
    prefijo,
    linea,
    sitioFabricacion: sitio,
    descripcion: docData.descripcion ? String(docData.descripcion).trim() : undefined,
  };
}

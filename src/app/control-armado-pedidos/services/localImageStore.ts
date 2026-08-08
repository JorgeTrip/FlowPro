// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { indexedDBStorage } from '@/app/lib/indexedDBStorage';

/**
 * Guarda la imagen Base64 de una planilla verificada en IndexedDB local asociándola al ID del documento.
 */
export async function guardarImagenLocal(docId: string, base64: string): Promise<void> {
  if (!docId || !base64) return;
  try {
    await indexedDBStorage.setItem(`img_planilla_${docId}`, base64);
  } catch (err) {
    console.warn(`Error al guardar imagen en IndexedDB para ${docId}:`, err);
  }
}

/**
 * Recupera la imagen Base64 almacenada localmente en IndexedDB para un documento dado.
 */
export async function obtenerImagenLocal(docId: string): Promise<string | null> {
  if (!docId) return null;
  try {
    return await indexedDBStorage.getItem(`img_planilla_${docId}`);
  } catch (err) {
    console.warn(`Error al obtener imagen desde IndexedDB para ${docId}:`, err);
    return null;
  }
}

/**
 * Elimina la imagen asociativa de IndexedDB cuando se borra una planilla.
 */
export async function eliminarImagenLocal(docId: string): Promise<void> {
  if (!docId) return;
  try {
    await indexedDBStorage.removeItem(`img_planilla_${docId}`);
  } catch (err) {
    console.warn(`Error al eliminar imagen de IndexedDB para ${docId}:`, err);
  }
}

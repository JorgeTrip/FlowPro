// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { indexedDBStorage } from '@/app/lib/indexedDBStorage';

/**
 * Recupera y limpia gradualmente la imagen Base64 almacenada localmente en IndexedDB para migrarla a Firestore.
 */
export async function obtenerImagenLocal(docId: string): Promise<string | null> {
  if (!docId) return null;
  try {
    const img = await indexedDBStorage.getItem(`img_planilla_${docId}`);
    if (img) {
      // Limpiar de IndexedDB una vez recuperada para liberar espacio local
      await indexedDBStorage.removeItem(`img_planilla_${docId}`);
    }
    return img;
  } catch {
    return null;
  }
}

export async function guardarImagenLocal(_docId: string, _base64: string): Promise<void> {
  // Obsoleto: Las imágenes ahora se guardan directamente en el documento de Firestore como WebP.
}

export async function eliminarImagenLocal(docId: string): Promise<void> {
  if (!docId) return;
  try {
    await indexedDBStorage.removeItem(`img_planilla_${docId}`);
  } catch {}
}

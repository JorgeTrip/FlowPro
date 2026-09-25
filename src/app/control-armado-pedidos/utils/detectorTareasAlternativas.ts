// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import type { TipoTareaFila } from '../types/armado.ts';

function normalizar(texto?: string | null): string {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Inspecciona una nota manuscrita para sugerir automáticamente si corresponde
 * a Atención al Cliente o a Producción.
 */
export function detectarSugerenciaTarea(nota?: string | null): TipoTareaFila | null {
  const norm = normalizar(nota);
  if (!norm) return null;

  const palabrasCliente = ['cliente', 'atencion', 'mostrador', 'atender'];
  const palabrasProduccion = ['produccion', 'planta', 'fabricacion', 'fabricar'];

  if (palabrasCliente.some((p) => norm.includes(p))) {
    return 'atencion_cliente';
  }

  if (palabrasProduccion.some((p) => norm.includes(p))) {
    return 'produccion';
  }

  return null;
}

/**
 * Devuelve un texto presentacional limpio para el tipo de tarea y su detalle opcional.
 */
export function formatearEtiquetaTarea(tipo?: TipoTareaFila, detalle?: string): string {
  if (!tipo || tipo === 'armado') return 'Armado';
  if (tipo === 'atencion_cliente') return 'Atención al Cliente';
  if (tipo === 'produccion') return 'Producción';
  if (tipo === 'otros') {
    return detalle && detalle.trim() ? `Otros: ${detalle.trim()}` : 'Otros';
  }
  return 'Armado';
}

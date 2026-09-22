// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

export interface PlanillaReferenciable {
  nombreArchivo?: string;
  nombreArchivoOriginal?: string;
  archivo?: string;
  [key: string]: any;
}

export type PlanillaParaEmparejar = PlanillaReferenciable;

export interface ResultadoEmparejamiento<T extends PlanillaReferenciable> {
  asignadas: { planilla: T; archivo: File }[];
  sobrantes: File[];
  planillasSinFoto: T[];
}

/**
 * Normaliza un nombre de archivo para comparaciones flexibles (sin extensión, minúsculas, sin espacios).
 */
export function limpiarNombreArchivo(nombre?: string): string {
  if (!nombre) return '';
  return nombre
    .trim()
    .toLowerCase()
    .replace(/^.*[\\/]/, '')
    .replace(/\.[^/.]+$/, '');
}

/**
 * Empareja prioritariamente las imágenes con las planillas basándose en el nombre de archivo coincidente.
 * Si las planillas no especifican nombre de archivo, aplica fallback secuencial.
 * Si sobran fotos o no coinciden, las clasifica como sobrantes.
 */
export function emparejarImagenesConPlanillas<T extends PlanillaReferenciable>(
  planillas: T[],
  archivos: File[]
): ResultadoEmparejamiento<T> {
  const asignadas: { planilla: T; archivo: File }[] = [];
  const archivosUsados = new Set<number>();
  const planillasAsignadas = new Set<number>();

  // Paso 1: Emparejamiento estricto y prioritario por nombre de archivo
  planillas.forEach((p, idxP) => {
    const nombreRef = p.nombreArchivo || p.nombreArchivoOriginal || p.archivo;
    if (!nombreRef) return;

    const nombreLimpio = limpiarNombreArchivo(nombreRef);
    const nombreOriginalLimpio = nombreRef.trim().toLowerCase();

    // Buscar en los archivos no utilizados
    for (let i = 0; i < archivos.length; i++) {
      if (archivosUsados.has(i)) continue;
      const archivoName = archivos[i].name.trim().toLowerCase();
      const archivoLimpio = limpiarNombreArchivo(archivos[i].name);

      if (archivoName === nombreOriginalLimpio || archivoLimpio === nombreLimpio) {
        asignadas.push({ planilla: p, archivo: archivos[i] });
        archivosUsados.add(i);
        planillasAsignadas.add(idxP);
        break;
      }
    }
  });

  // Paso 2: Fallback secuencial ÚNICAMENTE para planillas que no tenían nombre de archivo especificado
  planillas.forEach((p, idxP) => {
    if (planillasAsignadas.has(idxP)) return;
    const nombreRef = p.nombreArchivo || p.nombreArchivoOriginal || p.archivo;
    // Si la planilla tenía un nombre explícito que no coincidió, no la asignamos arbitrariamente
    if (nombreRef) return;

    // Buscar el siguiente archivo no utilizado
    for (let i = 0; i < archivos.length; i++) {
      if (!archivosUsados.has(i)) {
        asignadas.push({ planilla: p, archivo: archivos[i] });
        archivosUsados.add(i);
        planillasAsignadas.add(idxP);
        break;
      }
    }
  });

  // Paso 3: Identificar archivos sobrantes (no emparejados)
  const sobrantes = archivos.filter((_, idx) => !archivosUsados.has(idx));

  // Paso 4: Identificar planillas que quedaron sin foto
  const planillasSinFoto = planillas.filter((_, idx) => !planillasAsignadas.has(idx));

  return {
    asignadas,
    sobrantes,
    planillasSinFoto,
  };
}

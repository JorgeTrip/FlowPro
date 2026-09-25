// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

export interface MetricasAlmacenamiento {
  usadoMB: number;
  cuotaMB: number;
  porcentaje: number;
  cantidadClavesLocalStorage: number;
}

/**
 * Estima el espacio utilizado y la cuota disponible en el navegador.
 */
export async function estimarEspacioAlmacenamiento(): Promise<MetricasAlmacenamiento> {
  let usadoMB = 0;
  let cuotaMB = 0;
  let porcentaje = 0;
  let cantidadClaves = 0;

  if (typeof window !== 'undefined') {
    cantidadClaves = localStorage.length;
    // Calcular tamaño aproximado de LocalStorage en bytes
    let bytesLocalStorage = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const clave = localStorage.key(i);
      if (clave) {
        bytesLocalStorage += (clave.length + (localStorage.getItem(clave)?.length || 0)) * 2;
      }
    }

    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const usoTotalBytes = (estimate.usage || 0) + bytesLocalStorage;
        const cuotaTotalBytes = estimate.quota || 1024 * 1024 * 1024; // 1 GB fallback
        usadoMB = Math.round((usoTotalBytes / (1024 * 1024)) * 10) / 10;
        cuotaMB = Math.round((cuotaTotalBytes / (1024 * 1024)) * 10) / 10;
        porcentaje = cuotaMB > 0 ? Math.min(100, Math.round((usadoMB / cuotaMB) * 100)) : 0;
      } catch {
        usadoMB = Math.round((bytesLocalStorage / (1024 * 1024)) * 100) / 100;
        cuotaMB = 500;
        porcentaje = 1;
      }
    } else {
      usadoMB = Math.round((bytesLocalStorage / (1024 * 1024)) * 100) / 100;
      cuotaMB = 500;
      porcentaje = 1;
    }
  }

  return { usadoMB, cuotaMB, porcentaje, cantidadClavesLocalStorage: cantidadClaves };
}

/**
 * Limpia claves de caché no críticas del LocalStorage (conservando sesión y preferencias).
 */
export function limpiarCacheNoCritica(): number {
  if (typeof window === 'undefined') return 0;
  let eliminadas = 0;
  const clavesAEliminar: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const clave = localStorage.key(i);
    if (clave && (clave.includes('cache') || clave.includes('temp') || clave.includes('draft'))) {
      clavesAEliminar.push(clave);
    }
  }

  for (const k of clavesAEliminar) {
    localStorage.removeItem(k);
    eliminadas++;
  }
  return eliminadas;
}

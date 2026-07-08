// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { StateStorage } from 'zustand/middleware';

/**
 * ==========================================
 * SECCIÓN 1: CONFIGURACIÓN GENERAL DE LA BD
 * ==========================================
 */

/** Nombre de la base de datos de IndexedDB dedicada a la aplicación */
const NOMBRE_BD = 'FlowProFormulasDB';
/** Nombre del almacén de objetos (Object Store) para el estado del store */
const NOMBRE_ALMACEN = 'estado-formulas';
/** Versión actual de la base de datos local */
const VERSION_BD = 1;

/** Caché de la conexión para evitar múltiples aperturas simultáneas */
let dbInstancia: IDBDatabase | null = null;
/** Promesa de inicialización para encolar lecturas/escrituras durante la carga */
let promesaConexion: Promise<IDBDatabase> | null = null;

/**
 * Comprobación de seguridad para evitar fallos de ejecución durante
 * la fase de Server-Side Rendering (SSR) típica de Next.js.
 */
const esCliente = typeof window !== 'undefined';

/**
 * Abre la conexión a la base de datos IndexedDB de manera asíncrona.
 * Implementa un patrón singleton para reusar la misma conexión abierta.
 */
function obtenerBaseDatos(): Promise<IDBDatabase> {
  if (!esCliente) {
    return Promise.reject(new Error('IndexedDB no está disponible en Server-Side Rendering (SSR).'));
  }

  if (dbInstancia) {
    return Promise.resolve(dbInstancia);
  }

  if (promesaConexion) {
    return promesaConexion;
  }

  promesaConexion = new Promise((resolve, reject) => {
    const solicitud = indexedDB.open(NOMBRE_BD, VERSION_BD);

    // Se ejecuta si es la primera vez que se crea la BD o si se incrementa la versión
    solicitud.onupgradeneeded = () => {
      const db = solicitud.result;
      if (!db.objectStoreNames.contains(NOMBRE_ALMACEN)) {
        db.createObjectStore(NOMBRE_ALMACEN);
      }
    };

    solicitud.onsuccess = () => {
      dbInstancia = solicitud.result;
      resolve(solicitud.result);
    };

    solicitud.onerror = () => {
      promesaConexion = null; // Reiniciar en caso de error
      reject(solicitud.error);
    };
  });

  return promesaConexion;
}

/**
 * ==========================================
 * SECCIÓN 2: IMPLEMENTACIÓN DE STATESTORAGE
 * ==========================================
 */

/**
 * Implementación adaptada de StateStorage para Zustand que interactúa con IndexedDB.
 * Permite almacenar estructuras de datos mayores a 5MB sin bloquear el hilo principal.
 */
export const indexedDBStorage: StateStorage = {
  /**
   * Obtiene un valor asociado a una clave.
   * Si estamos en el servidor, retorna inmediatamente null.
   */
  getItem: async (nombre: string): Promise<string | null> => {
    if (!esCliente) return null;

    try {
      const db = await obtenerBaseDatos();
      return await new Promise<string | null>((resolve, reject) => {
        const transaccion = db.transaction(NOMBRE_ALMACEN, 'readonly');
        const almacen = transaccion.objectStore(NOMBRE_ALMACEN);
        const solicitud = almacen.get(nombre);

        solicitud.onsuccess = () => {
          resolve(solicitud.result || null);
        };

        solicitud.onerror = () => {
          reject(solicitud.error);
        };
      });
    } catch (error) {
      console.error(`Error al leer '${nombre}' desde IndexedDB:`, error);
      return null;
    }
  },

  /**
   * Registra o actualiza el valor asociado a una clave en el almacén local.
   */
  setItem: async (nombre: string, valor: string): Promise<void> => {
    if (!esCliente) return;

    try {
      const db = await obtenerBaseDatos();
      await new Promise<void>((resolve, reject) => {
        const transaccion = db.transaction(NOMBRE_ALMACEN, 'readwrite');
        const almacen = transaccion.objectStore(NOMBRE_ALMACEN);
        const solicitud = almacen.put(valor, nombre);

        solicitud.onsuccess = () => {
          resolve();
        };

        solicitud.onerror = () => {
          reject(solicitud.error);
        };
      });
    } catch (error) {
      console.error(`Error al escribir '${nombre}' en IndexedDB:`, error);
    }
  },

  /**
   * Elimina una clave y su valor del almacén.
   */
  removeItem: async (nombre: string): Promise<void> => {
    if (!esCliente) return;

    try {
      const db = await obtenerBaseDatos();
      await new Promise<void>((resolve, reject) => {
        const transaccion = db.transaction(NOMBRE_ALMACEN, 'readwrite');
        const almacen = transaccion.objectStore(NOMBRE_ALMACEN);
        const solicitud = almacen.delete(nombre);

        solicitud.onsuccess = () => {
          resolve();
        };

        solicitud.onerror = () => {
          reject(solicitud.error);
        };
      });
    } catch (error) {
      console.error(`Error al borrar '${nombre}' en IndexedDB:`, error);
    }
  },
};

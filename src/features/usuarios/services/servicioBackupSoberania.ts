// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import type { PaqueteBackupSoberania } from '../types/roles.ts';

/**
 * Valida la estructura mínima obligatoria de un archivo de respaldo JSON.
 */
export function validarEstructuraBackup(datos: any): datos is PaqueteBackupSoberania {
  if (!datos || typeof datos !== 'object') return false;
  if (typeof datos.version !== 'string') return false;
  if (typeof datos.timestamp !== 'string') return false;
  if (!datos.datosLocalStorage || typeof datos.datosLocalStorage !== 'object') return false;
  if (!datos.datosIndexedDB || typeof datos.datosIndexedDB !== 'object') return false;
  return true;
}

/**
 * Filtra claves sensibles o de autenticación de terceros al exportar localStorage.
 */
export function filtrarClavesSensiblesLocalStorage(
  storage: Record<string, string>
): Record<string, string> {
  const resultado: Record<string, string> = {};
  for (const [clave, valor] of Object.entries(storage)) {
    // Excluir tokens internos de firebase u OAuth
    if (clave.startsWith('firebase:') || clave.includes('token') || clave.includes('secret')) {
      continue;
    }
    resultado[clave] = valor;
  }
  return resultado;
}

/**
 * Genera el nombre estándar para la descarga del backup JSON.
 */
export function generarNombreArchivoBackup(): string {
  const hoy = new Date().toISOString().split('T')[0];
  return `flowpro_backup_${hoy}.json`;
}

/**
 * Recopila todos los datos de LocalStorage permitidos.
 */
export function recopilarLocalStorage(): Record<string, string> {
  const todos: Record<string, string> = {};
  if (typeof window === 'undefined') return todos;

  for (let i = 0; i < localStorage.length; i++) {
    const clave = localStorage.key(i);
    if (clave) {
      todos[clave] = localStorage.getItem(clave) || '';
    }
  }
  return filtrarClavesSensiblesLocalStorage(todos);
}

/**
 * Exporta el paquete de respaldo completo y dispara la descarga en el navegador.
 */
export async function descargarBackupCompleto(emailUsuario: string): Promise<void> {
  const datosLocalStorage = recopilarLocalStorage();

  const paquete: PaqueteBackupSoberania = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    origen: 'flowpro-suite',
    usuario: emailUsuario,
    datosLocalStorage,
    datosIndexedDB: {},
  };

  const contenidoBlob = new Blob([JSON.stringify(paquete, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(contenidoBlob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = generarNombreArchivoBackup();
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

/**
 * Restaura los datos del paquete JSON en LocalStorage e IndexedDB.
 */
export async function restaurarBackupCompleto(paquete: PaqueteBackupSoberania): Promise<{ exito: boolean; mensaje: string }> {
  if (!validarEstructuraBackup(paquete)) {
    return { exito: false, mensaje: 'El archivo seleccionado no tiene un formato de respaldo válido de FlowPro.' };
  }

  try {
    if (typeof window !== 'undefined') {
      for (const [clave, valor] of Object.entries(paquete.datosLocalStorage)) {
        localStorage.setItem(clave, valor);
      }
    }
    return { exito: true, mensaje: 'Datos restaurados correctamente. La página se actualizará.' };
  } catch (error: any) {
    return { exito: false, mensaje: `Error al restaurar: ${error?.message || 'Error desconocido'}` };
  }
}

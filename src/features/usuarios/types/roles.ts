// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

export type RolUsuario = 'superadmin' | 'admin' | 'supervisor' | 'operador';

export type PermisoSistema =
  | 'ver_dashboard'
  | 'operar_modulos'
  | 'gestionar_asistencias'
  | 'revisar_metricas'
  | 'configurar_sistema'
  | 'gestionar_roles'
  | 'modo_superusuario'
  | 'exportar_datos';

export interface UsuarioPerfilExtendido {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  rol: RolUsuario;
  activo: boolean;
  ultimoAcceso: string;
  actualizadoEn?: string;
}

export interface PaqueteBackupSoberania {
  version: string;
  timestamp: string;
  origen: string;
  usuario: string;
  datosLocalStorage: Record<string, string>;
  datosIndexedDB: Record<string, any[]>;
}

// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import type { RolUsuario, PermisoSistema } from '../types/roles.ts';

// Lista blanca de correos electrónicos con acceso Superadmin inmediato
export const CORREOS_SUPERADMIN: readonly string[] = [
  'jorgeotripodi@gmail.com',
  'jorge.tripodi@flowpro.com',
  'jorgeotripodi@hotmail.com',
];

// Lista blanca de correos electrónicos con acceso Administrador inmediato
export const CORREOS_ADMIN: readonly string[] = [
  'roma1516@hotmail.com',
];

// Jerarquía numérica de roles (mayor número = mayores privilegios)
export const JERARQUIA_ROLES: Record<RolUsuario, number> = {
  superadmin: 4,
  admin: 3,
  supervisor: 2,
  operador: 1,
};

// Matriz de permisos por rol
export const MATRIZ_PERMISOS: Record<RolUsuario, readonly PermisoSistema[]> = {
  superadmin: [
    'ver_dashboard',
    'operar_modulos',
    'gestionar_asistencias',
    'revisar_metricas',
    'configurar_sistema',
    'gestionar_roles',
    'modo_superusuario',
    'exportar_datos',
  ],
  admin: [
    'ver_dashboard',
    'operar_modulos',
    'gestionar_asistencias',
    'revisar_metricas',
    'configurar_sistema',
    'gestionar_roles',
    'exportar_datos',
  ],
  supervisor: [
    'ver_dashboard',
    'operar_modulos',
    'gestionar_asistencias',
    'revisar_metricas',
    'exportar_datos',
  ],
  operador: [
    'ver_dashboard',
    'operar_modulos',
  ],
};

export function deducirRolPorEmail(email: string | null | undefined): RolUsuario {
  if (!email) return 'operador';
  const emailNormalizado = email.trim().toLowerCase();
  const esSuper = CORREOS_SUPERADMIN.some((correo) => correo.toLowerCase() === emailNormalizado);
  if (esSuper) return 'superadmin';
  const esAdmin = CORREOS_ADMIN.some((correo) => correo.toLowerCase() === emailNormalizado);
  if (esAdmin) return 'admin';
  return 'operador';
}

export function tienePermiso(rol: RolUsuario, permiso: PermisoSistema): boolean {
  const permisos = MATRIZ_PERMISOS[rol] || [];
  return permisos.includes(permiso);
}

export function esRolMayorOIgual(rolActual: RolUsuario, rolRequerido: RolUsuario): boolean {
  return (JERARQUIA_ROLES[rolActual] ?? 0) >= (JERARQUIA_ROLES[rolRequerido] ?? 0);
}

export function formatearNombreRol(rol: RolUsuario): string {
  switch (rol) {
    case 'superadmin':
      return 'Superadmin';
    case 'admin':
      return 'Administrador';
    case 'supervisor':
      return 'Supervisor';
    case 'operador':
      return 'Operador';
    default:
      return 'Usuario';
  }
}

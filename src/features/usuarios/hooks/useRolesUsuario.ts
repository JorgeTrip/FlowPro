// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { RolUsuario, UsuarioPerfilExtendido, PermisoSistema } from '../types/roles';
import { sincronizarPerfilUsuario, tienePermiso } from '../services/servicioRoles';

const CLAVE_SIMULACION_ROL = 'flowpro_rol_simulado_dev';

export function useRolesUsuario() {
  const { user } = useAuthStore();
  const [perfil, setPerfil] = useState<UsuarioPerfilExtendido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [rolSimulado, setRolSimulado] = useState<RolUsuario | null>(null);

  // Sincronizar perfil con Firestore / LocalStorage
  const cargarPerfil = useCallback(async () => {
    if (!user) {
      setPerfil(null);
      setCargando(false);
      return;
    }

    setCargando(true);
    try {
      const p = await sincronizarPerfilUsuario(user.uid, user.email, user.displayName, user.photoURL);
      setPerfil(p);
    } catch (err) {
      console.warn('[useRolesUsuario] Error al sincronizar:', err);
    } finally {
      setCargando(false);
    }
  }, [user]);

  useEffect(() => {
    cargarPerfil();
  }, [cargarPerfil]);

  // Recuperar rol simulado persistido en sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const guardado = sessionStorage.getItem(CLAVE_SIMULACION_ROL) as RolUsuario | null;
      if (guardado) setRolSimulado(guardado);
    }
  }, []);

  const rolOriginal: RolUsuario = perfil?.rol || 'operador';
  // Si es superadmin o entorno de desarrollo, permitir usar el rol simulado
  const rolActivo: RolUsuario = rolSimulado && (rolOriginal === 'superadmin' || process.env.NODE_ENV === 'development')
    ? rolSimulado
    : rolOriginal;

  const simularRol = (nuevoRol: RolUsuario | null) => {
    setRolSimulado(nuevoRol);
    if (typeof window !== 'undefined') {
      if (nuevoRol) {
        sessionStorage.setItem(CLAVE_SIMULACION_ROL, nuevoRol);
      } else {
        sessionStorage.removeItem(CLAVE_SIMULACION_ROL);
      }
    }
  };

  const verificarPermiso = useCallback(
    (permiso: PermisoSistema): boolean => {
      return tienePermiso(rolActivo, permiso);
    },
    [rolActivo]
  );

  return {
    perfil,
    cargando,
    rolActivo,
    rolOriginal,
    esSuperadmin: rolOriginal === 'superadmin',
    esSimulando: Boolean(rolSimulado && rolSimulado !== rolOriginal),
    simularRol,
    restaurarRolOriginal: () => simularRol(null),
    verificarPermiso,
    recargarPerfil: cargarPerfil,
  };
}

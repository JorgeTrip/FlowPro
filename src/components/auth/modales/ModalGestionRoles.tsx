// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, UserCheck, RefreshCw } from 'lucide-react';
import type { RolUsuario, UsuarioPerfilExtendido } from '@/features/usuarios/types/roles';
import {
  listarUsuariosFirestore,
  actualizarRolUsuario,
  formatearNombreRol,
} from '@/features/usuarios/services/servicioRoles';
import { BadgeRolUsuario } from '../componentes/BadgeRolUsuario';

interface ModalGestionRolesProps {
  abierto: boolean;
  onCerrar: () => void;
  uidUsuarioActual: string;
}

const ROLES_ASIGNABLES: RolUsuario[] = ['superadmin', 'admin', 'supervisor', 'operador'];

export function ModalGestionRoles({ abierto, onCerrar, uidUsuarioActual }: ModalGestionRolesProps) {
  const [usuarios, setUsuarios] = useState<UsuarioPerfilExtendido[]>([]);
  const [cargando, setCargando] = useState(false);
  const [actualizandoUid, setActualizandoUid] = useState<string | null>(null);

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const lista = await listarUsuariosFirestore();
      setUsuarios(lista);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (abierto) {
      cargarUsuarios();
    }
  }, [abierto]);

  const handleCambiarRol = async (uid: string, nuevoRol: RolUsuario) => {
    setActualizandoUid(uid);
    try {
      await actualizarRolUsuario(uid, nuevoRol);
      setUsuarios((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, rol: nuevoRol } : u))
      );
    } finally {
      setActualizandoUid(null);
    }
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-gray-800 dark:bg-[#1C1C1E]/95">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Jerarquía y Roles</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Gestión de privilegios de usuarios</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Lista de Usuarios */}
        <div className="mt-4 max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {cargando ? (
            <div className="flex justify-center p-6 text-xs text-gray-500">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            </div>
          ) : usuarios.length === 0 ? (
            <p className="text-center py-6 text-xs text-gray-500">No hay usuarios registrados en Firestore.</p>
          ) : (
            usuarios.map((u) => (
              <div
                key={u.uid}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 p-3 text-xs dark:border-gray-800/60 dark:bg-gray-900/40"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900 dark:text-gray-100 truncate">{u.displayName}</span>
                    {u.uid === uidUsuarioActual && (
                      <span className="rounded bg-blue-100 px-1 py-0.2 text-[9px] font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Tú
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={u.rol}
                    disabled={actualizandoUid === u.uid}
                    onChange={(e) => handleCambiarRol(u.uid, e.target.value as RolUsuario)}
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:outline-none"
                  >
                    {ROLES_ASIGNABLES.map((r) => (
                      <option key={r} value={r}>
                        {formatearNombreRol(r)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 flex justify-end border-t border-gray-100 pt-3 dark:border-gray-800">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

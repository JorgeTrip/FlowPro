// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, RefreshCw, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { RolUsuario, UsuarioPerfilExtendido } from '@/features/usuarios/types/roles';
import {
  listarUsuariosFirestore,
  actualizarRolUsuario,
  registrarUsuarioPorEmail,
  formatearNombreRol,
} from '@/features/usuarios/services/servicioRoles';
import { FormularioAsignarRolEmail } from './FormularioAsignarRolEmail';

interface ModalGestionRolesProps {
  abierto: boolean;
  onCerrar: () => void;
  uidUsuarioActual: string;
}

const ROLES_ASIGNABLES: RolUsuario[] = ['superadmin', 'admin', 'supervisor', 'operador'];

export function ModalGestionRoles({ abierto, onCerrar, uidUsuarioActual }: ModalGestionRolesProps) {
  const [usuarios, setUsuarios] = useState<UsuarioPerfilExtendido[]>([]);
  const [cargando, setCargando] = useState(false);
  const [errorFirestore, setErrorFirestore] = useState<string | null>(null);
  const [actualizandoUid, setActualizandoUid] = useState<string | null>(null);
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const cargarUsuarios = async () => {
    setCargando(true);
    setErrorFirestore(null);
    try {
      const res = await listarUsuariosFirestore();
      setUsuarios(res.usuarios);
      if (res.error) setErrorFirestore(res.error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (abierto) {
      cargarUsuarios();
      setMostrarFormNuevo(false);
      setMensajeExito(null);
    }
  }, [abierto]);

  const handleCambiarRol = async (uid: string, rol: RolUsuario) => {
    setActualizandoUid(uid);
    try {
      await actualizarRolUsuario(uid, rol);
      setUsuarios((prev) => prev.map((u) => (u.uid === uid ? { ...u, rol } : u)));
    } finally {
      setActualizandoUid(null);
    }
  };

  const handleCrearUsuario = async (email: string, rol: RolUsuario) => {
    setCargando(true);
    try {
      await registrarUsuarioPorEmail(email, rol);
      setMensajeExito(`Rol asignado correctamente a ${email}.`);
      setMostrarFormNuevo(false);
      await cargarUsuarios();
    } catch (err: any) {
      setErrorFirestore(err?.message || 'Error al registrar rol.');
    } finally {
      setCargando(false);
    }
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-gray-800 dark:bg-[#1C1C1E]/95">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Jerarquía y Roles</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Gestión de privilegios de usuarios</p>
            </div>
          </div>
          <button type="button" onClick={onCerrar} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorFirestore && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <p className="font-medium">{errorFirestore}</p>
          </div>
        )}

        {mensajeExito && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{mensajeExito}</span>
          </div>
        )}

        {mostrarFormNuevo ? (
          <FormularioAsignarRolEmail
            onGuardar={handleCrearUsuario}
            onCancelar={() => setMostrarFormNuevo(false)}
            rolesDisponibles={ROLES_ASIGNABLES}
          />
        ) : (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setMostrarFormNuevo(true)}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 shadow-sm"
            >
              <UserPlus className="h-3.5 w-3.5 text-blue-500" />
              <span>+ Asignar rol por email</span>
            </button>
          </div>
        )}

        <div className="mt-3 max-h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {cargando ? (
            <div className="flex justify-center p-6 text-xs text-gray-500">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            </div>
          ) : usuarios.length === 0 ? (
            <p className="text-center py-6 text-xs text-gray-500">No hay usuarios registrados en Firestore.</p>
          ) : (
            usuarios.map((u) => (
              <div key={u.uid} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 p-2.5 text-xs dark:border-gray-800/60 dark:bg-gray-900/40">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900 dark:text-gray-100 truncate">{u.displayName}</span>
                    {u.uid === uidUsuarioActual && (
                      <span className="rounded bg-blue-100 px-1 py-0.2 text-[9px] font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-200">Tú</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                </div>
                <select
                  value={u.rol}
                  disabled={actualizandoUid === u.uid}
                  onChange={(e) => handleCambiarRol(u.uid, e.target.value as RolUsuario)}
                  className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:outline-none"
                >
                  {ROLES_ASIGNABLES.map((r) => (
                    <option key={r} value={r}>{formatearNombreRol(r)}</option>
                  ))}
                </select>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex justify-between items-center border-t border-gray-100 pt-3 dark:border-gray-800">
          <button type="button" onClick={cargarUsuarios} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            <span>Actualizar</span>
          </button>
          <button type="button" onClick={onCerrar} className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { logoutUser } from '@/services/authService';
import { useRolesUsuario } from '@/features/usuarios/hooks/useRolesUsuario';
import { LogOut, User as UserIcon, Keyboard, HardDrive, ShieldCheck, Database } from 'lucide-react';

import { EditarPerfilModal } from './EditarPerfilModal';
import { BadgeRolUsuario } from './componentes/BadgeRolUsuario';
import { SelectorSimuladorRol } from './componentes/SelectorSimuladorRol';
import { ModalAtajosTeclado } from './modales/ModalAtajosTeclado';
import { ModalGestionAlmacenamiento } from './modales/ModalGestionAlmacenamiento';
import { ModalSoberaniaDatos } from './modales/ModalSoberaniaDatos';
import { ModalGestionRoles } from './modales/ModalGestionRoles';

export function UserAvatarMenu() {
  const { user } = useAuthStore();
  const {
    rolActivo,
    esSuperadmin,
    esSimulando,
    simularRol,
    restaurarRolOriginal,
  } = useRolesUsuario();

  const [open, setOpen] = useState(false);
  const [modalPerfil, setModalPerfil] = useState(false);
  const [modalRoles, setModalRoles] = useState(false);
  const [modalAtajos, setModalAtajos] = useState(false);
  const [modalStorage, setModalStorage] = useState(false);
  const [modalBackup, setModalBackup] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const iniciales = (user.displayName || user.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center space-x-2 rounded-full p-1 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {user.photoURL ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="h-8 w-8 rounded-full object-cover shadow-sm" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
              {iniciales}
            </div>
          )}
          <span className="hidden text-xs font-medium text-gray-700 dark:text-gray-200 md:inline">
            {user.displayName}
          </span>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-200 bg-white/95 p-2.5 shadow-2xl backdrop-blur-xl dark:border-gray-800 dark:bg-[#1C1C1E]/95 z-[9999] animate-fadeIn">
            {/* Cabecera con Perfil y Rol */}
            <div className="border-b border-gray-100 p-2 dark:border-gray-800/80">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{user.displayName}</p>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-gray-400">Online</span>
                </div>
              </div>
              <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">{user.email}</p>
              <div className="mt-1.5">
                <BadgeRolUsuario rol={rolActivo} esSimulando={esSimulando} />
              </div>
            </div>

            {/* Opciones Principales */}
            <div className="my-1.5 space-y-0.5">
              <button
                onClick={() => { setOpen(false); setModalPerfil(true); }}
                className="flex w-full items-center space-x-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                <UserIcon className="h-4 w-4 text-blue-500" />
                <span>Editar Mi Perfil</span>
              </button>

              {(esSuperadmin || rolActivo === 'admin') && (
                <button
                  onClick={() => { setOpen(false); setModalRoles(true); }}
                  className="flex w-full items-center space-x-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-indigo-500" />
                  <span>Gestión de Roles</span>
                </button>
              )}

              <button
                onClick={() => { setOpen(false); setModalAtajos(true); }}
                className="flex w-full items-center space-x-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                <Keyboard className="h-4 w-4 text-purple-500" />
                <span>Atajos de Teclado</span>
              </button>

              <button
                onClick={() => { setOpen(false); setModalBackup(true); }}
                className="flex w-full items-center space-x-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                <Database className="h-4 w-4 text-emerald-500" />
                <span>Soberanía de Datos (Backup)</span>
              </button>

              <button
                onClick={() => { setOpen(false); setModalStorage(true); }}
                className="flex w-full items-center space-x-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                <HardDrive className="h-4 w-4 text-amber-500" />
                <span>Almacenamiento Local</span>
              </button>
            </div>

            {/* Simulación Superusuario */}
            {esSuperadmin && (
              <div className="my-1.5 border-t border-gray-100 pt-1.5 dark:border-gray-800/80">
                <SelectorSimuladorRol
                  rolActivo={rolActivo}
                  esSimulando={esSimulando}
                  onCambiarRol={simularRol}
                  onRestaurar={restaurarRolOriginal}
                />
              </div>
            )}

            {/* Cerrar Sesión */}
            <div className="border-t border-gray-100 pt-1.5 dark:border-gray-800/80">
              <button
                onClick={() => logoutUser()}
                className="flex w-full items-center space-x-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <EditarPerfilModal isOpen={modalPerfil} onClose={() => setModalPerfil(false)} />
      <ModalGestionRoles abierto={modalRoles} onCerrar={() => setModalRoles(false)} uidUsuarioActual={user.uid} />
      <ModalAtajosTeclado abierto={modalAtajos} onCerrar={() => setModalAtajos(false)} />
      <ModalGestionAlmacenamiento abierto={modalStorage} onCerrar={() => setModalStorage(false)} />
      <ModalSoberaniaDatos abierto={modalBackup} onCerrar={() => setModalBackup(false)} emailUsuario={user.email || ''} />
    </>
  );
}

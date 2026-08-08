// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { logoutUser } from '@/services/authService';
import { LogOut } from 'lucide-react';

export function UserAvatarMenu() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
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
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 rounded-full p-1 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="h-8 w-8 rounded-full object-cover" />
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
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-xl backdrop-blur-lg dark:border-gray-800 dark:bg-[#1C1C1E] z-[9999]">
          <div className="border-b border-gray-100 p-2 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{user.displayName}</p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={() => logoutUser()}
            className="mt-1 flex w-full items-center space-x-2 rounded-lg px-2 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
}

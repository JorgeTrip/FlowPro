// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import type { RolUsuario } from '@/features/usuarios/types/roles';
import { Eye, RotateCcw } from 'lucide-react';

interface SelectorSimuladorRolProps {
  rolActivo: RolUsuario;
  esSimulando: boolean;
  onCambiarRol: (rol: RolUsuario | null) => void;
  onRestaurar: () => void;
}

const ROLES_DISPONIBLES: RolUsuario[] = ['superadmin', 'admin', 'supervisor', 'operador'];

export function SelectorSimuladorRol({
  rolActivo,
  esSimulando,
  onCambiarRol,
  onRestaurar,
}: SelectorSimuladorRolProps) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2 dark:border-amber-900/40 dark:bg-amber-950/20">
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-900 dark:text-amber-300">
          <Eye className="h-3 w-3 text-amber-600 dark:text-amber-400" />
          Modo Simulación (Dev)
        </span>
        {esSimulando && (
          <button
            type="button"
            onClick={onRestaurar}
            title="Restaurar a mi rol real"
            className="flex items-center gap-0.5 rounded px-1 text-[10px] font-semibold text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/40 transition-colors"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            <span>Restaurar</span>
          </button>
        )}
      </div>

      <select
        value={rolActivo}
        onChange={(e) => onCambiarRol(e.target.value as RolUsuario)}
        className="w-full rounded-lg border border-amber-300 bg-white px-2 py-1 text-xs font-semibold text-gray-800 shadow-sm focus:border-amber-500 focus:outline-none dark:border-amber-800 dark:bg-[#1C1C1E] dark:text-gray-100"
      >
        {ROLES_DISPONIBLES.map((r) => (
          <option key={r} value={r}>
            Ver como: {r.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useState } from 'react';
import type { RolUsuario } from '@/features/usuarios/types/roles';
import { formatearNombreRol } from '@/features/usuarios/services/evaluadorRoles';

interface FormularioAsignarRolEmailProps {
  onGuardar: (email: string, rol: RolUsuario) => Promise<void>;
  onCancelar: () => void;
  rolesDisponibles: RolUsuario[];
}

export function FormularioAsignarRolEmail({
  onGuardar,
  onCancelar,
  rolesDisponibles,
}: FormularioAsignarRolEmailProps) {
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState<RolUsuario>('admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onGuardar(email.trim(), rol);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 rounded-xl border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-900/40 dark:bg-blue-950/20 space-y-2.5"
    >
      <span className="text-xs font-bold text-blue-950 dark:text-blue-200">
        Asignar Rol por Correo Electrónico
      </span>
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="ejemplo@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-grow rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          required
        />
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value as RolUsuario)}
          className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-semibold text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        >
          {rolesDisponibles.map((r) => (
            <option key={r} value={r}>
              {formatearNombreRol(r)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-lg px-2.5 py-1 text-xs text-gray-600 dark:text-gray-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import type { RolUsuario } from '@/features/usuarios/types/roles';
import { formatearNombreRol } from '@/features/usuarios/services/evaluadorRoles';
import { Shield, Sparkles, UserCheck, Wrench } from 'lucide-react';
import { clsx } from 'clsx';

interface BadgeRolUsuarioProps {
  rol: RolUsuario;
  esSimulando?: boolean;
}

export function BadgeRolUsuario({ rol, esSimulando = false }: BadgeRolUsuarioProps) {
  const nombre = formatearNombreRol(rol);

  const configEstilos: Record<RolUsuario, { clase: string; icono: React.ReactNode }> = {
    superadmin: {
      clase: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/60',
      icono: <Sparkles className="h-3 w-3 text-amber-500" />,
    },
    admin: {
      clase: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700/60',
      icono: <Shield className="h-3 w-3 text-blue-500" />,
    },
    supervisor: {
      clase: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/60',
      icono: <UserCheck className="h-3 w-3 text-emerald-500" />,
    },
    operador: {
      clase: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
      icono: <Wrench className="h-3 w-3 text-gray-500" />,
    },
  };

  const estilo = configEstilos[rol] || configEstilos.operador;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide shadow-sm',
        estilo.clase
      )}
    >
      {estilo.icono}
      <span>{nombre}</span>
      {esSimulando && (
        <span className="ml-0.5 rounded bg-amber-500/20 px-1 py-0.2 text-[9px] font-extrabold text-amber-700 dark:text-amber-400">
          DEV
        </span>
      )}
    </span>
  );
}

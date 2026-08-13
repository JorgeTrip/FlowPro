// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const AuthGuard = dynamic(
  () => import('./AuthGuard').then((mod) => mod.AuthGuard),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-50 dark:bg-[#1C1C1E]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Verificando sesión...</p>
      </div>
    ),
  }
);

export function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}

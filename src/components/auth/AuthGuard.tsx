// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, inicializarAuth } = useAuthStore();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = inicializarAuth();
    return () => unsubscribe();
  }, [inicializarAuth]);

  if (!mounted || loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-50 dark:bg-[#1C1C1E]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Verificando autenticación...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4 dark:bg-[#1C1C1E]">
        {modoRegistro ? (
          <RegisterForm onIrALogin={() => setModoRegistro(false)} />
        ) : (
          <LoginForm onIrARegistro={() => setModoRegistro(true)} />
        )}
      </div>
    );
  }

  return <>{children}</>;
}

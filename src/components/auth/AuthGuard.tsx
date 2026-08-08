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
      <div className="flex h-96 w-full flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Verificando autenticación...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
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

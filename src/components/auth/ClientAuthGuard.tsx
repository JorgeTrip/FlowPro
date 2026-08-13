// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
'use client';

import React from 'react';
import { AuthGuard } from './AuthGuard';

export function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}

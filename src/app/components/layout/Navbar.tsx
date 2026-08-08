// © 2025 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

import { UserAvatarMenu } from '@/components/auth/UserAvatarMenu';

export function Navbar() {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">FlowPro</h1>
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">by J.O.T.</span>
      </div>
      <div>
        <UserAvatarMenu />
      </div>
    </header>
  );
}


'use client';

import { logout } from '@/app/actions/auth';
import { useTransition } from 'react';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
    >
      {isPending ? 'Cerrando...' : 'Cerrar sesión'}
    </button>
  );
}

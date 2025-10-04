import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/types/database';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { GlobalSearch } from '@/components/layout/global-search';
import { LogoutButton } from '@/components/layout/logout-button';

export const metadata: Metadata = {
  title: 'Dashboard - DessaTech',
  description: 'Gestión de consultantes y sesiones',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Tables<'profiles'>>();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard">
                <h1 className="text-2xl font-bold text-indigo-600">
                  DessaTech
                </h1>
              </Link>
              <nav className="hidden md:flex gap-6">
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/consultantes"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Consultantes
                </Link>
                <Link
                  href="/sesiones"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sesiones
                </Link>
                <Link
                  href="/agenda"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Agenda
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <GlobalSearch />
              <span className="text-sm text-gray-600">
                {profile?.nombre_completo || user.email}
              </span>
              <Link
                href="/configuracion"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

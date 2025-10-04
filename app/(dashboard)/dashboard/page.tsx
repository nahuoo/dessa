import { getDashboardStats } from '@/app/actions/dashboard';
import { getSesionesUltimosMeses, getEstadisticasCrecimiento } from '@/app/actions/analytics';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { SimpleBarChart } from '@/components/dashboard/simple-bar-chart';
import { TrendCard } from '@/components/dashboard/trend-card';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/types/database';
import Link from 'next/link';
import { Suspense } from 'react';

async function DashboardContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Obtener perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Tables<'profiles'>>();

  // Obtener datos en paralelo
  const [statsResult, sesionesResult, crecimientoResult] = await Promise.all([
    getDashboardStats(false),
    getSesionesUltimosMeses(6),
    getEstadisticasCrecimiento(),
  ]);

  if (statsResult.error || !statsResult.data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error cargando estadísticas</p>
      </div>
    );
  }

  const stats = statsResult.data;
  const sesionesMeses = sesionesResult.data || [];
  const crecimiento = crecimientoResult.data;

  // Preparar datos para gráficos
  const sesionesChartData = sesionesMeses.map((item) => ({
    label: item.mes,
    value: item.cantidad,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {profile?.nombre_completo}
        </h1>
        <p className="text-gray-600 mt-2">
          Aquí tienes un resumen completo de tu actividad profesional
        </p>
      </div>

      {/* Quick Stats */}
      <QuickStats
        stats={[
          {
            title: 'Total Consultantes',
            value: stats.consultantes.total,
            subtitle: `${stats.consultantes.activos} activos`,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            ),
            color: 'indigo',
          },
          {
            title: 'Sesiones Este Mes',
            value: stats.sesiones.totalMes,
            subtitle: `${stats.sesiones.promedioPorConsultante.toFixed(1)} promedio`,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            ),
            color: 'green',
          },
          {
            title: 'Citas Esta Semana',
            value: stats.citas.citasEstaSemana,
            subtitle: `${stats.citas.citasHoy} hoy`,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
            color: 'blue',
          },
          {
            title: 'Próximas Citas',
            value: stats.citas.proximasCitas,
            subtitle: 'programadas',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            ),
            color: 'purple',
          },
        ]}
      />

      {/* Trend Cards - Crecimiento */}
      {crecimiento && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TrendCard
            title="Nuevos Consultantes"
            currentValue={crecimiento.consultantes.actual}
            previousValue={crecimiento.consultantes.anterior}
            label="mes anterior"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            }
            color="indigo"
          />
          <TrendCard
            title="Sesiones Realizadas"
            currentValue={crecimiento.sesiones.actual}
            previousValue={crecimiento.sesiones.anterior}
            label="mes anterior"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            }
            color="green"
          />
        </div>
      )}

      {/* Gráfico de Sesiones */}
      {sesionesChartData.length > 0 && (
        <SimpleBarChart
          data={sesionesChartData}
          title="Sesiones Últimos 6 Meses"
          color="indigo"
        />
      )}

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed
          title="Últimas sesiones"
          items={stats.actividadReciente.ultimasSesiones}
          emptyMessage="No hay sesiones registradas aún"
          linkHref="/sesiones"
          linkText="Ver todas"
        />

        <ActivityFeed
          title="Próximas citas"
          items={stats.actividadReciente.proximasCitas}
          emptyMessage="No hay citas programadas"
          linkHref="/agenda"
          linkText="Ver agenda"
          isUpcoming
        />
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/consultantes/nuevo"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left block group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Nuevo Consultante</h3>
            </div>
            <p className="text-sm text-gray-600">Agregar un nuevo consultante a tu lista</p>
          </Link>
          <Link
            href="/sesiones/nueva"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left block group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Nueva Sesión</h3>
            </div>
            <p className="text-sm text-gray-600">Registrar una nueva sesión terapéutica</p>
          </Link>
          <Link
            href="/consultantes"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left block group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Ver Consultantes</h3>
            </div>
            <p className="text-sm text-gray-600">Gestiona tu lista completa de consultantes</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse h-32"></div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}

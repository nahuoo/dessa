import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/types/database';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { decrypt } from '@/lib/utils/encryption';
import { CalendarView } from '@/components/agenda/calendar-view';
import Link from 'next/link';

export default async function AgendaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Obtener citas ordenadas por fecha
  const { data: citas } = await supabase
    .from('citas')
    .select(`
      *,
      consultantes!inner(nombre_completo, profesional_id)
    `)
    .eq('consultantes.profesional_id', user.id)
    .order('fecha_hora', { ascending: true });

  // Separar citas futuras y pasadas
  const now = new Date();
  const citasFuturas = citas?.filter((c) => new Date(c.fecha_hora) >= now) || [];
  const citasPasadas = citas?.filter((c) => new Date(c.fecha_hora) < now) || [];

  // Preparar datos para el calendario
  const citasParaCalendario = citas?.map(cita => ({
    id: cita.id,
    fecha_hora: cita.fecha_hora,
    consultante_nombre: decrypt(cita.consultantes.nombre_completo),
    duracion: cita.duracion,
    estado: cita.estado,
    modalidad: cita.modalidad,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600 mt-1">Gestiona tus citas programadas</p>
        </div>
        <Button asChild>
          <Link href="/agenda/nueva">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Cita
          </Link>
        </Button>
      </div>

      {/* Vista de Calendario */}
      <CalendarView citas={citasParaCalendario} />

      {/* Citas Próximas */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Próximas Citas ({citasFuturas.length})
        </h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {citasFuturas.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-500 mb-4">No hay citas programadas</p>
              <Button asChild size="sm">
                <Link href="/agenda/nueva">Programar Primera Cita</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {citasFuturas.map((cita) => {
                const consultanteNombre = decrypt(cita.consultantes.nombre_completo);
                const fechaCita = new Date(cita.fecha_hora);
                const esHoy = fechaCita.toDateString() === now.toDateString();

                return (
                  <Link
                    key={cita.id}
                    href={`/agenda/${cita.id}`}
                    className="block p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {consultanteNombre}
                          </h3>
                          {esHoy && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                              Hoy
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {format(fechaCita, "EEEE d 'de' MMMM", { locale: es })}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {format(fechaCita, 'HH:mm', { locale: es })} • {cita.duracion} min
                          </span>
                          <span className="capitalize">{cita.modalidad}</span>
                        </div>
                        {cita.notas && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-1">{cita.notas}</p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          cita.estado === 'confirmada'
                            ? 'bg-green-100 text-green-800'
                            : cita.estado === 'pendiente'
                              ? 'bg-yellow-100 text-yellow-800'
                              : cita.estado === 'cancelada'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Citas Pasadas */}
      {citasPasadas.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Historial ({citasPasadas.length})
          </h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {citasPasadas.slice(0, 5).map((cita) => {
                const consultanteNombre = decrypt(cita.consultantes.nombre_completo);
                const fechaCita = new Date(cita.fecha_hora);

                return (
                  <Link
                    key={cita.id}
                    href={`/agenda/${cita.id}`}
                    className="block p-6 hover:bg-gray-50 transition-colors opacity-75"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {consultanteNombre}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                          <span>
                            {format(fechaCita, "d 'de' MMMM, yyyy", { locale: es })}
                          </span>
                          <span>
                            {format(fechaCita, 'HH:mm', { locale: es })}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          cita.estado === 'completada'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

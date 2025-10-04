import Link from 'next/link';
import { getSesiones } from '@/app/actions/sesiones';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { decrypt } from '@/lib/utils/encryption';

export default async function SesionesPage() {
  const { data: sesiones, error } = await getSesiones();

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const estadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'programada':
        return 'bg-blue-100 text-blue-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const modalidadIcon = (modalidad: string) => {
    switch (modalidad) {
      case 'presencial':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        );
      case 'videollamada':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        );
      case 'telefónica':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sesiones</h1>
          <p className="text-gray-600 mt-2">
            Registro de todas tus sesiones terapéuticas
          </p>
        </div>
        <Button asChild>
          <Link href="/sesiones/nueva">Nueva sesión</Link>
        </Button>
      </div>

      {/* Lista de sesiones */}
      {!sesiones || sesiones.length === 0 ? (
        <Card className="p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No hay sesiones registradas
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza registrando tu primera sesión
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/sesiones/nueva">Nueva sesión</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {sesiones.map((sesion: any) => {
            // Descifrar nombre del consultante
            const consultanteNombre = sesion.consultantes?.nombre_completo
              ? decrypt(sesion.consultantes.nombre_completo)
              : 'Consultante desconocido';

            return (
              <Link key={sesion.id} href={`/sesiones/${sesion.id}`}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {consultanteNombre}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${estadoBadgeColor(
                            sesion.estado
                          )}`}
                        >
                          {sesion.estado}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
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
                          {format(new Date(sesion.fecha), "d 'de' MMMM, yyyy - HH:mm", {
                            locale: es,
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {sesion.duracion} min
                        </span>
                        <span className="flex items-center gap-1">
                          {modalidadIcon(sesion.modalidad)}
                          {sesion.modalidad}
                        </span>
                      </div>

                      {sesion.notas && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {sesion.notas.substring(0, 150)}
                          {sesion.notas.length > 150 ? '...' : ''}
                        </p>
                      )}

                      {sesion.objetivos_trabajados &&
                        sesion.objetivos_trabajados.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {sesion.objetivos_trabajados.slice(0, 3).map((obj: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded"
                              >
                                {obj}
                              </span>
                            ))}
                            {sesion.objetivos_trabajados.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{sesion.objetivos_trabajados.length - 3} más
                              </span>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

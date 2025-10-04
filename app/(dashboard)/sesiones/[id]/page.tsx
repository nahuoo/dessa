import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSesion, deleteSesion } from '@/app/actions/sesiones';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { decrypt } from '@/lib/utils/encryption';

export default async function SesionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: sesion, error } = await getSesion(id);

  if (error || !sesion) {
    notFound();
  }

  // Descifrar nombre del consultante
  const consultanteNombre = sesion.consultantes?.nombre_completo
    ? decrypt(sesion.consultantes.nombre_completo)
    : 'Consultante desconocido';

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
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  async function handleDelete() {
    'use server';
    await deleteSesion(id);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/sesiones"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver a sesiones
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="shadow-sm">
            <Link href={`/sesiones/${id}/editar`}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Editar
            </Link>
          </Button>
          <form action={handleDelete}>
            <Button variant="destructive" type="submit" className="shadow-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Eliminar
            </Button>
          </form>
        </div>
      </div>

      {/* Header con información principal */}
      <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-100">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Link
                  href={`/consultantes/${sesion.consultante_id}`}
                  className="text-2xl font-bold text-gray-900 hover:text-indigo-600 transition-colors"
                >
                  {consultanteNombre}
                </Link>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${estadoBadgeColor(
                    sesion.estado
                  )}`}
                >
                  {sesion.estado.charAt(0).toUpperCase() + sesion.estado.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-medium">
                    {format(new Date(sesion.fecha), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{sesion.duracion} minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  {modalidadIcon(sesion.modalidad)}
                  <span className="capitalize">{sesion.modalidad}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Notas de la sesión */}
      {sesion.notas && (
        <Card>
          <CardHeader>
            <CardTitle>Notas de la sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{sesion.notas}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Objetivos trabajados */}
      {sesion.objetivos_trabajados && sesion.objetivos_trabajados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Objetivos trabajados</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {sesion.objetivos_trabajados.map((objetivo: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-gray-700">{objetivo}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Tareas asignadas */}
      {sesion.tareas_asignadas && (
        <Card>
          <CardHeader>
            <CardTitle>Tareas asignadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-line">{sesion.tareas_asignadas}</p>
          </CardContent>
        </Card>
      )}

      {/* Próxima sesión */}
      {sesion.proxima_sesion && (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
          <CardHeader>
            <CardTitle className="text-indigo-900">Próxima sesión programada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-indigo-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-medium">
                {format(new Date(sesion.proxima_sesion), "EEEE d 'de' MMMM, yyyy 'a las' HH:mm", {
                  locale: es,
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

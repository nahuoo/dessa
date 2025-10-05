import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConsultante, deleteConsultante } from '@/app/actions/consultantes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createClient } from '@/lib/supabase/server';

export default async function ConsultanteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: consultante, error } = await getConsultante(id);

  if (error || !consultante) {
    notFound();
  }

  // Obtener sesiones del consultante
  const supabase = await createClient();
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { data: sesiones = [] as any[] } = await supabase
    .from('sesiones')
    .select('*')
    .eq('consultante_id', id)
    .order('fecha', { ascending: false })
    .limit(5);

  const { count: totalSesiones } = await supabase
    .from('sesiones')
    .select('*', { count: 'exact', head: true })
    .eq('consultante_id', id);

  const estadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-gray-100 text-gray-800';
      case 'alta':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  async function handleDelete() {
    'use server';
    await deleteConsultante(id);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/consultantes"
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
          Volver a consultantes
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="shadow-sm">
            <Link href={`/consultantes/${id}/editar`}>
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

      {/* Header con avatar */}
      <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-100">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {consultante.nombre_completo.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">
                {consultante.nombre_completo}
              </CardTitle>
              <span
                className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${estadoBadgeColor(
                  consultante.estado
                )}`}
              >
                {consultante.estado.charAt(0).toUpperCase() +
                  consultante.estado.slice(1)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {consultante.email && (
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-gray-900">{consultante.email}</p>
              </div>
            )}

            {consultante.telefono && (
              <div>
                <p className="text-sm font-medium text-gray-500">Teléfono</p>
                <p className="mt-1 text-gray-900">{consultante.telefono}</p>
              </div>
            )}

            {consultante.fecha_nacimiento && (
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Fecha de nacimiento
                </p>
                <p className="mt-1 text-gray-900">
                  {format(new Date(consultante.fecha_nacimiento), "d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-500">
                Fecha de inicio
              </p>
              <p className="mt-1 text-gray-900">
                {format(new Date(consultante.created_at), "d 'de' MMMM, yyyy", {
                  locale: es,
                })}
              </p>
            </div>

            {consultante.motivo_consulta && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">
                  Motivo de consulta
                </p>
                <p className="mt-1 text-gray-900 whitespace-pre-line">
                  {consultante.motivo_consulta}
                </p>
              </div>
            )}

            {consultante.objetivos_terapeuticos &&
              Array.isArray(consultante.objetivos_terapeuticos) &&
              consultante.objetivos_terapeuticos.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Objetivos terapéuticos
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {consultante.objetivos_terapeuticos.map((objetivo: any, index: number) => (
                      <li key={index} className="text-gray-900">
                        {objetivo}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-700">Total de sesiones</p>
              <p className="text-3xl font-bold text-indigo-900 mt-1">
                {totalSesiones || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-700">Estado actual</p>
              <p className="text-3xl font-bold text-green-900 mt-1 capitalize">
                {consultante.estado}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-700">Última actualización</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {format(new Date(consultante.updated_at), "d 'de' MMM", { locale: es })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Últimas sesiones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Últimas sesiones</CardTitle>
            <Button size="sm" asChild>
              <Link href={`/sesiones/nueva?consultante=${id}`}>
                Nueva sesión
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!sesiones || sesiones.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No hay sesiones registradas</p>
              <Button size="sm" className="mt-4" asChild>
                <Link href={`/sesiones/nueva?consultante=${id}`}>
                  Registrar primera sesión
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sesiones.map((sesion) => (
                <div
                  key={sesion.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(new Date(sesion.fecha), "d 'de' MMMM, yyyy", {
                          locale: es,
                        })}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {sesion.duracion} minutos • {sesion.modalidad}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                      {sesion.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

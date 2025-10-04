import Link from 'next/link';
import { getConsultantes } from '@/app/actions/consultantes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SearchBar } from '@/components/consultantes/search-bar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function ConsultantesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string }>;
}) {
  const params = await searchParams;
  const { data: allConsultantes, error } = await getConsultantes(params.estado);

  // Filtrar por búsqueda si hay query
  const consultantes = params.q
    ? allConsultantes?.filter(
        (c) =>
          c.nombre_completo.toLowerCase().includes(params.q!.toLowerCase()) ||
          c.email?.toLowerCase().includes(params.q!.toLowerCase()) ||
          c.motivo_consulta?.toLowerCase().includes(params.q!.toLowerCase())
      )
    : allConsultantes;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

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

  const totalCount = allConsultantes?.length || 0;
  const activosCount =
    allConsultantes?.filter((c) => c.estado === 'activo').length || 0;
  const inactivosCount =
    allConsultantes?.filter((c) => c.estado === 'inactivo').length || 0;
  const altaCount = allConsultantes?.filter((c) => c.estado === 'alta').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultantes</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tu lista de consultantes ({totalCount} total)
          </p>
        </div>
        <Button asChild className="shadow-md">
          <Link href="/consultantes/nuevo">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Nuevo consultante
          </Link>
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <SearchBar defaultValue={params.q} />

      {/* Filtros con badges */}
      <div className="flex flex-wrap gap-2">
        <Link href="/consultantes">
          <Button
            variant={!params.estado ? 'default' : 'outline'}
            size="sm"
            className="shadow-sm"
          >
            Todos
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20">
              {totalCount}
            </span>
          </Button>
        </Link>
        <Link href="/consultantes?estado=activo">
          <Button
            variant={params.estado === 'activo' ? 'default' : 'outline'}
            size="sm"
            className="shadow-sm"
          >
            Activos
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20">
              {activosCount}
            </span>
          </Button>
        </Link>
        <Link href="/consultantes?estado=inactivo">
          <Button
            variant={params.estado === 'inactivo' ? 'default' : 'outline'}
            size="sm"
            className="shadow-sm"
          >
            Inactivos
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20">
              {inactivosCount}
            </span>
          </Button>
        </Link>
        <Link href="/consultantes?estado=alta">
          <Button
            variant={params.estado === 'alta' ? 'default' : 'outline'}
            size="sm"
            className="shadow-sm"
          >
            Alta
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20">
              {altaCount}
            </span>
          </Button>
        </Link>
      </div>

      {/* Lista de consultantes */}
      {!consultantes || consultantes.length === 0 ? (
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No hay consultantes
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza agregando tu primer consultante
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/consultantes/nuevo">
                Nuevo consultante
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultantes.map((consultante) => (
            <Link
              key={consultante.id}
              href={`/consultantes/${consultante.id}`}
            >
              <Card className="p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer bg-gradient-to-br from-white to-gray-50 border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {consultante.nombre_completo.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {consultante.nombre_completo}
                        </h3>
                      </div>
                    </div>
                    {consultante.email && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
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
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        {consultante.email}
                      </div>
                    )}
                    {consultante.telefono && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
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
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        {consultante.telefono}
                      </div>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${estadoBadgeColor(
                      consultante.estado
                    )}`}
                  >
                    {consultante.estado.charAt(0).toUpperCase() +
                      consultante.estado.slice(1)}
                  </span>
                </div>

                {consultante.motivo_consulta && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {consultante.motivo_consulta}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {format(new Date(consultante.created_at), "d 'de' MMM, yyyy", {
                      locale: es,
                    })}
                  </div>
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

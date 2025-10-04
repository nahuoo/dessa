'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getSesion, updateSesion } from '@/app/actions/sesiones';
import { getConsultantes } from '@/app/actions/consultantes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function EditarSesionPage() {
  const params = useParams();
  const id = params.id as string;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sesion, setSesion] = useState<any>(null);
  const [consultantes, setConsultantes] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [sesionResult, consultantesResult] = await Promise.all([
        getSesion(id),
        getConsultantes('activo'),
      ]);

      if (sesionResult.error || !sesionResult.data) {
        setError('No se pudo cargar la sesión');
        setLoadingData(false);
        return;
      }

      setSesion(sesionResult.data);
      if (consultantesResult.data) {
        setConsultantes(consultantesResult.data);
      }
      setLoadingData(false);
    }
    loadData();
  }, [id]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    // Agregar el ID al formData
    formData.append('id', id);

    const result = await updateSesion(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // Si no hay error, el redirect se hace automáticamente en la action
  }

  if (loadingData) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!sesion) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-red-600">No se pudo cargar la sesión</p>
      </div>
    );
  }

  // Formatear fecha para input datetime-local
  const fechaFormateada = new Date(sesion.fecha).toISOString().slice(0, 16);
  const proximaSesionFormateada = sesion.proxima_sesion
    ? new Date(sesion.proxima_sesion).toISOString().slice(0, 16)
    : '';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/sesiones/${id}`}
          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
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
          Volver al detalle
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Sesión</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="consultante_id">
                  Consultante <span className="text-red-500">*</span>
                </Label>
                <select
                  id="consultante_id"
                  name="consultante_id"
                  required
                  defaultValue={sesion.consultante_id}
                  className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Seleccionar consultante...</option>
                  {consultantes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre_completo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="fecha">
                  Fecha y hora <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="datetime-local"
                  required
                  defaultValue={fechaFormateada}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="duracion">
                  Duración (minutos) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="duracion"
                  name="duracion"
                  type="number"
                  required
                  min="1"
                  max="300"
                  defaultValue={sesion.duracion}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="modalidad">
                  Modalidad <span className="text-red-500">*</span>
                </Label>
                <select
                  id="modalidad"
                  name="modalidad"
                  required
                  defaultValue={sesion.modalidad}
                  className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="presencial">Presencial</option>
                  <option value="videollamada">Videollamada</option>
                  <option value="telefónica">Telefónica</option>
                </select>
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <select
                  id="estado"
                  name="estado"
                  defaultValue={sesion.estado}
                  className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="completada">Completada</option>
                  <option value="programada">Programada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notas">Notas de la sesión</Label>
                <Textarea
                  id="notas"
                  name="notas"
                  rows={8}
                  defaultValue={sesion.notas || ''}
                  className="mt-1"
                  placeholder="Registra las observaciones de la sesión..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Las notas se cifrarán automáticamente antes de guardarse
                </p>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="objetivos_trabajados">
                  Objetivos trabajados
                </Label>
                <Textarea
                  id="objetivos_trabajados"
                  name="objetivos_trabajados"
                  rows={3}
                  defaultValue={
                    Array.isArray(sesion.objetivos_trabajados)
                      ? sesion.objetivos_trabajados.join('\n')
                      : ''
                  }
                  className="mt-1"
                  placeholder="Un objetivo por línea..."
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="tareas_asignadas">Tareas asignadas</Label>
                <Textarea
                  id="tareas_asignadas"
                  name="tareas_asignadas"
                  rows={3}
                  defaultValue={sesion.tareas_asignadas || ''}
                  className="mt-1"
                  placeholder="Tareas para realizar antes de la próxima sesión..."
                />
              </div>

              <div>
                <Label htmlFor="proxima_sesion">Próxima sesión</Label>
                <Input
                  id="proxima_sesion"
                  name="proxima_sesion"
                  type="datetime-local"
                  defaultValue={proximaSesionFormateada}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" asChild>
                <Link href={`/sesiones/${id}`}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

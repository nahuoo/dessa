'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCita, updateCita } from '@/app/actions/citas';
import { getConsultantes } from '@/app/actions/consultantes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { decrypt } from '@/lib/utils/encryption';

export default function EditCitaPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string>('');
  const [consultantes, setConsultantes] = useState<any[]>([]);
  const [cita, setCita] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        const [citaResult, consultantesResult] = await Promise.all([
          getCita(id),
          getConsultantes(),
        ]);

        if (citaResult.error || !citaResult.data) {
          setError('No se pudo cargar la cita');
          return;
        }

        setCita(citaResult.data);
        setConsultantes(consultantesResult.data || []);
      } catch (err) {
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await updateCita(id, formData);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      router.push(`/agenda/${id}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (error && !cita) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
            <Button asChild className="mt-4">
              <Link href="/agenda">Volver a agenda</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cita) return null;

  // Formatear fecha para input datetime-local
  const fechaFormateada = new Date(cita.fecha_hora).toISOString().slice(0, 16);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Cita</h1>
          <p className="text-gray-600 mt-1">
            Modifica los detalles de la cita programada
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/agenda/${id}`}>Cancelar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Cita</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Consultante */}
            <div className="space-y-2">
              <Label htmlFor="consultante_id">
                Consultante <span className="text-red-500">*</span>
              </Label>
              <select
                id="consultante_id"
                name="consultante_id"
                defaultValue={cita.consultante_id}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Selecciona un consultante</option>
                {consultantes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {decrypt(c.nombre_completo)}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha y Hora */}
            <div className="space-y-2">
              <Label htmlFor="fecha_hora">
                Fecha y Hora <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fecha_hora"
                name="fecha_hora"
                type="datetime-local"
                defaultValue={fechaFormateada}
                required
              />
            </div>

            {/* Duración */}
            <div className="space-y-2">
              <Label htmlFor="duracion">
                Duración (minutos) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="duracion"
                name="duracion"
                type="number"
                min="15"
                max="300"
                step="15"
                defaultValue={cita.duracion}
                required
              />
            </div>

            {/* Modalidad */}
            <div className="space-y-2">
              <Label htmlFor="modalidad">
                Modalidad <span className="text-red-500">*</span>
              </Label>
              <select
                id="modalidad"
                name="modalidad"
                defaultValue={cita.modalidad}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="presencial">Presencial</option>
                <option value="videollamada">Videollamada</option>
                <option value="telefónica">Telefónica</option>
              </select>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="estado">
                Estado <span className="text-red-500">*</span>
              </Label>
              <select
                id="estado"
                name="estado"
                defaultValue={cita.estado}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="confirmada">Confirmada</option>
                <option value="pendiente">Pendiente</option>
                <option value="cancelada">Cancelada</option>
                <option value="completada">Completada</option>
              </select>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Textarea
                id="notas"
                name="notas"
                rows={4}
                defaultValue={cita.notas || ''}
                placeholder="Agregar notas sobre esta cita..."
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/agenda/${id}`}>Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createCita } from '@/app/actions/citas';
import { getConsultantes } from '@/app/actions/consultantes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function NuevaCitaPage() {
  const searchParams = useSearchParams();
  const consultanteIdParam = searchParams.get('consultante');
  const fechaParam = searchParams.get('fecha');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [consultantes, setConsultantes] = useState<any[]>([]);
  const [selectedConsultante, setSelectedConsultante] = useState(consultanteIdParam || '');

  useEffect(() => {
    async function loadConsultantes() {
      const { data } = await getConsultantes('activo');
      if (data) {
        setConsultantes(data);
      }
    }
    loadConsultantes();
  }, []);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await createCita(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  // Fecha y hora sugerida
  let dateStr: string;
  if (fechaParam) {
    // Si viene de calendario, usar esa fecha
    dateStr = fechaParam;
  } else {
    // Si no, próxima hora en punto
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    dateStr = nextHour.toISOString().slice(0, 16);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/agenda"
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
          Volver a agenda
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Programar Nueva Cita</CardTitle>
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
                  value={selectedConsultante}
                  onChange={(e) => setSelectedConsultante(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Seleccionar consultante...</option>
                  {consultantes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre_completo}
                    </option>
                  ))}
                </select>
                {consultantes.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    No tienes consultantes activos.{' '}
                    <Link href="/consultantes/nuevo" className="text-indigo-600 hover:underline">
                      Crear consultante
                    </Link>
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="fecha_hora">
                  Fecha y hora <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fecha_hora"
                  name="fecha_hora"
                  type="datetime-local"
                  required
                  defaultValue={dateStr}
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
                  min="15"
                  max="300"
                  defaultValue="50"
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
                  defaultValue="pendiente"
                  className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notas">Notas (opcional)</Label>
                <Textarea
                  id="notas"
                  name="notas"
                  rows={4}
                  className="mt-1"
                  placeholder="Información adicional sobre la cita..."
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" asChild>
                <Link href="/agenda">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={loading || consultantes.length === 0}>
                {loading ? 'Guardando...' : 'Programar cita'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tip */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Consejo</p>
            <p>
              Puedes crear una sesión directamente después de que la cita sea completada.
              Las citas confirmadas aparecerán en tu agenda y en el dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

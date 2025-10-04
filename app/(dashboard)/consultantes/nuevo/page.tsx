'use client';

import { useState } from 'react';
import { createConsultante } from '@/app/actions/consultantes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function NuevoConsultantePage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await createConsultante(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/consultantes"
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
          Volver a consultantes
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo Consultante</CardTitle>
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
                <Label htmlFor="nombre_completo">
                  Nombre completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre_completo"
                  name="nombre_completo"
                  type="text"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
                <Input
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <select
                  id="estado"
                  name="estado"
                  className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="motivo_consulta">Motivo de consulta</Label>
                <Textarea
                  id="motivo_consulta"
                  name="motivo_consulta"
                  rows={4}
                  className="mt-1"
                  placeholder="Describe brevemente el motivo de consulta..."
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="objetivos_terapeuticos">
                  Objetivos terapéuticos
                </Label>
                <Textarea
                  id="objetivos_terapeuticos"
                  name="objetivos_terapeuticos"
                  rows={4}
                  className="mt-1"
                  placeholder="Un objetivo por línea..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Escribe cada objetivo en una línea separada
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" asChild>
                <Link href="/consultantes">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar consultante'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

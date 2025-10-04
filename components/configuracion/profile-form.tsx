'use client';

import { useState } from 'react';
import { updateProfile } from '@/app/actions/profile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ProfileFormProps {
  profile: {
    nombre_completo: string;
    email?: string;
    numero_matricula?: string | null;
    telefono?: string | null;
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await updateProfile(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess('Perfil actualizado correctamente');
      setTimeout(() => setSuccess(null), 3000);
    }

    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="nombre_completo">Nombre completo *</Label>
          <Input
            id="nombre_completo"
            name="nombre_completo"
            type="text"
            required
            defaultValue={profile.nombre_completo}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={profile.email}
            disabled
            className="mt-1 bg-gray-50 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            El email no puede ser modificado
          </p>
        </div>

        <div>
          <Label htmlFor="numero_matricula">Número de matrícula</Label>
          <Input
            id="numero_matricula"
            name="numero_matricula"
            type="text"
            defaultValue={profile.numero_matricula || ''}
            placeholder="Ej: MN 12345"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            name="telefono"
            type="tel"
            defaultValue={profile.telefono || ''}
            placeholder="+54 9 11 1234-5678"
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}

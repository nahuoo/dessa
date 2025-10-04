'use client';

import { useState } from 'react';
import { updateNotificationPreferences } from '@/app/actions/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface NotificationSettingsProps {
  emailRecordatorios: boolean;
  horasAnticipacion: number;
}

export function NotificationSettings({
  emailRecordatorios: initialEmailRecordatorios,
  horasAnticipacion: initialHorasAnticipacion,
}: NotificationSettingsProps) {
  const [emailRecordatorios, setEmailRecordatorios] = useState(initialEmailRecordatorios);
  const [horasAnticipacion, setHorasAnticipacion] = useState(initialHorasAnticipacion);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('email_recordatorios', emailRecordatorios.toString());
    formData.append('horas_anticipacion', horasAnticipacion.toString());

    const result = await updateNotificationPreferences(formData);

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Preferencias actualizadas correctamente' });
    }

    setSaving(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificaciones</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Recordatorios */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="email_recordatorios" className="text-base">
                Recordatorios por email
              </Label>
              <p className="text-sm text-gray-600">
                Recibe recordatorios de tus citas programadas
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={emailRecordatorios}
              onClick={() => setEmailRecordatorios(!emailRecordatorios)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailRecordatorios ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailRecordatorios ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Horas de Anticipación */}
          {emailRecordatorios && (
            <div className="space-y-2">
              <Label htmlFor="horas_anticipacion">
                Enviar recordatorio con anticipación de:
              </Label>
              <select
                id="horas_anticipacion"
                value={horasAnticipacion}
                onChange={(e) => setHorasAnticipacion(parseInt(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={1}>1 hora antes</option>
                <option value={2}>2 horas antes</option>
                <option value={4}>4 horas antes</option>
                <option value={24}>24 horas antes</option>
                <option value={48}>48 horas antes</option>
              </select>
              <p className="text-sm text-gray-600">
                Recibirás un email recordándote de tus citas programadas
              </p>
            </div>
          )}

          {/* Mensajes */}
          {message && (
            <div
              className={`rounded-md p-4 ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          {/* Botón guardar */}
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Preferencias'}
          </Button>
        </form>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            ℹ️ Sobre los recordatorios
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Los recordatorios se envían solo para citas confirmadas</li>
            <li>• Puedes cambiar estas preferencias en cualquier momento</li>
            <li>• Los recordatorios se envían al email de tu cuenta</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

import { getProfile } from '@/app/actions/profile';
import { getNotificationPreferences } from '@/app/actions/notifications';
import { ProfileForm } from '@/components/configuracion/profile-form';
import { PasswordForm } from '@/components/configuracion/password-form';
import { NotificationSettings } from '@/components/configuracion/notification-settings';
import { Card } from '@/components/ui/card';

export default async function ConfiguracionPage() {
  const [{ data: profile, error }, notificationPrefs] = await Promise.all([
    getProfile(),
    getNotificationPreferences(),
  ]);

  if (error || !profile) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error cargando perfil</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-2">Gestiona tu información personal y preferencias</p>
      </div>

      {/* Información del perfil */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
          <p className="text-sm text-gray-600 mt-1">
            Actualiza tu información de contacto y profesional
          </p>
        </div>
        <ProfileForm profile={profile} />
      </Card>

      {/* Seguridad */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Seguridad</h2>
          <p className="text-sm text-gray-600 mt-1">Cambia tu contraseña</p>
        </div>
        <PasswordForm />
      </Card>

      {/* Notificaciones */}
      <NotificationSettings
        emailRecordatorios={notificationPrefs.data?.email_recordatorios ?? true}
        horasAnticipacion={notificationPrefs.data?.horas_anticipacion ?? 24}
      />

      {/* Información de la cuenta */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-indigo-900">Cuenta verificada</h3>
            <p className="text-sm text-indigo-700 mt-1">
              Tu cuenta está activa y todos los datos están cifrados de extremo a extremo.
            </p>
            <p className="text-xs text-indigo-600 mt-2">
              Email: <span className="font-medium">{profile.email}</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

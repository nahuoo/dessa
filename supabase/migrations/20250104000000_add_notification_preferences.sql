-- Agregar columnas de preferencias de notificación a la tabla profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_recordatorios BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS horas_anticipacion INTEGER DEFAULT 24;

-- Agregar columna para rastrear si se envió recordatorio en la tabla citas
ALTER TABLE citas
ADD COLUMN IF NOT EXISTS recordatorio_enviado BOOLEAN DEFAULT false;

-- Comentarios
COMMENT ON COLUMN profiles.email_recordatorios IS 'Indica si el usuario desea recibir recordatorios por email';
COMMENT ON COLUMN profiles.horas_anticipacion IS 'Horas de anticipación para enviar recordatorios (1, 2, 4, 24, 48)';
COMMENT ON COLUMN citas.recordatorio_enviado IS 'Indica si ya se envió un recordatorio para esta cita';

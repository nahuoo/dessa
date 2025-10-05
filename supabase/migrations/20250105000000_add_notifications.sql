-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'cita_proxima', 'tarea_pendiente', 'sistema'
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  link TEXT, -- URL opcional para navegar
  leida BOOLEAN DEFAULT false,
  metadata JSONB, -- Datos adicionales según el tipo
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para mejorar performance
CREATE INDEX idx_notificaciones_profesional ON notificaciones(profesional_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_created ON notificaciones(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Los profesionales solo ven sus notificaciones"
  ON notificaciones
  FOR SELECT
  USING (auth.uid() = profesional_id);

CREATE POLICY "Los profesionales pueden crear sus notificaciones"
  ON notificaciones
  FOR INSERT
  WITH CHECK (auth.uid() = profesional_id);

CREATE POLICY "Los profesionales pueden actualizar sus notificaciones"
  ON notificaciones
  FOR UPDATE
  USING (auth.uid() = profesional_id);

CREATE POLICY "Los profesionales pueden eliminar sus notificaciones"
  ON notificaciones
  FOR DELETE
  USING (auth.uid() = profesional_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_notificaciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notificaciones_updated_at
  BEFORE UPDATE ON notificaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_notificaciones_updated_at();

-- Función para crear notificación de cita próxima
CREATE OR REPLACE FUNCTION crear_notificacion_cita_proxima(
  p_profesional_id UUID,
  p_cita_id UUID,
  p_consultante_nombre TEXT,
  p_fecha_hora TIMESTAMPTZ
) RETURNS UUID AS $$
DECLARE
  v_notif_id UUID;
BEGIN
  INSERT INTO notificaciones (
    profesional_id,
    tipo,
    titulo,
    mensaje,
    link,
    metadata
  ) VALUES (
    p_profesional_id,
    'cita_proxima',
    'Cita próxima',
    'Tienes una cita con ' || p_consultante_nombre || ' programada para ' ||
    to_char(p_fecha_hora, 'DD/MM/YYYY a las HH24:MI'),
    '/agenda/' || p_cita_id,
    jsonb_build_object(
      'cita_id', p_cita_id,
      'consultante_nombre', p_consultante_nombre,
      'fecha_hora', p_fecha_hora
    )
  ) RETURNING id INTO v_notif_id;

  RETURN v_notif_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios
COMMENT ON TABLE notificaciones IS 'Notificaciones in-app para profesionales';
COMMENT ON COLUMN notificaciones.tipo IS 'Tipo de notificación: cita_proxima, tarea_pendiente, sistema';
COMMENT ON COLUMN notificaciones.leida IS 'Indica si el usuario ya leyó la notificación';
COMMENT ON COLUMN notificaciones.link IS 'URL opcional para navegar al hacer clic';
COMMENT ON COLUMN notificaciones.metadata IS 'Datos adicionales en formato JSON según el tipo de notificación';

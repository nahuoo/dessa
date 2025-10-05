-- Aplicar solo las tablas del asistente (standalone)

-- Tabla de configuración del asistente
CREATE TABLE IF NOT EXISTS assistant_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Personalidad del asistente
  nombre TEXT NOT NULL DEFAULT 'Dessa',
  personalidad TEXT NOT NULL DEFAULT 'profesional_empatico',
  tono TEXT NOT NULL DEFAULT 'formal_cercano',

  -- Preferencias aprendidas
  preferencias JSONB DEFAULT '{
    "idioma": "es",
    "formato_fechas": "DD/MM/YYYY",
    "canal_comunicacion_preferido": null,
    "horario_trabajo_inicio": "09:00",
    "horario_trabajo_fin": "18:00",
    "resumen_sesion_automatico": true,
    "sugerencias_proactivas": true
  }'::jsonb,

  -- Estado del asistente
  activo BOOLEAN DEFAULT true,
  modo TEXT DEFAULT 'asistente', -- 'asistente', 'observador', 'silencioso'

  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Un profesional solo puede tener una configuración
  UNIQUE(profesional_id)
);

-- Tabla de memoria/conversaciones del asistente
CREATE TABLE IF NOT EXISTS assistant_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Contexto de la memoria
  tipo TEXT NOT NULL, -- 'conversacion', 'aprendizaje', 'accion', 'nota'
  contexto JSONB DEFAULT '{}'::jsonb, -- {pagina, consultante_id, sesion_id, etc}

  -- Contenido
  prompt TEXT, -- Lo que el usuario dijo/hizo
  respuesta TEXT, -- Lo que el asistente respondió
  metadata JSONB DEFAULT '{}'::jsonb, -- Datos adicionales

  -- Para aprendizajes
  preferencia_aprendida TEXT, -- Nombre de la preferencia
  valor_aprendido TEXT, -- Valor de la preferencia

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Índices para búsquedas rápidas
  CHECK (tipo IN ('conversacion', 'aprendizaje', 'accion', 'nota'))
);

-- Tabla de acciones pendientes del asistente
CREATE TABLE IF NOT EXISTS assistant_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tipo de acción
  tipo_accion TEXT NOT NULL, -- 'recordatorio', 'busqueda', 'organizacion', 'sugerencia'
  estado TEXT DEFAULT 'pendiente', -- 'pendiente', 'completada', 'cancelada', 'fallida'

  -- Detalles de la acción
  titulo TEXT NOT NULL,
  descripcion TEXT,
  datos_accion JSONB DEFAULT '{}'::jsonb,

  -- Prioridad y timing
  prioridad INT DEFAULT 3, -- 1 (baja) a 5 (crítica)
  ejecutar_en TIMESTAMPTZ, -- Cuando ejecutar la acción
  completada_en TIMESTAMPTZ,

  -- Resultado
  resultado TEXT,
  error TEXT,

  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (tipo_accion IN ('recordatorio', 'busqueda', 'organizacion', 'sugerencia', 'email', 'nota')),
  CHECK (estado IN ('pendiente', 'completada', 'cancelada', 'fallida')),
  CHECK (prioridad BETWEEN 1 AND 5)
);

-- Tabla de sugerencias proactivas
CREATE TABLE IF NOT EXISTS assistant_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tipo de sugerencia
  tipo TEXT NOT NULL, -- 'insight', 'accion', 'mejora', 'recordatorio'
  categoria TEXT, -- 'consultante', 'sesion', 'agenda', 'organizacion'

  -- Contenido
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  datos JSONB DEFAULT '{}'::jsonb,

  -- Estado
  estado TEXT DEFAULT 'nueva', -- 'nueva', 'vista', 'aceptada', 'rechazada', 'pospuesta'
  vista_en TIMESTAMPTZ,
  resuelta_en TIMESTAMPTZ,

  -- Relevancia (calculada por IA)
  relevancia INT DEFAULT 3, -- 1 (baja) a 5 (alta)

  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Algunas sugerencias pueden expirar

  CHECK (tipo IN ('insight', 'accion', 'mejora', 'recordatorio')),
  CHECK (estado IN ('nueva', 'vista', 'aceptada', 'rechazada', 'pospuesta')),
  CHECK (relevancia BETWEEN 1 AND 5)
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_assistant_memory_profesional ON assistant_memory(profesional_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistant_memory_tipo ON assistant_memory(tipo, profesional_id);
CREATE INDEX IF NOT EXISTS idx_assistant_actions_profesional ON assistant_actions(profesional_id, estado, ejecutar_en);
CREATE INDEX IF NOT EXISTS idx_assistant_suggestions_profesional ON assistant_suggestions(profesional_id, estado, relevancia DESC);

-- Row Level Security
ALTER TABLE assistant_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_suggestions ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para assistant_config
DROP POLICY IF EXISTS "Usuarios pueden ver su propia configuración" ON assistant_config;
CREATE POLICY "Usuarios pueden ver su propia configuración"
  ON assistant_config FOR SELECT
  USING (auth.uid() = profesional_id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar su propia configuración" ON assistant_config;
CREATE POLICY "Usuarios pueden actualizar su propia configuración"
  ON assistant_config FOR UPDATE
  USING (auth.uid() = profesional_id);

DROP POLICY IF EXISTS "Usuarios pueden crear su configuración" ON assistant_config;
CREATE POLICY "Usuarios pueden crear su configuración"
  ON assistant_config FOR INSERT
  WITH CHECK (auth.uid() = profesional_id);

-- Políticas de seguridad para assistant_memory
DROP POLICY IF EXISTS "Usuarios pueden ver su propia memoria" ON assistant_memory;
CREATE POLICY "Usuarios pueden ver su propia memoria"
  ON assistant_memory FOR SELECT
  USING (auth.uid() = profesional_id);

DROP POLICY IF EXISTS "Usuarios pueden crear memoria" ON assistant_memory;
CREATE POLICY "Usuarios pueden crear memoria"
  ON assistant_memory FOR INSERT
  WITH CHECK (auth.uid() = profesional_id);

-- Políticas de seguridad para assistant_actions
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias acciones" ON assistant_actions;
CREATE POLICY "Usuarios pueden ver sus propias acciones"
  ON assistant_actions FOR SELECT
  USING (auth.uid() = profesional_id);

DROP POLICY IF EXISTS "Usuarios pueden crear acciones" ON assistant_actions;
CREATE POLICY "Usuarios pueden crear acciones"
  ON assistant_actions FOR INSERT
  WITH CHECK (auth.uid() = profesional_id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar sus acciones" ON assistant_actions;
CREATE POLICY "Usuarios pueden actualizar sus acciones"
  ON assistant_actions FOR UPDATE
  USING (auth.uid() = profesional_id);

-- Políticas de seguridad para assistant_suggestions
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias sugerencias" ON assistant_suggestions;
CREATE POLICY "Usuarios pueden ver sus propias sugerencias"
  ON assistant_suggestions FOR SELECT
  USING (auth.uid() = profesional_id);

DROP POLICY IF EXISTS "Usuarios pueden crear sugerencias" ON assistant_suggestions;
CREATE POLICY "Usuarios pueden crear sugerencias"
  ON assistant_suggestions FOR INSERT
  WITH CHECK (auth.uid() = profesional_id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar sus sugerencias" ON assistant_suggestions;
CREATE POLICY "Usuarios pueden actualizar sus sugerencias"
  ON assistant_suggestions FOR UPDATE
  USING (auth.uid() = profesional_id);

-- Función para inicializar configuración del asistente
CREATE OR REPLACE FUNCTION inicializar_asistente_config()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO assistant_config (profesional_id)
  VALUES (NEW.id)
  ON CONFLICT (profesional_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear configuración automáticamente al crear un usuario
DROP TRIGGER IF EXISTS trigger_inicializar_asistente ON auth.users;
CREATE TRIGGER trigger_inicializar_asistente
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION inicializar_asistente_config();

-- Función para limpiar memoria antigua (mantener últimos 90 días)
CREATE OR REPLACE FUNCTION limpiar_memoria_antigua()
RETURNS void AS $$
BEGIN
  DELETE FROM assistant_memory
  WHERE created_at < NOW() - INTERVAL '90 days'
  AND tipo NOT IN ('aprendizaje'); -- Conservar aprendizajes siempre
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios para documentación
COMMENT ON TABLE assistant_config IS 'Configuración y personalidad del asistente virtual de cada profesional';
COMMENT ON TABLE assistant_memory IS 'Memoria de conversaciones y aprendizajes del asistente';
COMMENT ON TABLE assistant_actions IS 'Acciones pendientes y completadas del asistente';
COMMENT ON TABLE assistant_suggestions IS 'Sugerencias proactivas generadas por el asistente';

# Sistema de Asistente Virtual Proactivo - Dessa

## 🎯 Descripción

Sistema de asistente virtual inteligente con personalidad propia, inspirado en JARVIS, que puede actuar proactivamente para ayudar a profesionales de salud mental en su práctica diaria.

## ✨ Características Principales

### 1. **Personalidad y Configuración**
- Nombre personalizable (por defecto: "Dessa")
- Múltiples personalidades: profesional empático, casual amigable, formal técnico, mentor experimentado
- Tonos ajustables: formal cercano, casual, profesional estricto, empático personal
- Modos de operación: asistente activo, observador, silencioso

### 2. **Awareness Contextual**
- Detección automática de la página actual del usuario
- Extracción de IDs relevantes (consultante, sesión, cita) desde la URL
- Contexto enriquecido en cada conversación
- Memoria de interacciones previas

### 3. **Capacidades Proactivas**

#### Detección Automática de Acciones
- **Recordatorios**: Detecta cuando necesitas recordar algo
- **Búsquedas**: Identifica búsquedas que pueda realizar
- **Notas**: Toma notas automáticamente cuando lo necesitas

#### Sugerencias Inteligentes
- Insights sobre consultantes
- Recomendaciones de acciones
- Mejoras en el workflow
- Recordatorios contextuales

### 4. **Memoria y Aprendizaje**
- Almacena todas las conversaciones
- Aprende preferencias del usuario
- Retiene aprendizajes permanentemente
- Limpieza automática de memoria antigua (90 días para conversaciones)

### 5. **Interfaz de Chat Flotante**
- Botón flotante siempre visible en el dashboard
- Panel de chat expandible/minimizable
- Mensajes en tiempo real
- Indicador de contexto actual
- Auto-scroll y animaciones

## 🗄️ Arquitectura de Base de Datos

### Tablas Creadas

#### `assistant_config`
Configuración y personalidad del asistente por profesional.

```sql
- id: UUID
- profesional_id: UUID
- nombre: TEXT (default: 'Dessa')
- personalidad: TEXT
- tono: TEXT
- preferencias: JSONB
- activo: BOOLEAN
- modo: TEXT
- created_at, updated_at: TIMESTAMPTZ
```

#### `assistant_memory`
Memoria de conversaciones y aprendizajes.

```sql
- id: UUID
- profesional_id: UUID
- tipo: TEXT ('conversacion', 'aprendizaje', 'accion', 'nota')
- contexto: JSONB
- prompt: TEXT
- respuesta: TEXT
- metadata: JSONB
- preferencia_aprendida: TEXT
- valor_aprendido: TEXT
- created_at: TIMESTAMPTZ
```

#### `assistant_actions`
Acciones pendientes y completadas del asistente.

```sql
- id: UUID
- profesional_id: UUID
- tipo_accion: TEXT ('recordatorio', 'busqueda', 'organizacion', etc.)
- estado: TEXT ('pendiente', 'completada', 'cancelada', 'fallida')
- titulo: TEXT
- descripcion: TEXT
- datos_accion: JSONB
- prioridad: INT (1-5)
- ejecutar_en: TIMESTAMPTZ
- completada_en: TIMESTAMPTZ
- resultado: TEXT
- error: TEXT
- created_at, updated_at: TIMESTAMPTZ
```

#### `assistant_suggestions`
Sugerencias proactivas generadas por el asistente.

```sql
- id: UUID
- profesional_id: UUID
- tipo: TEXT ('insight', 'accion', 'mejora', 'recordatorio')
- categoria: TEXT ('consultante', 'sesion', 'agenda', 'organizacion')
- titulo: TEXT
- descripcion: TEXT
- datos: JSONB
- estado: TEXT ('nueva', 'vista', 'aceptada', 'rechazada', 'pospuesta')
- vista_en: TIMESTAMPTZ
- resuelta_en: TIMESTAMPTZ
- relevancia: INT (1-5)
- created_at: TIMESTAMPTZ
- expires_at: TIMESTAMPTZ
```

### Seguridad (RLS)

Todas las tablas tienen Row Level Security habilitado con políticas que aseguran que:
- Los usuarios solo pueden ver sus propios datos
- Los usuarios solo pueden crear/modificar sus propios registros
- Políticas separadas para SELECT, INSERT, UPDATE

### Funciones y Triggers

#### `inicializar_asistente_config()`
- Crea automáticamente la configuración del asistente cuando se registra un nuevo usuario
- Trigger: `trigger_inicializar_asistente` en `auth.users`

#### `limpiar_memoria_antigua()`
- Limpia conversaciones antiguas (>90 días)
- Preserva aprendizajes permanentemente
- Se puede ejecutar manualmente o programar con pg_cron

## 📁 Estructura de Archivos

```
components/assistant/
  └── floating-assistant.tsx    # Componente UI del asistente flotante

app/api/assistant/
  └── chat/route.ts             # API endpoint para chat con IA

types/
  └── assistant.ts              # Tipos TypeScript del sistema

lib/ai/
  └── insights.ts               # Funciones de generación de insights

supabase/migrations/
  └── 20250105130000_apply_assistant_only.sql  # Migración de BD
```

## 🚀 Uso

### En el Dashboard

El asistente aparece automáticamente en todas las páginas del dashboard como un botón flotante en la esquina inferior derecha.

### Integración con IA

El sistema usa:
- **Model**: DeepSeek (vía OpenRouter)
- **Temperature**: 0.8 para personalidad natural
- **Context**: Incluye historial de mensajes (últimos 10) y contexto de página actual

### Personalización del Prompt del Sistema

El prompt está definido en `app/api/assistant/chat/route.ts`:

```typescript
const ASSISTANT_SYSTEM_PROMPT = `Eres Dessa, un asistente virtual inteligente y proactivo...`
```

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
OPENROUTER_API_KEY=your_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Preferencias por Defecto

```json
{
  "idioma": "es",
  "formato_fechas": "DD/MM/YYYY",
  "canal_comunicacion_preferido": null,
  "horario_trabajo_inicio": "09:00",
  "horario_trabajo_fin": "18:00",
  "resumen_sesion_automatico": true,
  "sugerencias_proactivas": true
}
```

## 🎨 Personalización

### Cambiar el Nombre del Asistente

En `app/(dashboard)/layout.tsx`:

```tsx
<FloatingAssistant profesionalId={user.id} nombreAsistente="TuNombre" />
```

### Modificar Personalidad

Actualizar registro en `assistant_config`:

```sql
UPDATE assistant_config
SET personalidad = 'casual_amigable',
    tono = 'casual'
WHERE profesional_id = 'user_id';
```

## 📊 Monitoreo y Métricas

### Ver Conversaciones Recientes

```sql
SELECT * FROM assistant_memory
WHERE profesional_id = 'user_id'
  AND tipo = 'conversacion'
ORDER BY created_at DESC
LIMIT 10;
```

### Ver Acciones Pendientes

```sql
SELECT * FROM assistant_actions
WHERE profesional_id = 'user_id'
  AND estado = 'pendiente'
ORDER BY prioridad DESC, ejecutar_en ASC;
```

### Ver Sugerencias Activas

```sql
SELECT * FROM assistant_suggestions
WHERE profesional_id = 'user_id'
  AND estado = 'nueva'
ORDER BY relevancia DESC;
```

## 🔮 Roadmap Futuro

### Próximas Funcionalidades
- [ ] Ejecución automática de acciones detectadas
- [ ] Panel de sugerencias proactivas en UI
- [ ] Integración con videollamadas para tomar notas
- [ ] Sistema de aprendizaje de preferencias
- [ ] Reportes y análisis generados por IA
- [ ] Comandos de voz
- [ ] Integración con calendario externo
- [ ] Notificaciones push del asistente

### Mejoras Técnicas
- [ ] Streaming de respuestas (SSE)
- [ ] Cache de conversaciones frecuentes
- [ ] Embeddings para búsqueda semántica
- [ ] Fine-tuning del modelo específico para salud mental
- [ ] Analytics de uso del asistente

## 🐛 Troubleshooting

### El asistente no responde
1. Verificar que OPENROUTER_API_KEY esté configurada
2. Revisar logs del servidor: `console.log` en `/api/assistant/chat`
3. Verificar que las tablas estén creadas en Supabase

### Errores de permisos
1. Verificar que RLS esté habilitado
2. Confirmar que las políticas estén creadas
3. Verificar `auth.uid()` del usuario

### Contexto no se detecta
1. Verificar que la URL siga el patrón `/consultantes/[id]`
2. Revisar `useEffect` en `floating-assistant.tsx`
3. Comprobar que `window.location.pathname` esté disponible

## 📝 Notas de Implementación

- Sistema implementado el 2025-01-05
- Build exitoso sin errores de TypeScript
- Migración de base de datos aplicada correctamente
- Compatible con Next.js 15, React 19, ai-sdk v5
- Usa Edge Runtime para óptimo performance

---

**Desarrollado con ❤️ usando Claude Code**

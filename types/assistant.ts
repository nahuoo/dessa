/**
 * Tipos para el Sistema de Asistente Virtual Proactivo
 */

export type PersonalidadAsistente =
  | 'profesional_empatico'
  | 'casual_amigable'
  | 'formal_tecnico'
  | 'mentor_experimentado';

export type TonoAsistente =
  | 'formal_cercano'
  | 'casual'
  | 'profesional_estricto'
  | 'empatico_personal';

export type ModoAsistente = 'asistente' | 'observador' | 'silencioso';

export interface PreferenciasAsistente {
  idioma: string;
  formato_fechas: string;
  canal_comunicacion_preferido?: 'email' | 'whatsapp' | 'sms' | null;
  horario_trabajo_inicio: string;
  horario_trabajo_fin: string;
  resumen_sesion_automatico: boolean;
  sugerencias_proactivas: boolean;
  [key: string]: unknown;
}

export interface AssistantConfig {
  id: string;
  profesional_id: string;
  nombre: string;
  personalidad: PersonalidadAsistente;
  tono: TonoAsistente;
  preferencias: PreferenciasAsistente;
  activo: boolean;
  modo: ModoAsistente;
  created_at: string;
  updated_at: string;
}

export type TipoMemoria = 'conversacion' | 'aprendizaje' | 'accion' | 'nota';

export interface AssistantMemory {
  id: string;
  profesional_id: string;
  tipo: TipoMemoria;
  contexto: Record<string, unknown>;
  prompt?: string;
  respuesta?: string;
  metadata: Record<string, unknown>;
  preferencia_aprendida?: string;
  valor_aprendido?: string;
  created_at: string;
}

export type TipoAccion =
  | 'recordatorio'
  | 'busqueda'
  | 'organizacion'
  | 'sugerencia'
  | 'email'
  | 'nota';

export type EstadoAccion = 'pendiente' | 'completada' | 'cancelada' | 'fallida';

export interface AssistantAction {
  id: string;
  profesional_id: string;
  tipo_accion: TipoAccion;
  estado: EstadoAccion;
  titulo: string;
  descripcion?: string;
  datos_accion: Record<string, unknown>;
  prioridad: 1 | 2 | 3 | 4 | 5;
  ejecutar_en?: string;
  completada_en?: string;
  resultado?: string;
  error?: string;
  created_at: string;
  updated_at: string;
}

export type TipoSugerencia = 'insight' | 'accion' | 'mejora' | 'recordatorio';
export type CategoriaSugerencia = 'consultante' | 'sesion' | 'agenda' | 'organizacion';
export type EstadoSugerencia = 'nueva' | 'vista' | 'aceptada' | 'rechazada' | 'pospuesta';

export interface AssistantSuggestion {
  id: string;
  profesional_id: string;
  tipo: TipoSugerencia;
  categoria?: CategoriaSugerencia;
  titulo: string;
  descripcion: string;
  datos: Record<string, unknown>;
  estado: EstadoSugerencia;
  vista_en?: string;
  resuelta_en?: string;
  relevancia: 1 | 2 | 3 | 4 | 5;
  created_at: string;
  expires_at?: string;
}

// Contexto de awareness - qué está haciendo el usuario
export interface ContextoAwareness {
  pagina: string; // '/dashboard', '/consultantes/123', etc
  consultante_id?: string;
  sesion_id?: string;
  cita_id?: string;
  accion_actual?: 'leyendo' | 'editando' | 'creando' | 'navegando';
  timestamp: string;
}

// Mensaje del chat con el asistente
export interface MensajeAsistente {
  id: string;
  rol: 'usuario' | 'asistente' | 'sistema';
  contenido: string;
  timestamp: string;
  metadata?: {
    accion_ejecutada?: string;
    sugerencia_id?: string;
    contexto?: ContextoAwareness;
  };
}

// Estado del chat del asistente
export interface EstadoChatAsistente {
  abierto: boolean;
  minimizado: boolean;
  mensajes: MensajeAsistente[];
  escribiendo: boolean;
  contexto_actual?: ContextoAwareness;
}

// Capacidades del asistente
export interface CapacidadesAsistente {
  puede_buscar: boolean;
  puede_crear_recordatorios: boolean;
  puede_enviar_emails: boolean;
  puede_organizar_datos: boolean;
  puede_generar_reportes: boolean;
  puede_tomar_notas: boolean;
}

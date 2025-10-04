import type { Database } from './database';

export type Sesion = Database['public']['Tables']['sesiones']['Row'];
export type SesionInsert = Database['public']['Tables']['sesiones']['Insert'];
export type SesionUpdate = Database['public']['Tables']['sesiones']['Update'];

export type ModalidadSesion = 'presencial' | 'videollamada' | 'telefónica';
export type EstadoSesion = 'programada' | 'completada' | 'cancelada';

/**
 * Sesión con datos descifrados
 */
export interface SesionDecrypted extends Omit<Sesion, 'notas'> {
  notas: string | null;
}

/**
 * Datos para crear una nueva sesión
 */
export interface CreateSesionData {
  consultante_id: string;
  fecha: Date;
  duracion: number;
  modalidad: ModalidadSesion;
  notas?: string;
  objetivos_trabajados?: string[];
  tareas_asignadas?: string;
  proxima_sesion?: Date | null;
  estado?: EstadoSesion;
}

/**
 * Datos para actualizar una sesión
 */
export interface UpdateSesionData extends Partial<CreateSesionData> {
  id: string;
}

/**
 * Contexto del consultante para el asistente de IA
 */
export interface ConsultanteContext {
  nombre: string;
  motivo_consulta?: string;
  objetivos_terapeuticos?: string[];
  sesiones_previas?: number;
  ultima_sesion?: Date;
}

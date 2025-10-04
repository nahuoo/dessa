import type { Database } from './database';

export type Consultante = Database['public']['Tables']['consultantes']['Row'];
export type ConsultanteInsert = Database['public']['Tables']['consultantes']['Insert'];
export type ConsultanteUpdate = Database['public']['Tables']['consultantes']['Update'];

export type EstadoConsultante = 'activo' | 'inactivo' | 'alta';

/**
 * Consultante con datos descifrados (para uso en la aplicación)
 */
export interface ConsultanteDecrypted extends Omit<Consultante, 'nombre_completo' | 'email' | 'telefono' | 'motivo_consulta'> {
  nombre_completo: string;
  email: string | null;
  telefono: string | null;
  motivo_consulta: string | null;
}

/**
 * Datos para crear un nuevo consultante
 */
export interface CreateConsultanteData {
  nombre_completo: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: Date | null;
  motivo_consulta?: string;
  objetivos_terapeuticos?: string[];
  estado?: EstadoConsultante;
}

/**
 * Datos para actualizar un consultante
 */
export interface UpdateConsultanteData extends Partial<CreateConsultanteData> {
  id: string;
}

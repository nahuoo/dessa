import { z } from 'zod';

/**
 * Schemas de validación con Zod para el proyecto
 */

// Validación de email
export const emailSchema = z
  .string()
  .email('Email inválido')
  .optional()
  .or(z.literal(''));

// Validación de teléfono (formato flexible)
export const phoneSchema = z
  .string()
  .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Teléfono inválido')
  .optional()
  .or(z.literal(''));

// Schema para crear/actualizar consultante
export const consultanteSchema = z.object({
  nombre_completo: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: emailSchema,
  telefono: phoneSchema,
  fecha_nacimiento: z.coerce.date().optional().nullable(),
  motivo_consulta: z.string().optional(),
  objetivos_terapeuticos: z.array(z.string()).default([]),
  estado: z.enum(['activo', 'inactivo', 'alta']).default('activo'),
});

export const updateConsultanteSchema = consultanteSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
});

// Schema para crear/actualizar sesión
export const sesionSchema = z.object({
  consultante_id: z.string().uuid('ID de consultante inválido'),
  fecha: z.coerce.date(),
  duracion: z.number().min(1, 'La duración debe ser al menos 1 minuto').max(300, 'La duración no puede exceder 300 minutos'),
  modalidad: z.enum(['presencial', 'videollamada', 'telefónica']),
  notas: z.string().optional(),
  objetivos_trabajados: z.array(z.string()).default([]),
  tareas_asignadas: z.string().optional(),
  proxima_sesion: z.coerce.date().optional().nullable(),
  estado: z.enum(['programada', 'completada', 'cancelada']).default('completada'),
});

export const updateSesionSchema = sesionSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
});

// Schema para crear/actualizar cita
export const citaSchema = z.object({
  consultante_id: z.string().uuid('ID de consultante inválido'),
  fecha_hora: z.coerce.date(),
  duracion: z.number().min(1).max(300),
  modalidad: z.enum(['presencial', 'videollamada', 'telefónica']),
  estado: z.enum(['confirmada', 'pendiente', 'cancelada']).default('pendiente'),
  notas: z.string().optional(),
});

export const updateCitaSchema = citaSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
});

// Schema para perfil de profesional
export const profileSchema = z.object({
  nombre_completo: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  especialidad: z.array(z.string()).optional(),
  numero_matricula: z.string().optional(),
  telefono: phoneSchema,
});

// Schema para autenticación
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const registerSchema = loginSchema.extend({
  nombre_completo: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
});

// Tipos inferidos de los schemas
export type ConsultanteInput = z.infer<typeof consultanteSchema>;
export type UpdateConsultanteInput = z.infer<typeof updateConsultanteSchema>;
export type SesionInput = z.infer<typeof sesionSchema>;
export type UpdateSesionInput = z.infer<typeof updateSesionSchema>;
export type CitaInput = z.infer<typeof citaSchema>;
export type UpdateCitaInput = z.infer<typeof updateCitaSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

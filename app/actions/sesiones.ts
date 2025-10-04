'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { sesionSchema, updateSesionSchema } from '@/lib/utils/validators';
import { encrypt, decrypt } from '@/lib/utils/encryption';

/**
 * Server Actions para gestión de sesiones
 * Las notas se cifran antes de guardarse en la BD
 */

export async function createSesion(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  // Convertir FormData a objeto
  const rawData = {
    consultante_id: formData.get('consultante_id') as string,
    fecha: formData.get('fecha') as string,
    duracion: parseInt(formData.get('duracion') as string),
    modalidad: formData.get('modalidad') as string,
    notas: formData.get('notas') as string,
    objetivos_trabajados: formData.get('objetivos_trabajados')
      ? (formData.get('objetivos_trabajados') as string).split('\n').filter(Boolean)
      : [],
    tareas_asignadas: formData.get('tareas_asignadas') as string,
    proxima_sesion: formData.get('proxima_sesion') as string,
    estado: (formData.get('estado') as string) || 'completada',
  };

  // Validar con Zod
  const validatedFields = sesionSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const errors = validatedFields.error.errors.map((err) => err.message).join(', ');
    return { error: errors };
  }

  const data = validatedFields.data;

  // Verificar que el consultante pertenece al profesional
  const { data: consultante } = await supabase
    .from('consultantes')
    .select('id')
    .eq('id', data.consultante_id)
    .eq('profesional_id', user.id)
    .single();

  if (!consultante) {
    return { error: 'Consultante no encontrado' };
  }

  // Cifrar notas
  const encryptedData = {
    consultante_id: data.consultante_id,
    fecha: new Date(data.fecha).toISOString(),
    duracion: data.duracion,
    modalidad: data.modalidad,
    notas: data.notas ? encrypt(data.notas) : null,
    objetivos_trabajados: data.objetivos_trabajados,
    tareas_asignadas: data.tareas_asignadas || null,
    proxima_sesion: data.proxima_sesion ? new Date(data.proxima_sesion).toISOString() : null,
    estado: data.estado,
  };

  const { error } = await supabase
    .from('sesiones')
    .insert(encryptedData)
    .select()
    .single();

  if (error) {
    console.error('Error al crear sesión:', error);
    return { error: 'Error al crear la sesión' };
  }

  revalidatePath('/sesiones');
  revalidatePath(`/consultantes/${data.consultante_id}`);
  redirect('/sesiones');
}

export async function updateSesion(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  const id = formData.get('id') as string;

  const rawData = {
    id,
    consultante_id: formData.get('consultante_id') as string,
    fecha: formData.get('fecha') as string,
    duracion: parseInt(formData.get('duracion') as string),
    modalidad: formData.get('modalidad') as string,
    notas: formData.get('notas') as string,
    objetivos_trabajados: formData.get('objetivos_trabajados')
      ? (formData.get('objetivos_trabajados') as string).split('\n').filter(Boolean)
      : [],
    tareas_asignadas: formData.get('tareas_asignadas') as string,
    proxima_sesion: formData.get('proxima_sesion') as string,
    estado: (formData.get('estado') as string) || 'completada',
  };

  const validatedFields = updateSesionSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const errors = validatedFields.error.errors.map((err) => err.message).join(', ');
    return { error: errors };
  }

  const { id: sesionId, ...data } = validatedFields.data;

  // Cifrar notas
  const encryptedData = {
    fecha: data.fecha ? new Date(data.fecha).toISOString() : undefined,
    duracion: data.duracion,
    modalidad: data.modalidad,
    notas: data.notas ? encrypt(data.notas) : undefined,
    objetivos_trabajados: data.objetivos_trabajados,
    tareas_asignadas: data.tareas_asignadas,
    proxima_sesion: data.proxima_sesion ? new Date(data.proxima_sesion).toISOString() : undefined,
    estado: data.estado,
  };

  const { error } = await supabase
    .from('sesiones')
    .update(encryptedData)
    .eq('id', sesionId)
    .eq('consultantes.profesional_id', user.id);

  if (error) {
    console.error('Error al actualizar sesión:', error);
    return { error: 'Error al actualizar la sesión' };
  }

  revalidatePath('/sesiones');
  revalidatePath(`/sesiones/${sesionId}`);
  redirect(`/sesiones/${sesionId}`);
}

export async function deleteSesion(sesionId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  const { error } = await supabase
    .from('sesiones')
    .delete()
    .eq('id', sesionId);

  if (error) {
    console.error('Error al eliminar sesión:', error);
    return { error: 'Error al eliminar la sesión' };
  }

  revalidatePath('/sesiones');
  redirect('/sesiones');
}

/**
 * Obtener sesión por ID con datos descifrados
 */
export async function getSesion(sesionId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado', data: null };
  }

  const { data, error } = await supabase
    .from('sesiones')
    .select('*, consultantes(*)')
    .eq('id', sesionId)
    .single();

  if (error || !data) {
    return { error: 'Sesión no encontrada', data: null };
  }

  // Descifrar notas
  const decrypted = {
    ...data,
    notas: data.notas ? decrypt(data.notas) : null,
  };

  return { data: decrypted, error: null };
}

/**
 * Obtener todas las sesiones con datos descifrados
 */
export async function getSesiones(consultanteId?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado', data: null };
  }

  let query = supabase
    .from('sesiones')
    .select('*, consultantes(*)')
    .eq('consultantes.profesional_id', user.id)
    .order('fecha', { ascending: false });

  if (consultanteId) {
    query = query.eq('consultante_id', consultanteId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: 'Error al obtener sesiones', data: null };
  }

  // Descifrar notas de todas las sesiones
  const decrypted = data?.map((sesion) => ({
    ...sesion,
    notas: sesion.notas ? decrypt(sesion.notas) : null,
  }));

  return { data: decrypted, error: null };
}

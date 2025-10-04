'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { consultanteSchema, updateConsultanteSchema } from '@/lib/utils/validators';
import { encrypt, decrypt, encryptObject, decryptObject } from '@/lib/utils/encryption';

/**
 * Server Actions para gestión de consultantes
 * Todos los datos sensibles se cifran antes de guardarse en la BD
 */

const SENSITIVE_FIELDS = ['nombre_completo', 'email', 'telefono', 'motivo_consulta'] as const;

export async function createConsultante(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  // Convertir FormData a objeto
  const rawData = {
    nombre_completo: formData.get('nombre_completo') as string,
    email: formData.get('email') as string,
    telefono: formData.get('telefono') as string,
    fecha_nacimiento: formData.get('fecha_nacimiento') as string,
    motivo_consulta: formData.get('motivo_consulta') as string,
    objetivos_terapeuticos: formData.get('objetivos_terapeuticos')
      ? (formData.get('objetivos_terapeuticos') as string).split('\n').filter(Boolean)
      : [],
    estado: (formData.get('estado') as string) || 'activo',
  };

  // Validar con Zod
  const validatedFields = consultanteSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const errors = validatedFields.error.errors.map((err) => err.message).join(', ');
    return { error: errors };
  }

  const data = validatedFields.data;

  // Cifrar campos sensibles
  const encryptedData = {
    profesional_id: user.id,
    nombre_completo: encrypt(data.nombre_completo),
    email: data.email ? encrypt(data.email) : null,
    telefono: data.telefono ? encrypt(data.telefono) : null,
    fecha_nacimiento: data.fecha_nacimiento || null,
    motivo_consulta: data.motivo_consulta ? encrypt(data.motivo_consulta) : null,
    objetivos_terapeuticos: data.objetivos_terapeuticos,
    estado: data.estado,
  };

  const { data: consultante, error } = await supabase
    .from('consultantes')
    .insert(encryptedData)
    .select()
    .single();

  if (error) {
    console.error('Error al crear consultante:', error);
    return { error: 'Error al crear el consultante' };
  }

  revalidatePath('/consultantes');
  redirect('/consultantes');
}

export async function updateConsultante(formData: FormData) {
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
    nombre_completo: formData.get('nombre_completo') as string,
    email: formData.get('email') as string,
    telefono: formData.get('telefono') as string,
    fecha_nacimiento: formData.get('fecha_nacimiento') as string,
    motivo_consulta: formData.get('motivo_consulta') as string,
    objetivos_terapeuticos: formData.get('objetivos_terapeuticos')
      ? (formData.get('objetivos_terapeuticos') as string).split('\n').filter(Boolean)
      : [],
    estado: (formData.get('estado') as string) || 'activo',
  };

  const validatedFields = updateConsultanteSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const errors = validatedFields.error.errors.map((err) => err.message).join(', ');
    return { error: errors };
  }

  const { id: consultanteId, ...data } = validatedFields.data;

  // Cifrar campos sensibles
  const encryptedData = {
    nombre_completo: data.nombre_completo ? encrypt(data.nombre_completo) : undefined,
    email: data.email ? encrypt(data.email) : undefined,
    telefono: data.telefono ? encrypt(data.telefono) : undefined,
    fecha_nacimiento: data.fecha_nacimiento || undefined,
    motivo_consulta: data.motivo_consulta ? encrypt(data.motivo_consulta) : undefined,
    objetivos_terapeuticos: data.objetivos_terapeuticos,
    estado: data.estado,
  };

  const { error } = await supabase
    .from('consultantes')
    .update(encryptedData)
    .eq('id', consultanteId)
    .eq('profesional_id', user.id);

  if (error) {
    console.error('Error al actualizar consultante:', error);
    return { error: 'Error al actualizar el consultante' };
  }

  revalidatePath('/consultantes');
  revalidatePath(`/consultantes/${consultanteId}`);
  redirect(`/consultantes/${consultanteId}`);
}

export async function deleteConsultante(consultanteId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  const { error } = await supabase
    .from('consultantes')
    .delete()
    .eq('id', consultanteId)
    .eq('profesional_id', user.id);

  if (error) {
    console.error('Error al eliminar consultante:', error);
    return { error: 'Error al eliminar el consultante' };
  }

  revalidatePath('/consultantes');
  redirect('/consultantes');
}

/**
 * Obtener consultante por ID con datos descifrados
 */
export async function getConsultante(consultanteId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado', data: null };
  }

  const { data, error } = await supabase
    .from('consultantes')
    .select('*')
    .eq('id', consultanteId)
    .eq('profesional_id', user.id)
    .single();

  if (error || !data) {
    return { error: 'Consultante no encontrado', data: null };
  }

  // Descifrar campos sensibles
  const decrypted = {
    ...data,
    nombre_completo: decrypt(data.nombre_completo),
    email: data.email ? decrypt(data.email) : null,
    telefono: data.telefono ? decrypt(data.telefono) : null,
    motivo_consulta: data.motivo_consulta ? decrypt(data.motivo_consulta) : null,
  };

  return { data: decrypted, error: null };
}

/**
 * Obtener todos los consultantes con datos descifrados
 */
export async function getConsultantes(estado?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado', data: null };
  }

  let query = supabase
    .from('consultantes')
    .select('*')
    .eq('profesional_id', user.id)
    .order('created_at', { ascending: false });

  if (estado) {
    query = query.eq('estado', estado);
  }

  const { data, error } = await query;

  if (error) {
    return { error: 'Error al obtener consultantes', data: null };
  }

  // Descifrar campos sensibles de todos los consultantes
  const decrypted = data?.map((consultante) => ({
    ...consultante,
    nombre_completo: decrypt(consultante.nombre_completo),
    email: consultante.email ? decrypt(consultante.email) : null,
    telefono: consultante.telefono ? decrypt(consultante.telefono) : null,
    motivo_consulta: consultante.motivo_consulta ? decrypt(consultante.motivo_consulta) : null,
  }));

  return { data: decrypted, error: null };
}

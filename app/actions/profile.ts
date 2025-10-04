'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateProfileSchema = z.object({
  nombre_completo: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  numero_matricula: z.string().optional(),
  telefono: z.string().optional(),
});

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma la nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

/**
 * Actualizar información del perfil
 */
export async function updateProfile(formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'No autorizado' };
    }

    const rawData = {
      nombre_completo: formData.get('nombre_completo'),
      numero_matricula: formData.get('numero_matricula'),
      telefono: formData.get('telefono'),
    };

    const validatedFields = updateProfileSchema.safeParse(rawData);

    if (!validatedFields.success) {
      const errors = validatedFields.error.errors.map((err) => err.message).join(', ');
      return { error: errors };
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        nombre_completo: validatedFields.data.nombre_completo,
        numero_matricula: validatedFields.data.numero_matricula || null,
        telefono: validatedFields.data.telefono || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error actualizando perfil:', error);
      return { error: 'Error al actualizar el perfil' };
    }

    revalidatePath('/configuracion');
    return { success: true };
  } catch (error) {
    console.error('Error en updateProfile:', error);
    return { error: 'Error inesperado al actualizar el perfil' };
  }
}

/**
 * Cambiar contraseña
 */
export async function updatePassword(formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'No autorizado' };
    }

    const rawData = {
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword'),
    };

    const validatedFields = updatePasswordSchema.safeParse(rawData);

    if (!validatedFields.success) {
      const errors = validatedFields.error.errors.map((err) => err.message).join(', ');
      return { error: errors };
    }

    // Verificar contraseña actual
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: validatedFields.data.currentPassword,
    });

    if (signInError) {
      return { error: 'La contraseña actual es incorrecta' };
    }

    // Actualizar contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedFields.data.newPassword,
    });

    if (updateError) {
      console.error('Error actualizando contraseña:', updateError);
      return { error: 'Error al cambiar la contraseña' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error en updatePassword:', error);
    return { error: 'Error inesperado al cambiar la contraseña' };
  }
}

/**
 * Obtener información del perfil
 */
export async function getProfile() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'No autorizado' };
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error obteniendo perfil:', error);
      return { error: 'Error al obtener el perfil' };
    }

    return { data: { ...profile, email: user.email } };
  } catch (error) {
    console.error('Error en getProfile:', error);
    return { error: 'Error inesperado al obtener el perfil' };
  }
}

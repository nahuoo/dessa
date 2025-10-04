'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const citaSchema = z.object({
  consultante_id: z.string().uuid(),
  fecha_hora: z.string(),
  duracion: z.number().int().min(15).max(300),
  modalidad: z.enum(['presencial', 'videollamada', 'telefónica']),
  notas: z.string().optional(),
  estado: z.enum(['confirmada', 'pendiente', 'cancelada', 'completada']).default('pendiente'),
});

// Función para detectar conflictos de horarios
async function checkScheduleConflict(
  supabase: any,
  userId: string,
  fechaHora: string,
  duracion: number,
  citaIdToExclude?: string
) {
  const startTime = new Date(fechaHora);
  const endTime = new Date(startTime.getTime() + duracion * 60000);

  // Buscar citas del profesional en el rango de tiempo
  let query = supabase
    .from('citas')
    .select('id, fecha_hora, duracion, consultantes!inner(nombre_completo, profesional_id)')
    .eq('consultantes.profesional_id', userId)
    .in('estado', ['confirmada', 'pendiente']) // Solo citas activas
    .gte('fecha_hora', startTime.toISOString())
    .lte('fecha_hora', endTime.toISOString());

  if (citaIdToExclude) {
    query = query.neq('id', citaIdToExclude);
  }

  const { data: citasEnRango } = await query;

  if (!citasEnRango || citasEnRango.length === 0) {
    return { hasConflict: false, conflicts: [] };
  }

  // Verificar solapamiento real
  const conflicts = citasEnRango.filter((cita) => {
    const citaStart = new Date(cita.fecha_hora);
    const citaEnd = new Date(citaStart.getTime() + cita.duracion * 60000);

    // Hay conflicto si:
    // 1. La nueva cita empieza antes de que termine una existente Y
    // 2. La nueva cita termina después de que empiece una existente
    return startTime < citaEnd && endTime > citaStart;
  });

  return {
    hasConflict: conflicts.length > 0,
    conflicts: conflicts.map((c) => ({
      id: c.id,
      fecha_hora: c.fecha_hora,
      duracion: c.duracion,
    })),
  };
}

export async function createCita(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  const rawData = {
    consultante_id: formData.get('consultante_id') as string,
    fecha_hora: formData.get('fecha_hora') as string,
    duracion: parseInt(formData.get('duracion') as string),
    modalidad: formData.get('modalidad') as string,
    notas: formData.get('notas') as string,
    estado: (formData.get('estado') as string) || 'pendiente',
  };

  const validatedFields = citaSchema.safeParse(rawData);

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

  // Verificar conflictos de horarios
  const conflictCheck = await checkScheduleConflict(
    supabase,
    user.id,
    data.fecha_hora,
    data.duracion
  );

  if (conflictCheck.hasConflict) {
    const conflictTime = new Date(conflictCheck.conflicts[0].fecha_hora);
    return {
      error: `Ya tienes una cita programada a las ${conflictTime.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      })}. Por favor elige otro horario.`,
    };
  }

  const { error } = await supabase.from('citas').insert({
    consultante_id: data.consultante_id,
    fecha_hora: new Date(data.fecha_hora).toISOString(),
    duracion: data.duracion,
    modalidad: data.modalidad,
    notas: data.notas || null,
    estado: data.estado,
    recordatorio_enviado: false,
  });

  if (error) {
    console.error('Error al crear cita:', error);
    return { error: 'Error al crear la cita' };
  }

  revalidatePath('/agenda');
  revalidatePath(`/consultantes/${data.consultante_id}`);
  redirect('/agenda');
}

export async function updateCita(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  const id = formData.get('id') as string;

  const rawData = {
    consultante_id: formData.get('consultante_id') as string,
    fecha_hora: formData.get('fecha_hora') as string,
    duracion: parseInt(formData.get('duracion') as string),
    modalidad: formData.get('modalidad') as string,
    notas: formData.get('notas') as string,
    estado: (formData.get('estado') as string) || 'pendiente',
  };

  const validatedFields = citaSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const errors = validatedFields.error.errors.map((err) => err.message).join(', ');
    return { error: errors };
  }

  const data = validatedFields.data;

  // Verificar que la cita pertenece a un consultante del profesional
  const { data: cita } = await supabase
    .from('citas')
    .select('*, consultantes!inner(profesional_id)')
    .eq('id', id)
    .eq('consultantes.profesional_id', user.id)
    .single();

  if (!cita) {
    return { error: 'Cita no encontrada' };
  }

  // Verificar conflictos de horarios (excluyendo la cita actual)
  const conflictCheck = await checkScheduleConflict(
    supabase,
    user.id,
    data.fecha_hora,
    data.duracion,
    id
  );

  if (conflictCheck.hasConflict) {
    const conflictTime = new Date(conflictCheck.conflicts[0].fecha_hora);
    return {
      error: `Ya tienes una cita programada a las ${conflictTime.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      })}. Por favor elige otro horario.`,
    };
  }

  const { error } = await supabase
    .from('citas')
    .update({
      consultante_id: data.consultante_id,
      fecha_hora: new Date(data.fecha_hora).toISOString(),
      duracion: data.duracion,
      modalidad: data.modalidad,
      notas: data.notas || null,
      estado: data.estado,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error al actualizar cita:', error);
    return { error: 'Error al actualizar la cita' };
  }

  revalidatePath('/agenda');
  redirect('/agenda');
}

export async function deleteCita(citaId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  // Verificar que la cita pertenece a un consultante del profesional
  const { data: cita } = await supabase
    .from('citas')
    .select('*, consultantes!inner(profesional_id)')
    .eq('id', citaId)
    .eq('consultantes.profesional_id', user.id)
    .single();

  if (!cita) {
    return { error: 'Cita no encontrada' };
  }

  const { error } = await supabase.from('citas').delete().eq('id', citaId);

  if (error) {
    console.error('Error al eliminar cita:', error);
    return { error: 'Error al eliminar la cita' };
  }

  revalidatePath('/agenda');
  redirect('/agenda');
}

export async function getCita(citaId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado', data: null };
  }

  const { data, error } = await supabase
    .from('citas')
    .select('*, consultantes!inner(id, nombre_completo, profesional_id)')
    .eq('id', citaId)
    .eq('consultantes.profesional_id', user.id)
    .single();

  if (error || !data) {
    return { error: 'Cita no encontrada', data: null };
  }

  return { data, error: null };
}

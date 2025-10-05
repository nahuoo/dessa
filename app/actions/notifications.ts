'use server';

import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/utils/encryption';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { revalidatePath } from 'next/cache';

interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  link?: string;
  leida: boolean;
  created_at: string;
  metadata?: any;
}

/**
 * Obtener las preferencias de notificación del usuario
 */
export async function getNotificationPreferences() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { data: profile = {} as any } = await supabase
    .from('profiles')
    .select('email_recordatorios, horas_anticipacion')
    .eq('id', user.id)
    .single();

  return {
    data: {
      email_recordatorios: profile?.email_recordatorios ?? true,
      horas_anticipacion: profile?.horas_anticipacion ?? 24,
    },
  };
}

/**
 * Actualizar preferencias de notificación
 */
export async function updateNotificationPreferences(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  const emailRecordatorios = formData.get('email_recordatorios') === 'true';
  const horasAnticipacion = parseInt(formData.get('horas_anticipacion') as string);

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { error } = await (supabase as any)
    .from('profiles')
    .update({
      email_recordatorios: emailRecordatorios,
      horas_anticipacion: horasAnticipacion,
    })
    .eq('id', user.id);

  if (error) {
    return { error: 'Error al actualizar preferencias' };
  }

  return { success: true };
}

/**
 * Obtener citas que requieren recordatorio
 */
export async function getCitasParaRecordatorio() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: [] };

  // Obtener preferencias del usuario
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { data: profile = {} as any } = await supabase
    .from('profiles')
    .select('email_recordatorios, horas_anticipacion')
    .eq('id', user.id)
    .single();

  if (!profile?.email_recordatorios) {
    return { data: [] };
  }

  const ahora = new Date();
  const horasAnticipacion = profile.horas_anticipacion || 24;
  const fechaLimite = new Date(ahora.getTime() + horasAnticipacion * 60 * 60 * 1000);

  // Obtener citas próximas que aún no han enviado recordatorio
  const { data: citas } = await supabase
    .from('citas')
    .select(`
      *,
      consultantes!inner(nombre_completo, email, profesional_id)
    `)
    .eq('consultantes.profesional_id', user.id)
    .eq('estado', 'confirmada')
    .gte('fecha_hora', ahora.toISOString())
    .lte('fecha_hora', fechaLimite.toISOString())
    .is('recordatorio_enviado', false);

  return { data: citas || [] };
}

/**
 * Marcar recordatorio como enviado
 */
export async function marcarRecordatorioEnviado(citaId: string) {
  const supabase = await createClient();

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { error } = await (supabase as any)
    .from('citas')
    .update({ recordatorio_enviado: true })
    .eq('id', citaId);

  if (error) {
    console.error('Error al marcar recordatorio:', error);
    return { error: 'Error al marcar recordatorio' };
  }

  return { success: true };
}

/**
 * Generar contenido del recordatorio por email
 * (Función helper, no es un Server Action)
 */
function generarContenidoRecordatorio(cita: any) {
  const consultanteNombre = decrypt(cita.consultantes.nombre_completo);
  const fechaCita = new Date(cita.fecha_hora);
  const horasRestantes = differenceInHours(fechaCita, new Date());
  const minutosRestantes = differenceInMinutes(fechaCita, new Date()) % 60;

  const asunto = `Recordatorio: Cita con ${consultanteNombre}`;

  const cuerpo = `
Hola,

Este es un recordatorio de tu próxima cita:

📅 Consultante: ${consultanteNombre}
📅 Fecha: ${format(fechaCita, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
🕐 Hora: ${format(fechaCita, 'HH:mm', { locale: es })}
⏱️ Duración: ${cita.duracion} minutos
📍 Modalidad: ${cita.modalidad.charAt(0).toUpperCase() + cita.modalidad.slice(1)}

${cita.notas ? `📝 Notas: ${cita.notas}\n` : ''}
⏰ Tiempo restante: ${horasRestantes > 0 ? `${horasRestantes} horas y ` : ''}${minutosRestantes} minutos

Saludos,
DessaTech - Sistema de Gestión Profesional
  `.trim();

  return { asunto, cuerpo };
}

/**
 * Enviar recordatorio por email (integración con servicio de email)
 * NOTA: Esta función requiere configurar un servicio de email como Resend, SendGrid, etc.
 */
export async function enviarRecordatorioEmail(citaId: string) {
  const supabase = await createClient();

  // Obtener información de la cita
  const { data: cita } = await supabase
    .from('citas')
    .select(`
      *,
      consultantes!inner(nombre_completo, email, profesional_id)
    `)
    .eq('id', citaId)
    .single();

  if (!cita) {
    return { error: 'Cita no encontrada' };
  }

  // Obtener email del profesional
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return { error: 'Usuario no autenticado' };
  }

  const { asunto, cuerpo } = generarContenidoRecordatorio(cita);

  // TODO: Integrar con servicio de email real (Resend, SendGrid, etc.)
  // Por ahora, solo registramos en consola
  console.log('📧 Recordatorio generado:');
  console.log('Para:', user.email);
  console.log('Asunto:', asunto);
  console.log('Cuerpo:', cuerpo);

  // Marcar como enviado
  await marcarRecordatorioEnviado(citaId);

  return {
    success: true,
    message: 'Recordatorio preparado (integración de email pendiente)'
  };
}

/**
 * Obtener todas las notificaciones del usuario
 */
export async function getNotificaciones() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: 'No autenticado' };
  }

  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('profesional_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error al obtener notificaciones:', error);
    return { data: [], error: error.message };
  }

  return { data: data as Notificacion[], error: null };
}

/**
 * Obtener contador de notificaciones no leídas
 */
export async function getNotificacionesNoLeidasCount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { count: 0 };
  }

  const { count, error } = await supabase
    .from('notificaciones')
    .select('*', { count: 'exact', head: true })
    .eq('profesional_id', user.id)
    .eq('leida', false);

  if (error) {
    console.error('Error al contar notificaciones:', error);
    return { count: 0 };
  }

  return { count: count || 0 };
}

/**
 * Marcar una notificación como leída
 */
export async function marcarNotificacionLeida(notificacionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { error } = await (supabase as any)
    .from('notificaciones')
    .update({ leida: true })
    .eq('id', notificacionId)
    .eq('profesional_id', user.id);

  if (error) {
    console.error('Error al marcar notificación:', error);
    return { error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function marcarTodasLeidas() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { error } = await (supabase as any)
    .from('notificaciones')
    .update({ leida: true })
    .eq('profesional_id', user.id)
    .eq('leida', false);

  if (error) {
    console.error('Error al marcar todas como leídas:', error);
    return { error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

/**
 * Eliminar una notificación
 */
export async function eliminarNotificacion(notificacionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  const { error } = await supabase
    .from('notificaciones')
    .delete()
    .eq('id', notificacionId)
    .eq('profesional_id', user.id);

  if (error) {
    console.error('Error al eliminar notificación:', error);
    return { error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

/**
 * Crear notificación de cita próxima
 */
export async function crearNotificacionCitaProxima(
  citaId: string,
  consultanteNombre: string,
  fechaHora: Date
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado' };
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { error } = await (supabase as any).rpc('crear_notificacion_cita_proxima', {
    p_profesional_id: user.id,
    p_cita_id: citaId,
    p_consultante_nombre: consultanteNombre,
    p_fecha_hora: fechaHora.toISOString(),
  });

  if (error) {
    console.error('Error al crear notificación:', error);
    return { error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

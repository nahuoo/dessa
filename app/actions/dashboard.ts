'use server';

import { createClient } from '@/lib/supabase/server';
import {
  generateConsultantesInsight,
  generateSesionesInsight,
  generateCitasInsight,
} from '@/lib/ai/insights';
import { decrypt } from '@/lib/utils/encryption';

export type DashboardStats = {
  consultantes: {
    total: number;
    activos: number;
    inactivos: number;
    enPausa: number;
    insight?: string;
  };
  sesiones: {
    totalMes: number;
    totalMesAnterior: number;
    promedioPorConsultante: number;
    insight?: string;
  };
  citas: {
    proximasCitas: number;
    citasHoy: number;
    citasEstaSemana: number;
    insight?: string;
  };
  actividadReciente: {
    ultimasSesiones: Array<{
      id: string;
      fecha: string;
      consultanteNombre: string;
      tipo: string;
    }>;
    proximasCitas: Array<{
      id: string;
      fecha: string;
      hora: string;
      consultanteNombre: string;
      tipo: string;
    }>;
  };
};

/**
 * Obtiene todas las estadísticas del dashboard
 */
export async function getDashboardStats(
  includeInsights = false
): Promise<{ data?: DashboardStats; error?: string }> {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'No autorizado' };
    }

    // Obtener estadísticas de consultantes
    const { data: consultantes, error: consultantesError } = await supabase
      .from('consultantes')
      .select('estado')
      .eq('profesional_id', user.id);

    if (consultantesError) {
      console.error('Error obteniendo consultantes:', consultantesError);
      return { error: 'Error obteniendo estadísticas de consultantes' };
    }

    const consultantesStats = {
      total: consultantes.length,
      activos: consultantes.filter((c) => c.estado === 'activo').length,
      inactivos: consultantes.filter((c) => c.estado === 'inactivo').length,
      enPausa: consultantes.filter((c) => c.estado === 'en_pausa').length,
    };

    // Obtener estadísticas de sesiones
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const { data: sesionesMes, error: sesionesError } = await supabase
      .from('sesiones')
      .select('id, consultante_id, consultantes!inner(profesional_id)')
      .eq('consultantes.profesional_id', user.id)
      .gte('fecha', startOfMonth.toISOString());

    if (sesionesError) {
      console.error('Error obteniendo sesiones del mes:', sesionesError);
      return { error: 'Error obteniendo estadísticas de sesiones' };
    }

    const { data: sesionesMesAnterior } = await supabase
      .from('sesiones')
      .select('id, consultantes!inner(profesional_id)')
      .eq('consultantes.profesional_id', user.id)
      .gte('fecha', startOfLastMonth.toISOString())
      .lte('fecha', endOfLastMonth.toISOString());

    const sesionesStats = {
      totalMes: sesionesMes.length,
      totalMesAnterior: sesionesMesAnterior?.length || 0,
      promedioPorConsultante:
        consultantesStats.activos > 0
          ? sesionesMes.length / consultantesStats.activos
          : 0,
    };

    // Obtener estadísticas de citas
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const { data: citasHoy } = await supabase
      .from('citas')
      .select('id, consultantes!inner(profesional_id)')
      .eq('consultantes.profesional_id', user.id)
      .gte('fecha', startOfToday.toISOString())
      .lt('fecha', endOfToday.toISOString())
      .eq('estado', 'confirmada');

    const { data: citasEstaSemana } = await supabase
      .from('citas')
      .select('id, consultantes!inner(profesional_id)')
      .eq('consultantes.profesional_id', user.id)
      .gte('fecha', startOfWeek.toISOString())
      .lt('fecha', endOfWeek.toISOString())
      .eq('estado', 'confirmada');

    const { data: proximasCitas } = await supabase
      .from('citas')
      .select('id, consultantes!inner(profesional_id)')
      .eq('consultantes.profesional_id', user.id)
      .gte('fecha', now.toISOString())
      .eq('estado', 'confirmada');

    const citasStats = {
      citasHoy: citasHoy?.length || 0,
      citasEstaSemana: citasEstaSemana?.length || 0,
      proximasCitas: proximasCitas?.length || 0,
    };

    // Obtener actividad reciente - últimas 5 sesiones
    const { data: ultimasSesiones } = await supabase
      .from('sesiones')
      .select('id, fecha, tipo, consultante_id, consultantes!inner(nombre_encrypted, profesional_id)')
      .eq('consultantes.profesional_id', user.id)
      .order('fecha', { ascending: false })
      .limit(5);

    // Obtener próximas 5 citas
    const { data: proximasCitasDetalle } = await supabase
      .from('citas')
      .select('id, fecha, hora, tipo, consultante_id, consultantes!inner(nombre_encrypted, profesional_id)')
      .eq('consultantes.profesional_id', user.id)
      .gte('fecha', now.toISOString())
      .eq('estado', 'confirmada')
      .order('fecha', { ascending: true })
      .limit(5);

    // Procesar actividad reciente
    const actividadReciente = {
      ultimasSesiones:
        ultimasSesiones?.map((s) => ({
          id: s.id,
          fecha: s.fecha,
          consultanteNombre: s.consultantes
            ? decrypt(s.consultantes.nombre_encrypted)
            : 'Desconocido',
          tipo: s.tipo,
        })) || [],
      proximasCitas:
        proximasCitasDetalle?.map((c) => ({
          id: c.id,
          fecha: c.fecha,
          hora: c.hora || '',
          consultanteNombre: c.consultantes
            ? decrypt(c.consultantes.nombre_encrypted)
            : 'Desconocido',
          tipo: c.tipo,
        })) || [],
    };

    // Generar insights con IA si se solicita
    let consultantesInsight, sesionesInsight, citasInsight;

    if (includeInsights) {
      [consultantesInsight, sesionesInsight, citasInsight] = await Promise.all([
        generateConsultantesInsight(consultantesStats),
        generateSesionesInsight(sesionesStats),
        generateCitasInsight(citasStats),
      ]);
    }

    const stats: DashboardStats = {
      consultantes: {
        ...consultantesStats,
        ...(consultantesInsight && { insight: consultantesInsight }),
      },
      sesiones: {
        ...sesionesStats,
        ...(sesionesInsight && { insight: sesionesInsight }),
      },
      citas: {
        ...citasStats,
        ...(citasInsight && { insight: citasInsight }),
      },
      actividadReciente,
    };

    return { data: stats };
  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    return { error: 'Error obteniendo estadísticas del dashboard' };
  }
}

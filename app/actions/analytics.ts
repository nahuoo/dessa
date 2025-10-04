'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Obtiene datos de sesiones por mes para gráficos
 */
export async function getSesionesUltimosMeses(meses: number = 6) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'No autorizado', data: null };
    }

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - meses + 1, 1);

    const { data: sesiones, error } = await supabase
      .from('sesiones')
      .select('fecha, consultantes!inner(profesional_id)')
      .eq('consultantes.profesional_id', user.id)
      .gte('fecha', startDate.toISOString())
      .order('fecha', { ascending: true });

    if (error) {
      console.error('Error obteniendo sesiones:', error);
      return { error: 'Error al obtener datos de sesiones', data: null };
    }

    // Agrupar sesiones por mes
    const sesionesporMes: { [key: string]: number } = {};

    // Inicializar todos los meses con 0
    for (let i = 0; i < meses; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - meses + 1 + i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      sesionesporMes[key] = 0;
    }

    // Contar sesiones por mes
    sesiones?.forEach((sesion) => {
      const date = new Date(sesion.fecha);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (sesionesporMes[key] !== undefined) {
        sesionesporMes[key]++;
      }
    });

    // Convertir a array para el gráfico
    const data = Object.entries(sesionesporMes).map(([mes, cantidad]) => {
      const [year, month] = mes.split('-');
      const monthNames = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];
      return {
        mes: monthNames[parseInt(month) - 1],
        cantidad,
        fullDate: mes,
      };
    });

    return { data, error: null };
  } catch (error) {
    console.error('Error en getSesionesUltimosMeses:', error);
    return { error: 'Error inesperado', data: null };
  }
}

/**
 * Obtiene distribución de sesiones por modalidad
 */
export async function getSesionesPorModalidad() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'No autorizado', data: null };
    }

    const { data: sesiones, error } = await supabase
      .from('sesiones')
      .select('modalidad, consultantes!inner(profesional_id)')
      .eq('consultantes.profesional_id', user.id);

    if (error) {
      console.error('Error obteniendo sesiones:', error);
      return { error: 'Error al obtener datos', data: null };
    }

    // Agrupar por modalidad
    const modalidades: { [key: string]: number } = {
      presencial: 0,
      videollamada: 0,
      telefónica: 0,
    };

    sesiones?.forEach((sesion) => {
      if (modalidades[sesion.modalidad] !== undefined) {
        modalidades[sesion.modalidad]++;
      }
    });

    const data = [
      { name: 'Presencial', value: modalidades.presencial },
      { name: 'Videollamada', value: modalidades.videollamada },
      { name: 'Telefónica', value: modalidades['telefónica'] },
    ].filter((item) => item.value > 0); // Solo mostrar modalidades con sesiones

    return { data, error: null };
  } catch (error) {
    console.error('Error en getSesionesPorModalidad:', error);
    return { error: 'Error inesperado', data: null };
  }
}

/**
 * Obtiene estadísticas de crecimiento
 */
export async function getEstadisticasCrecimiento() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'No autorizado', data: null };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Consultantes activos este mes vs mes anterior
    const { count: consultantesEsteMes } = await supabase
      .from('consultantes')
      .select('*', { count: 'exact', head: true })
      .eq('profesional_id', user.id)
      .eq('estado', 'activo')
      .gte('created_at', startOfMonth.toISOString());

    const { count: consultantesMesAnterior } = await supabase
      .from('consultantes')
      .select('*', { count: 'exact', head: true })
      .eq('profesional_id', user.id)
      .eq('estado', 'activo')
      .gte('created_at', startOfLastMonth.toISOString())
      .lte('created_at', endOfLastMonth.toISOString());

    // Sesiones este mes vs mes anterior
    const { count: sesionesEsteMes } = await supabase
      .from('sesiones')
      .select('*, consultantes!inner(profesional_id)', { count: 'exact', head: true })
      .eq('consultantes.profesional_id', user.id)
      .gte('fecha', startOfMonth.toISOString());

    const { count: sesionesMesAnterior } = await supabase
      .from('sesiones')
      .select('*, consultantes!inner(profesional_id)', { count: 'exact', head: true })
      .eq('consultantes.profesional_id', user.id)
      .gte('fecha', startOfLastMonth.toISOString())
      .lte('fecha', endOfLastMonth.toISOString());

    const calcularCambio = (actual: number, anterior: number) => {
      if (anterior === 0) return actual > 0 ? 100 : 0;
      return Math.round(((actual - anterior) / anterior) * 100);
    };

    return {
      data: {
        consultantes: {
          actual: consultantesEsteMes || 0,
          anterior: consultantesMesAnterior || 0,
          cambio: calcularCambio(consultantesEsteMes || 0, consultantesMesAnterior || 0),
        },
        sesiones: {
          actual: sesionesEsteMes || 0,
          anterior: sesionesMesAnterior || 0,
          cambio: calcularCambio(sesionesEsteMes || 0, sesionesMesAnterior || 0),
        },
      },
      error: null,
    };
  } catch (error) {
    console.error('Error en getEstadisticasCrecimiento:', error);
    return { error: 'Error inesperado', data: null };
  }
}

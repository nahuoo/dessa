// import { openrouter, MODELS, SYSTEM_PROMPTS } from '@/lib/openrouter/client';

// TODO: Migrar a ai-sdk v5 usando streamText y generateText
// Estas funciones están temporalmente deshabilitadas hasta completar la migración

/**
 * Genera insights sobre la distribución de consultantes por estado
 */
export async function generateConsultantesInsight(_stats: {
  activos: number;
  inactivos: number;
  enPausa: number;
}): Promise<string> {
  return 'Insights temporalmente deshabilitados. Actualización en progreso.';
}

/**
 * Genera insights sobre la actividad de sesiones
 */
export async function generateSesionesInsight(_stats: {
  totalMes: number;
  totalMesAnterior: number;
  promedioPorConsultante: number;
}): Promise<string> {
  return 'Insights temporalmente deshabilitados. Actualización en progreso.';
}

/**
 * Genera sugerencias basadas en próximas citas
 */
export async function generateCitasInsight(_stats: {
  proximasCitas: number;
  citasHoy: number;
  citasEstaSemana: number;
}): Promise<string> {
  return 'Insights temporalmente deshabilitados. Actualización en progreso.';
}

/**
 * Analiza patrones en sesiones recientes
 */
export async function analyzeRecentPatterns(_sessionNotes: string[]): Promise<string> {
  return 'Análisis de patrones temporalmente deshabilitado. Actualización en progreso.';
}

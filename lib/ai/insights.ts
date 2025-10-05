import { generateText } from 'ai';
import { openrouter, MODELS, SYSTEM_PROMPTS } from '@/lib/openrouter/client';

/**
 * Genera insights sobre la distribución de consultantes por estado
 */
export async function generateConsultantesInsight(stats: {
  activos: number;
  inactivos: number;
  enPausa: number;
}): Promise<string> {
  try {
    const total = stats.activos + stats.inactivos + stats.enPausa;
    const prompt = `Analiza esta distribución de consultantes:
- Total: ${total}
- Activos: ${stats.activos} (${((stats.activos / total) * 100).toFixed(1)}%)
- Inactivos: ${stats.inactivos} (${((stats.inactivos / total) * 100).toFixed(1)}%)
- En pausa: ${stats.enPausa} (${((stats.enPausa / total) * 100).toFixed(1)}%)

Proporciona un insight breve (2-3 líneas) sobre qué indica esta distribución y una recomendación práctica.`;

    const { text } = await generateText({
      model: openrouter(MODELS.DEEPSEEK),
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente para profesionales de salud mental. Proporciona insights concisos y prácticos.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      maxSteps: 1,
    });

    return text || 'No se pudo generar insight';
  } catch (error) {
    console.error('Error generando insight de consultantes:', error);
    return 'No disponible';
  }
}

/**
 * Genera insights sobre la actividad de sesiones
 */
export async function generateSesionesInsight(stats: {
  totalMes: number;
  totalMesAnterior: number;
  promedioPorConsultante: number;
}): Promise<string> {
  try {
    const cambio = stats.totalMes - stats.totalMesAnterior;
    const porcentajeCambio =
      stats.totalMesAnterior > 0
        ? ((cambio / stats.totalMesAnterior) * 100).toFixed(1)
        : '0';

    const prompt = `Analiza esta actividad de sesiones:
- Sesiones este mes: ${stats.totalMes}
- Sesiones mes anterior: ${stats.totalMesAnterior}
- Cambio: ${cambio > 0 ? '+' : ''}${cambio} (${porcentajeCambio}%)
- Promedio por consultante: ${stats.promedioPorConsultante.toFixed(1)}

Proporciona un insight breve (2-3 líneas) sobre la tendencia y una sugerencia para optimizar la práctica.`;

    const { text } = await generateText({
      model: openrouter(MODELS.DEEPSEEK),
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente para profesionales de salud mental. Proporciona insights concisos y prácticos.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      maxSteps: 1,
    });

    return text || 'No se pudo generar insight';
  } catch (error) {
    console.error('Error generando insight de sesiones:', error);
    return 'No disponible';
  }
}

/**
 * Genera sugerencias basadas en próximas citas
 */
export async function generateCitasInsight(stats: {
  proximasCitas: number;
  citasHoy: number;
  citasEstaSemana: number;
}): Promise<string> {
  try {
    const prompt = `Analiza esta agenda de citas:
- Citas hoy: ${stats.citasHoy}
- Citas esta semana: ${stats.citasEstaSemana}
- Próximas citas programadas: ${stats.proximasCitas}

Proporciona un insight breve (2-3 líneas) sobre la carga de trabajo y una recomendación práctica.`;

    const { text } = await generateText({
      model: openrouter(MODELS.DEEPSEEK),
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente para profesionales de salud mental. Proporciona insights concisos y prácticos.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      maxSteps: 1,
    });

    return text || 'No se pudo generar insight';
  } catch (error) {
    console.error('Error generando insight de citas:', error);
    return 'No disponible';
  }
}

/**
 * Analiza patrones en sesiones recientes
 */
export async function analyzeRecentPatterns(sessionNotes: string[]): Promise<string> {
  try {
    const notesText = sessionNotes
      .map((note, i) => `Sesión ${i + 1}: ${note}`)
      .join('\n\n');

    const { text } = await generateText({
      model: openrouter(MODELS.DEEPSEEK),
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.PATTERN_ANALYSIS },
        {
          role: 'user',
          content: `Analiza patrones en estas notas de sesiones recientes:\n\n${notesText}`,
        },
      ],
      temperature: 0.7,
      maxSteps: 1,
    });

    return text || 'No se pudo generar análisis';
  } catch (error) {
    console.error('Error analizando patrones:', error);
    return 'No disponible';
  }
}

import { createOpenAI } from '@ai-sdk/openai';

/**
 * Cliente de OpenRouter para interacciones con IA
 * Usa la API compatible con OpenAI vía ai-sdk
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_APP_NAME = process.env.OPENROUTER_APP_NAME || 'dessatech';
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL || 'http://localhost:3000';

if (!OPENROUTER_API_KEY) {
  console.warn('⚠️  OPENROUTER_API_KEY no está configurada. Las funciones de IA no estarán disponibles.');
}

export const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': OPENROUTER_SITE_URL,
    'X-Title': OPENROUTER_APP_NAME,
  },
});

/**
 * Modelos disponibles en OpenRouter
 */
export const MODELS = {
  // Modelo principal (gratuito y de excelente calidad)
  DEEPSEEK: 'deepseek/deepseek-chat-v3.1:free',

  // Otros modelos gratuitos alternativos
  GROK_BETA: 'x-ai/grok-beta',
  LLAMA_3_8B: 'meta-llama/llama-3-8b-instruct:free',
  MISTRAL_7B: 'mistralai/mistral-7b-instruct:free',

  // Modelos de pago (si necesitas mayor calidad)
  GPT_4_TURBO: 'openai/gpt-4-turbo',
  CLAUDE_3_OPUS: 'anthropic/claude-3-opus',
} as const;

/**
 * Prompts del sistema para diferentes casos de uso
 */
export const SYSTEM_PROMPTS = {
  SESSION_SUMMARY: `Eres un asistente especializado en salud mental para profesionales.
Tu tarea es ayudar a generar resúmenes concisos de sesiones terapéuticas.
- Mantén un tono profesional y clínico
- Extrae los puntos clave de la sesión
- Identifica temas principales, emociones y avances
- Sugiere posibles objetivos terapéuticos si aplica
- Sé conciso y directo`,

  THERAPEUTIC_GOALS: `Eres un asistente especializado en salud mental para profesionales.
Tu tarea es ayudar a formular objetivos terapéuticos SMART (Específicos, Medibles, Alcanzables, Relevantes, Temporales).
- Sugiere objetivos basados en el motivo de consulta
- Asegúrate de que sean realistas y medibles
- Considera el enfoque terapéutico del profesional
- Presenta 3-5 objetivos concretos`,

  PATTERN_ANALYSIS: `Eres un asistente especializado en salud mental para profesionales.
Tu tarea es analizar patrones en las notas clínicas de múltiples sesiones.
- Identifica temas recurrentes
- Detecta cambios en el estado emocional
- Observa progreso o retrocesos
- Sugiere áreas de enfoque para próximas sesiones
- Mantén la confidencialidad y el profesionalismo`,

  INTERVENTION_SUGGESTIONS: `Eres un asistente especializado en salud mental para profesionales.
Tu tarea es sugerir intervenciones terapéuticas basadas en el caso presentado.
- Considera diferentes enfoques terapéuticos (CBT, DBT, Humanista, etc.)
- Sugiere técnicas específicas y evidenciadas
- Explica brevemente la racionalidad de cada intervención
- Adapta las sugerencias al contexto del consultante`,
} as const;

/**
 * Verificar si el cliente está configurado
 */
export function isOpenRouterConfigured(): boolean {
  return !!OPENROUTER_API_KEY;
}

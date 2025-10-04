import { openrouter, MODELS, SYSTEM_PROMPTS, isOpenRouterConfigured } from '@/lib/openrouter/client';
import { createClient } from '@/lib/supabase/server';
import { hash } from '@/lib/utils/encryption';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  // Verificar autenticación
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Verificar configuración de OpenRouter
  if (!isOpenRouterConfigured()) {
    return new Response(
      JSON.stringify({ error: 'OpenRouter no está configurado. Agrega OPENROUTER_API_KEY a tus variables de entorno.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { messages, type = 'SESSION_SUMMARY' } = await req.json();

    // Seleccionar el prompt del sistema según el tipo
    const systemPrompt = SYSTEM_PROMPTS[type as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.SESSION_SUMMARY;

    // Crear hash del prompt para auditoría (sin almacenar el contenido real)
    const promptHash = hash(JSON.stringify(messages));

    // Llamar a OpenRouter con streaming usando la nueva API de ai v5
    const result = await streamText({
      model: openrouter(MODELS.DEEPSEEK), // DeepSeek - Modelo gratuito de excelente calidad
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      maxTokens: 1500,
      async onFinish({ text }) {
        // Registrar interacción con IA (auditoría)
        const tokensUsed = text.split(' ').length * 1.3; // Estimación aproximada

        await supabase.from('ai_interactions').insert({
          profesional_id: user.id,
          tipo: type,
          prompt_hash: promptHash,
          tokens_usados: Math.round(tokensUsed),
          costo: 0, // Modelo gratuito
        });
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error en AI chat:', error);
    return new Response(
      JSON.stringify({ error: 'Error al procesar la solicitud de IA' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

import { createClient } from '@/lib/supabase/server';
import { generateText } from 'ai';
import { openrouter, MODELS } from '@/lib/openrouter/client';
import type { ContextoAwareness } from '@/types/assistant';

export const runtime = 'edge';

// Prompt del sistema para el asistente con personalidad
const ASSISTANT_SYSTEM_PROMPT = `Eres Dessa, un asistente virtual inteligente y proactivo para profesionales de salud mental.

TU PERSONALIDAD:
- Eres empático, profesional pero cercano
- Tienes iniciativa y puedes sugerir acciones sin que te las pidan
- Recuerdas contexto de conversaciones anteriores
- Eres eficiente y directo, pero amable
- Usas un tono profesional pero accesible

TUS CAPACIDADES:
1. Buscar información en el sistema (consultantes, sesiones, citas)
2. Crear recordatorios y tareas
3. Organizar y estructurar información
4. Generar resúmenes y análisis
5. Detectar patrones y hacer sugerencias
6. Aprender preferencias del usuario

CÓMO ACTÚAS:
- Si el usuario pregunta algo, respondes directamente
- Si detectas que puedes ayudar de forma proactiva, ofreces hacerlo
- Si necesitas ejecutar una acción (buscar, crear, etc), indícalo claramente
- Siempre sé consciente del contexto actual (qué página está viendo el usuario)
- Aprende de las interacciones para mejorar

FORMATO DE RESPUESTA:
- Sé conciso pero completo
- Si vas a ejecutar una acción, menciónalo al inicio
- Usa formato markdown cuando sea apropiado
- Si detectas algo importante, señálalo

Recuerda: No eres solo un chat, eres un asistente que toma acción y ayuda activamente.`;

interface ChatRequest {
  mensaje: string;
  contexto?: ContextoAwareness | null;
  historial?: Array<{ rol: string; contenido: string }>;
}

export async function POST(req: Request) {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { mensaje, contexto, historial = [] }: ChatRequest = await req.json();

    // Obtener configuración del asistente
    const { data: config } = await supabase
      .from('assistant_config')
      .select('*')
      .eq('profesional_id', user.id)
      .single();

    const nombreAsistente = config?.nombre || 'Dessa';

    // Construir contexto enriquecido
    let contextoInfo = '';
    if (contexto) {
      contextoInfo = `\n\nCONTEXTO ACTUAL:
- Página: ${contexto.pagina}`;

      if (contexto.consultante_id) {
        contextoInfo += `\n- Consultante ID: ${contexto.consultante_id}`;
      }
      if (contexto.sesion_id) {
        contextoInfo += `\n- Sesión ID: ${contexto.sesion_id}`;
      }
      if (contexto.accion_actual) {
        contextoInfo += `\n- Acción: ${contexto.accion_actual}`;
      }
    }

    // Construir mensajes para la IA
    const mensajes = [
      {
        role: 'system' as const,
        content: ASSISTANT_SYSTEM_PROMPT + contextoInfo,
      },
      ...historial.slice(-10).map((msg) => ({
        role: msg.rol === 'usuario' ? ('user' as const) : ('assistant' as const),
        content: msg.contenido,
      })),
      {
        role: 'user' as const,
        content: mensaje,
      },
    ];

    // Generar respuesta del asistente
    const { text: respuesta } = await generateText({
      model: openrouter(MODELS.DEEPSEEK),
      messages: mensajes,
      temperature: 0.8,
      maxSteps: 1,
    });

    // Guardar en memoria
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    await (supabase as any).from('assistant_memory').insert({
      profesional_id: user.id,
      tipo: 'conversacion',
      contexto: contexto || {},
      prompt: mensaje,
      respuesta,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });

    // Analizar si el asistente sugiere alguna acción
    const accionesDetectadas = detectarAcciones(respuesta);

    // Si se detectaron acciones, crearlas
    if (accionesDetectadas.length > 0) {
      for (const accion of accionesDetectadas) {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        await (supabase as any).from('assistant_actions').insert({
          profesional_id: user.id,
          tipo_accion: accion.tipo,
          titulo: accion.titulo,
          descripcion: accion.descripcion,
          datos_accion: accion.datos,
          prioridad: accion.prioridad || 3,
          estado: 'pendiente',
        });
      }
    }

    return Response.json({
      respuesta,
      metadata: {
        acciones_creadas: accionesDetectadas.length,
        contexto_usado: !!contexto,
      },
    });
  } catch (error) {
    console.error('Error en assistant chat:', error);
    return Response.json(
      { error: 'Error al procesar el mensaje' },
      { status: 500 }
    );
  }
}

// Función auxiliar para detectar acciones en la respuesta
function detectarAcciones(respuesta: string): Array<{
  tipo: string;
  titulo: string;
  descripcion?: string;
  datos: Record<string, unknown>;
  prioridad?: number;
}> {
  const acciones: Array<{
    tipo: string;
    titulo: string;
    descripcion?: string;
    datos: Record<string, unknown>;
    prioridad?: number;
  }> = [];

  // Detectar recordatorios
  if (respuesta.toLowerCase().includes('recordatorio') ||
      respuesta.toLowerCase().includes('recordar')) {
    const match = respuesta.match(/recordar\s+([^.]+)/i);
    if (match) {
      acciones.push({
        tipo: 'recordatorio',
        titulo: match[1],
        datos: {},
        prioridad: 4,
      });
    }
  }

  // Detectar búsquedas
  if (respuesta.toLowerCase().includes('buscar') ||
      respuesta.toLowerCase().includes('buscaré')) {
    const match = respuesta.match(/buscar\s+([^.]+)/i);
    if (match) {
      acciones.push({
        tipo: 'busqueda',
        titulo: `Buscar: ${match[1]}`,
        datos: { query: match[1] },
        prioridad: 3,
      });
    }
  }

  // Detectar notas
  if (respuesta.toLowerCase().includes('tomar nota') ||
      respuesta.toLowerCase().includes('anotar')) {
    acciones.push({
      tipo: 'nota',
      titulo: 'Nota automática del asistente',
      descripcion: respuesta,
      datos: {},
      prioridad: 2,
    });
  }

  return acciones;
}

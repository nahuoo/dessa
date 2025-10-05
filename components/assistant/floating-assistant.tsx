'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { MensajeAsistente, EstadoChatAsistente, ContextoAwareness } from '@/types/assistant';

interface FloatingAssistantProps {
  profesionalId: string;
  nombreAsistente?: string;
}

export function FloatingAssistant({
  profesionalId,
  nombreAsistente = 'Dessa'
}: FloatingAssistantProps) {
  const [estado, setEstado] = useState<EstadoChatAsistente>({
    abierto: false,
    minimizado: false,
    mensajes: [],
    escribiendo: false,
  });

  const [input, setInput] = useState('');
  const [contexto, setContexto] = useState<ContextoAwareness | null>(null);
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  // Detectar contexto actual (qué página está viendo el usuario)
  useEffect(() => {
    const detectarContexto = () => {
      const pathname = window.location.pathname;
      const nuevoContexto: ContextoAwareness = {
        pagina: pathname,
        timestamp: new Date().toISOString(),
      };

      // Extraer IDs de la URL si existen
      const consultanteMatch = pathname.match(/consultantes\/([^/]+)/);
      const sesionMatch = pathname.match(/sesiones\/([^/]+)/);
      const citaMatch = pathname.match(/citas\/([^/]+)/);

      if (consultanteMatch) nuevoContexto.consultante_id = consultanteMatch[1];
      if (sesionMatch) nuevoContexto.sesion_id = sesionMatch[1];
      if (citaMatch) nuevoContexto.cita_id = citaMatch[1];

      setContexto(nuevoContexto);
    };

    detectarContexto();

    // Escuchar cambios de ruta
    const handleRouteChange = () => detectarContexto();
    window.addEventListener('popstate', handleRouteChange);

    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Auto-scroll al último mensaje
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [estado.mensajes]);

  const enviarMensaje = async () => {
    if (!input.trim() || estado.escribiendo) return;

    const nuevoMensaje: MensajeAsistente = {
      id: Date.now().toString(),
      rol: 'usuario',
      contenido: input,
      timestamp: new Date().toISOString(),
      metadata: { contexto },
    };

    setEstado(prev => ({
      ...prev,
      mensajes: [...prev.mensajes, nuevoMensaje],
      escribiendo: true,
    }));

    setInput('');

    try {
      // Llamar a la API del asistente
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: input,
          contexto,
          historial: estado.mensajes.slice(-10), // Últimos 10 mensajes
        }),
      });

      const data = await response.json();

      const respuestaAsistente: MensajeAsistente = {
        id: Date.now().toString(),
        rol: 'asistente',
        contenido: data.respuesta || 'Lo siento, hubo un error procesando tu mensaje.',
        timestamp: new Date().toISOString(),
        metadata: data.metadata,
      };

      setEstado(prev => ({
        ...prev,
        mensajes: [...prev.mensajes, respuestaAsistente],
        escribiendo: false,
      }));
    } catch (error) {
      console.error('Error comunicándose con el asistente:', error);

      const errorMensaje: MensajeAsistente = {
        id: Date.now().toString(),
        rol: 'sistema',
        contenido: 'Hubo un problema al comunicarme con el servidor. Por favor intenta de nuevo.',
        timestamp: new Date().toISOString(),
      };

      setEstado(prev => ({
        ...prev,
        mensajes: [...prev.mensajes, errorMensaje],
        escribiendo: false,
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  // Mensaje de bienvenida inicial
  useEffect(() => {
    if (estado.mensajes.length === 0) {
      const mensajeBienvenida: MensajeAsistente = {
        id: 'bienvenida',
        rol: 'asistente',
        contenido: `¡Hola! Soy ${nombreAsistente}, tu asistente virtual. Estoy aquí para ayudarte con tus tareas diarias, organizar información y responder tus preguntas. ¿En qué puedo ayudarte hoy?`,
        timestamp: new Date().toISOString(),
      };

      setEstado(prev => ({
        ...prev,
        mensajes: [mensajeBienvenida],
      }));
    }
  }, [nombreAsistente, estado.mensajes.length]);

  // Botón flotante cuando está cerrado
  if (!estado.abierto) {
    return (
      <button
        onClick={() => setEstado(prev => ({ ...prev, abierto: true }))}
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 group"
        aria-label="Abrir asistente virtual"
      >
        <div className="relative">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>

          {/* Badge de notificación si hay sugerencias */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            !
          </span>
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Hablar con {nombreAsistente}
        </div>
      </button>
    );
  }

  // Panel del asistente abierto
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all ${
        estado.minimizado ? 'w-80' : 'w-96'
      }`}
    >
      <Card className="shadow-2xl border-2 border-indigo-200">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                {/* Indicador de "activo" */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
              </div>

              <div>
                <CardTitle className="text-lg">{nombreAsistente}</CardTitle>
                <p className="text-xs text-indigo-100">Siempre disponible para ayudarte</p>
              </div>
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setEstado(prev => ({ ...prev, minimizado: !prev.minimizado }))}
              >
                {estado.minimizado ? '□' : '_'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setEstado(prev => ({ ...prev, abierto: false }))}
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>

        {!estado.minimizado && (
          <CardContent className="p-0">
            {/* Área de mensajes */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {estado.mensajes.map((mensaje) => (
                <div
                  key={mensaje.id}
                  className={`flex ${mensaje.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      mensaje.rol === 'usuario'
                        ? 'bg-indigo-600 text-white'
                        : mensaje.rol === 'sistema'
                        ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                        : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    }`}
                  >
                    {mensaje.rol === 'asistente' && (
                      <p className="text-xs font-semibold text-indigo-600 mb-1">{nombreAsistente}</p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{mensaje.contenido}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {new Date(mensaje.timestamp).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {estado.escribiendo && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-900 shadow-sm border border-gray-200 rounded-lg px-4 py-2">
                    <p className="text-xs font-semibold text-indigo-600 mb-1">{nombreAsistente}</p>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={mensajesEndRef} />
            </div>

            {/* Área de input */}
            <div className="border-t p-4 bg-white">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Pregúntale a ${nombreAsistente}...`}
                  className="flex-1 min-h-[60px] resize-none"
                  disabled={estado.escribiendo}
                />
                <Button
                  onClick={enviarMensaje}
                  disabled={!input.trim() || estado.escribiendo}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </Button>
              </div>

              {/* Contexto actual */}
              {contexto && (
                <div className="mt-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    Viendo: {contexto.pagina}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

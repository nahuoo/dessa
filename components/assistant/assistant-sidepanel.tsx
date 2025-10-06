'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { MensajeAsistente, EstadoChatAsistente, ContextoAwareness } from '@/types/assistant';

interface AssistantSidepanelProps {
  profesionalId: string;
  nombreAsistente?: string;
}

export function AssistantSidepanel({
  profesionalId: _profesionalId,
  nombreAsistente = 'Dessa'
}: AssistantSidepanelProps) {
  const [abierto, setAbierto] = useState(false);
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
    const interval = setInterval(detectarContexto, 2000);
    return () => clearInterval(interval);
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
      metadata: { contexto: contexto || undefined },
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

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      // Log para debugging
      if (!data.respuesta) {
        console.error('Error en respuesta del asistente:', data);
      }

      const respuestaAsistente: MensajeAsistente = {
        id: Date.now().toString(),
        rol: 'asistente',
        contenido: data.respuesta || `Error: ${data.error || 'No se pudo procesar el mensaje'}`,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  return (
    <>
      {/* Botón toggle en la barra superior derecha */}
      <Button
        onClick={() => setAbierto(!abierto)}
        variant={abierto ? "default" : "outline"}
        size="sm"
        className="fixed top-4 right-4 z-50 shadow-lg"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        {nombreAsistente}
      </Button>

      {/* Sidepanel - se desliza desde la derecha */}
      <div
        className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl transition-all duration-300 ease-in-out z-40 flex flex-col ${
          abierto ? 'w-96' : 'w-0'
        }`}
        style={{
          transform: abierto ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header del panel */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <h3 className="font-semibold text-white">{nombreAsistente}</h3>
          </div>
          <button
            onClick={() => setAbierto(false)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Indicador de contexto */}
        {contexto && (
          <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs text-indigo-600 dark:text-indigo-400">
              📍 {contexto.pagina}
              {contexto.consultante_id && ' • Consultante'}
              {contexto.sesion_id && ' • Sesión'}
            </p>
          </div>
        )}

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {estado.mensajes.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <p className="text-sm">¡Hola! Soy {nombreAsistente}</p>
              <p className="text-xs mt-2">¿En qué puedo ayudarte hoy?</p>
            </div>
          )}

          {estado.mensajes.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                  msg.rol === 'usuario'
                    ? 'bg-indigo-600 text-white'
                    : msg.rol === 'asistente'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.contenido}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {estado.escribiendo && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={mensajesEndRef} />
        </div>

        {/* Input de mensaje */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Pregúntale a ${nombreAsistente}...`}
              className="flex-1 resize-none min-h-[80px]"
              disabled={estado.escribiendo}
            />
            <Button
              onClick={enviarMensaje}
              disabled={!input.trim() || estado.escribiendo}
              className="self-end"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Presiona Enter para enviar, Shift+Enter para nueva línea
          </p>
        </div>
      </div>

      {/* Overlay para desplazar el contenido cuando el panel está abierto */}
      <style jsx global>{`
        body {
          transition: margin-right 300ms ease-in-out;
          margin-right: ${abierto ? '384px' : '0'};
        }
      `}</style>
    </>
  );
}

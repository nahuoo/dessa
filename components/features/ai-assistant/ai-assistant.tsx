'use client';

import { useState } from 'react';
import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AIAssistantProps {
  initialNotes?: string;
  onSuggestionAccept?: (suggestion: string) => void;
  type?: 'SESSION_SUMMARY' | 'THERAPEUTIC_GOALS' | 'PATTERN_ANALYSIS' | 'INTERVENTION_SUGGESTIONS';
}

export function AIAssistant({
  initialNotes = '',
  onSuggestionAccept,
  type = 'SESSION_SUMMARY'
}: AIAssistantProps) {
  const [_prompt, setPrompt] = useState('');
  const [showAssistant, setShowAssistant] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/ai/chat',
    body: {
      type,
    },
    initialMessages: initialNotes
      ? [
          {
            id: '1',
            role: 'user',
            content: `Aquí están mis notas de la sesión:\n\n${initialNotes}\n\nPor favor, ayúdame a generar un resumen profesional.`,
          },
        ]
      : [],
  });

  const handleQuickPrompt = (promptText: string) => {
    setPrompt(promptText);
    const syntheticEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;

    handleInputChange({
      target: { value: promptText },
    } as React.ChangeEvent<HTMLInputElement>);

    setTimeout(() => {
      handleSubmit(syntheticEvent);
    }, 100);
  };

  const quickPrompts = {
    SESSION_SUMMARY: [
      'Resume los puntos clave de esta sesión',
      'Identifica las emociones principales expresadas',
      'Sugiere objetivos para la próxima sesión',
    ],
    THERAPEUTIC_GOALS: [
      'Genera 5 objetivos terapéuticos SMART',
      'Prioriza los objetivos por importancia',
      'Sugiere métricas para medir el progreso',
    ],
    PATTERN_ANALYSIS: [
      'Identifica patrones recurrentes',
      'Analiza la evolución emocional',
      'Detecta áreas de mejora',
    ],
    INTERVENTION_SUGGESTIONS: [
      'Sugiere técnicas de CBT aplicables',
      'Recomienda ejercicios para el consultante',
      'Propón estrategias de afrontamiento',
    ],
  };

  if (!showAssistant) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-indigo-100 rounded-full p-3">
            <svg
              className="w-6 h-6 text-indigo-600"
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
          <h3 className="font-medium text-gray-900">Asistente de IA</h3>
          <p className="text-sm text-gray-600">
            Obtén ayuda para resumir notas, generar objetivos y más
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowAssistant(true)}
          >
            Activar asistente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-indigo-600"
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
            Asistente de IA
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAssistant(false)}
          >
            Cerrar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error.message || 'Error al comunicarse con el asistente de IA'}
          </div>
        )}

        {/* Prompts rápidos */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Sugerencias rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts[type].map((promptText, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleQuickPrompt(promptText)}
                disabled={isLoading}
                className="px-3 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 disabled:opacity-50"
              >
                {promptText}
              </button>
            ))}
          </div>
        </div>

        {/* Mensajes del chat */}
        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-indigo-50 ml-8'
                  : 'bg-gray-50 mr-8'
              }`}
            >
              <p className="text-xs font-semibold text-gray-600 mb-1">
                {message.role === 'user' ? 'Tú' : 'Asistente'}
              </p>
              <div className="text-sm text-gray-900 whitespace-pre-line">
                {message.content}
              </div>
              {message.role === 'assistant' && onSuggestionAccept && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => onSuggestionAccept(message.content)}
                >
                  Usar esta sugerencia
                </Button>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="bg-gray-50 mr-8 p-3 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 mb-1">
                Asistente
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-pulse">Escribiendo...</div>
              </div>
            </div>
          )}
        </div>

        {/* Input del chat */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Escribe tu pregunta o solicitud..."
            rows={2}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? 'Enviando...' : 'Enviar'}
          </Button>
        </form>

        <p className="text-xs text-gray-500 mt-2">
          💡 El asistente de IA está aquí para ayudarte, pero siempre revisa
          y adapta sus sugerencias a tu criterio profesional.
        </p>
      </CardContent>
    </Card>
  );
}

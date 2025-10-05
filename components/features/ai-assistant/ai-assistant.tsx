'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AIAssistantProps {
  initialNotes?: string;
  onSuggestionAccept?: (suggestion: string) => void;
  type?: 'SESSION_SUMMARY' | 'THERAPEUTIC_GOALS' | 'PATTERN_ANALYSIS' | 'INTERVENTION_SUGGESTIONS';
}

export function AIAssistant({
  initialNotes: _initialNotes = '',
  onSuggestionAccept: _onSuggestionAccept,
  type: _type = 'SESSION_SUMMARY'
}: AIAssistantProps) {
  const [showAssistant, setShowAssistant] = useState(false);

  // TODO: Actualizar a la nueva API de useChat en ai-sdk v5
  // Componente temporalmente deshabilitado hasta actualizar a la nueva API

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
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          <p className="font-medium">Función temporalmente deshabilitada</p>
          <p className="text-sm mt-1">
            El asistente de IA está siendo actualizado para funcionar con la última versión de la biblioteca.
            Estará disponible próximamente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

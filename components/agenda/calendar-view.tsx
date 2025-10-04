'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CalendarEvent {
  id: string;
  fecha_hora: string;
  consultante_nombre: string;
  duracion: number;
  estado: 'confirmada' | 'pendiente' | 'cancelada' | 'completada';
  modalidad: 'presencial' | 'videollamada' | 'telefónica';
}

interface CalendarViewProps {
  citas: CalendarEvent[];
}

export function CalendarView({ citas }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const router = useRouter();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Lunes
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getCitasForDay = (day: Date) => {
    return citas.filter(cita => {
      const citaDate = new Date(cita.fecha_hora);
      return isSameDay(citaDate, day);
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'cancelada':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'completada':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDayClick = (day: Date) => {
    // Formatear la fecha para el input datetime-local
    const dateStr = format(day, "yyyy-MM-dd'T'HH:mm");
    router.push(`/agenda/nueva?fecha=${dateStr}`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoy
          </Button>
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="p-4">
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {/* Day Headers */}
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
            <div
              key={day}
              className="bg-gray-50 p-2 text-center text-sm font-semibold text-gray-700"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map(day => {
            const dayEvents = getCitasForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isDayToday = isToday(day);
            const isDayPast = isPast(day) && !isDayToday;

            return (
              <div
                key={day.toISOString()}
                className={`bg-white p-2 min-h-[100px] relative group ${
                  !isCurrentMonth ? 'opacity-40' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div
                    className={`text-sm font-medium ${
                      isDayToday
                        ? 'bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center'
                        : 'text-gray-900'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                  {/* Botón para agregar cita (solo días futuros o hoy) */}
                  {!isDayPast && isCurrentMonth && (
                    <button
                      onClick={() => handleDayClick(day)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-indigo-100 rounded"
                      title="Agregar cita"
                    >
                      <Plus className="w-3 h-3 text-indigo-600" />
                    </button>
                  )}
                </div>

                {/* Events for this day */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(cita => (
                    <Link
                      key={cita.id}
                      href={`/agenda/${cita.id}`}
                      className={`block text-xs p-1 rounded border hover:shadow-sm transition-shadow ${getEstadoColor(
                        cita.estado
                      )}`}
                    >
                      <div className="font-medium truncate">
                        {format(new Date(cita.fecha_hora), 'HH:mm')}
                      </div>
                      <div className="truncate">
                        {cita.consultante_nombre}
                      </div>
                    </Link>
                  ))}

                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 pl-1">
                      +{dayEvents.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border bg-green-100 border-green-300"></div>
          <span>Confirmada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border bg-yellow-100 border-yellow-300"></div>
          <span>Pendiente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border bg-blue-100 border-blue-300"></div>
          <span>Completada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border bg-red-100 border-red-300"></div>
          <span>Cancelada</span>
        </div>
      </div>
    </div>
  );
}

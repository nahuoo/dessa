'use client';

import { Card } from '@/components/ui/card';
import { Calendar, Clock, User } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  fecha: string;
  consultanteNombre: string;
  tipo: string;
  hora?: string;
}

interface ActivityFeedProps {
  title: string;
  items: ActivityItem[];
  emptyMessage: string;
  linkHref?: string;
  linkText?: string;
  isUpcoming?: boolean;
}

export function ActivityFeed({
  title,
  items,
  emptyMessage,
  linkHref,
  linkText,
  isUpcoming = false,
}: ActivityFeedProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {linkHref && linkText && (
          <Link
            href={linkHref}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            {linkText} →
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">{emptyMessage}</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <div className="rounded-full bg-indigo-100 p-2 mt-1">
                {isUpcoming ? (
                  <Calendar className="h-4 w-4 text-indigo-600" />
                ) : (
                  <Clock className="h-4 w-4 text-indigo-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.consultanteNombre}
                  </p>
                </div>

                <p className="text-sm text-gray-600 mt-1">
                  {item.tipo === 'individual'
                    ? 'Sesión individual'
                    : item.tipo === 'pareja'
                      ? 'Terapia de pareja'
                      : item.tipo === 'familiar'
                        ? 'Terapia familiar'
                        : item.tipo === 'grupal'
                          ? 'Sesión grupal'
                          : 'Sesión'}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500">
                    {format(parseISO(item.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                  {item.hora && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-xs text-gray-500">{item.hora}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

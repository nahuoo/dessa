'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  getNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  eliminarNotificacion
} from '@/app/actions/notifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell, Check, Trash2, X } from 'lucide-react';

interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  link?: string;
  leida: boolean;
  created_at: string;
  metadata?: unknown;
}

interface NotificationsPanelProps {
  initialCount?: number;
}

export function NotificationsPanel({ initialCount = 0 }: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cargar notificaciones al abrir el panel
  useEffect(() => {
    if (isOpen) {
      loadNotificaciones();
    }
  }, [isOpen]);

  // Click fuera del panel para cerrar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const loadNotificaciones = async () => {
    setLoading(true);
    try {
      const { data } = await getNotificaciones();
      setNotificaciones(data || []);
      const unread = data?.filter(n => !n.leida).length || 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notif: Notificacion) => {
    if (!notif.leida) {
      await marcarNotificacionLeida(notif.id);
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    if (notif.link) {
      router.push(notif.link);
    }

    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    await marcarTodasLeidas();
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await eliminarNotificacion(id);
    setNotificaciones(prev => prev.filter(n => n.id !== id));
    const deletedNotif = notificaciones.find(n => n.id === id);
    if (deletedNotif && !deletedNotif.leida) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'cita_proxima':
        return '📅';
      case 'tarea_pendiente':
        return '✓';
      case 'sistema':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Marcar todas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm text-gray-500">Cargando...</p>
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No tienes notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notificaciones.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notif.leida ? 'bg-indigo-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notif.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${!notif.leida ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notif.titulo}
                          </p>
                          <button
                            onClick={(e) => handleDelete(notif.id, e)}
                            className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notif.mensaje}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notif.created_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                      {!notif.leida && (
                        <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

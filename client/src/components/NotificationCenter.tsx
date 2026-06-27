import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  Trash2,
  Settings,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface Notification {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationCenterProps {
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onClearAll?: () => void;
  onMarkAsRead?: (id: string) => void;
}

export default function NotificationCenter({
  notifications = [],
  onNotificationClick,
  onClearAll,
  onMarkAsRead,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unread = notifications.filter((n) => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle size={18} className="text-[#10b981]" />;
      case "error":
        return <AlertCircle size={18} className="text-red-500" />;
      case "warning":
        return <AlertCircle size={18} className="text-orange-500" />;
      case "info":
        return <Info size={18} className="text-blue-500" />;
      default:
        return <Bell size={18} className="text-[#94a3b8]" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-[#10b981]/10 border-[#10b981]/30";
      case "error":
        return "bg-red-500/10 border-red-500/30";
      case "warning":
        return "bg-orange-500/10 border-orange-500/30";
      case "info":
        return "bg-blue-500/10 border-blue-500/30";
      default:
        return "bg-[#1e293b] border-[#1e293b]";
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-[#1e293b] transition-colors"
        title="Notificações"
      >
        <Bell size={20} className="text-[#94a3b8]" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-[#111827] border border-[#1e293b] rounded-lg shadow-2xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Bell size={18} className="text-[#10b981]" />
              Notificações
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-[#1e293b] rounded transition-colors"
            >
              <X size={18} className="text-[#94a3b8]" />
            </button>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={32} className="text-[#1e293b] mx-auto mb-2" />
              <p className="text-[#64748b]">Nenhuma notificação no momento</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-2 p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-[#10b981]/50 ${getTypeColor(
                      notification.type
                    )} ${!notification.read ? "bg-opacity-50" : ""}`}
                    onClick={() => {
                      onNotificationClick?.(notification);
                      onMarkAsRead?.(notification.id);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold text-sm">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-[#10b981] rounded-full" />
                          )}
                        </div>
                        <p className="text-[#94a3b8] text-xs mt-1">
                          {notification.message}
                        </p>
                        <p className="text-[#64748b] text-xs mt-2">
                          {formatDistanceToNow(notification.timestamp, {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                        {notification.actionUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 h-7 text-xs border-[#10b981] text-[#10b981] hover:bg-[#10b981]/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = notification.actionUrl!;
                            }}
                          >
                            {notification.actionLabel || "Ver Detalhes"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Footer Actions */}
          {notifications.length > 0 && (
            <div className="flex gap-2 p-3 border-t border-[#1e293b] bg-[#0c1322]">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs border-[#1e293b] text-[#94a3b8]"
                onClick={onClearAll}
              >
                <Trash2 size={14} className="mr-1" />
                Limpar Tudo
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs border-[#1e293b] text-[#94a3b8]"
              >
                <Settings size={14} className="mr-1" />
                Preferências
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

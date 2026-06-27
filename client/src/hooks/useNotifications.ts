import { useState, useEffect, useCallback } from "react";
import { Notification } from "@/components/NotificationCenter";
import { notificationService } from "@/services/notificationService";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Subscribe to notification changes
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    // Initialize with current notifications
    setNotifications(notificationService.getAll());

    return unsubscribe;
  }, []);

  const markAsRead = useCallback((id: string) => {
    notificationService.markAsRead(id);
  }, []);

  const remove = useCallback((id: string) => {
    notificationService.remove(id);
  }, []);

  const clearAll = useCallback(() => {
    notificationService.clearAll();
  }, []);

  const success = useCallback(
    (title: string, message: string, actionUrl?: string, actionLabel?: string) => {
      return notificationService.success(title, message, actionUrl, actionLabel);
    },
    []
  );

  const error = useCallback(
    (title: string, message: string, actionUrl?: string, actionLabel?: string) => {
      return notificationService.error(title, message, actionUrl, actionLabel);
    },
    []
  );

  const warning = useCallback(
    (title: string, message: string, actionUrl?: string, actionLabel?: string) => {
      return notificationService.warning(title, message, actionUrl, actionLabel);
    },
    []
  );

  const info = useCallback(
    (title: string, message: string, actionUrl?: string, actionLabel?: string) => {
      return notificationService.info(title, message, actionUrl, actionLabel);
    },
    []
  );

  return {
    notifications,
    markAsRead,
    remove,
    clearAll,
    success,
    error,
    warning,
    info,
  };
}

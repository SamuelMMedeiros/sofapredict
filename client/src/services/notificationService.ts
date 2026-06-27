import { Notification } from "@/components/NotificationCenter";

class NotificationService {
  private notifications: Map<string, Notification> = new Map();
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  /**
   * Subscribe to notification changes
   */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all subscribers
   */
  private notify() {
    const notifications = Array.from(this.notifications.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    this.listeners.forEach((listener) => listener(notifications));
  }

  /**
   * Add a new notification
   */
  add(notification: Omit<Notification, "id" | "timestamp" | "read">): Notification {
    const id = `${Date.now()}-${Math.random()}`;
    const fullNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false,
    };

    this.notifications.set(id, fullNotification);
    this.notify();

    // Auto-remove after 10 seconds for info notifications
    if (notification.type === "info") {
      setTimeout(() => this.remove(id), 10000);
    }

    return fullNotification;
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string) {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
      this.notify();
    }
  }

  /**
   * Remove a notification
   */
  remove(id: string) {
    this.notifications.delete(id);
    this.notify();
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications.clear();
    this.notify();
  }

  /**
   * Get all notifications
   */
  getAll(): Notification[] {
    return Array.from(this.notifications.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return Array.from(this.notifications.values()).filter((n) => !n.read).length;
  }

  /**
   * Success notification
   */
  success(title: string, message: string, actionUrl?: string, actionLabel?: string) {
    return this.add({
      type: "success",
      title,
      message,
      actionUrl,
      actionLabel,
    });
  }

  /**
   * Error notification
   */
  error(title: string, message: string, actionUrl?: string, actionLabel?: string) {
    return this.add({
      type: "error",
      title,
      message,
      actionUrl,
      actionLabel,
    });
  }

  /**
   * Warning notification
   */
  warning(title: string, message: string, actionUrl?: string, actionLabel?: string) {
    return this.add({
      type: "warning",
      title,
      message,
      actionUrl,
      actionLabel,
    });
  }

  /**
   * Info notification
   */
  info(title: string, message: string, actionUrl?: string, actionLabel?: string) {
    return this.add({
      type: "info",
      title,
      message,
      actionUrl,
      actionLabel,
    });
  }

  /**
   * Trial expiring notification
   */
  trialExpiring(daysRemaining: number) {
    return this.warning(
      "Teste Expirando em Breve",
      `Seu período de teste gratuito expira em ${daysRemaining} ${
        daysRemaining === 1 ? "dia" : "dias"
      }. Escolha um plano para continuar usando.`,
      "/pricing",
      "Ver Planos"
    );
  }

  /**
   * Payment confirmed notification
   */
  paymentConfirmed(planName: string) {
    return this.success(
      "Pagamento Confirmado",
      `Sua subscrição ao plano ${planName} foi ativada com sucesso!`,
      "/dashboard",
      "Ir para Dashboard"
    );
  }

  /**
   * Bet result notification
   */
  betResult(betId: string, result: "win" | "loss" | "draw", profit?: number) {
    const title = result === "win" ? "✅ Aposta Vencida!" : "❌ Aposta Perdida";
    const message =
      result === "win"
        ? `Sua aposta #${betId} foi vencida! Lucro: R$ ${profit?.toFixed(2) || "0.00"}`
        : `Sua aposta #${betId} foi perdida.`;

    return this.add({
      type: result === "win" ? "success" : "error",
      title,
      message,
      actionUrl: `/betting-history/${betId}`,
      actionLabel: "Ver Detalhes",
    });
  }

  /**
   * Arbitrage opportunity notification
   */
  arbitrageOpportunity(matchName: string, roi: number) {
    return this.add({
      type: "success",
      title: "🎯 Oportunidade de Arbitragem",
      message: `Surebet detectada em ${matchName} com ROI de ${roi.toFixed(2)}%`,
      actionUrl: "/surebet-calculator",
      actionLabel: "Ver Detalhes",
    });
  }

  /**
   * AI recommendation notification
   */
  aiRecommendation(matchName: string, confidence: number) {
    return this.add({
      type: "info",
      title: "🤖 Recomendação de IA",
      message: `Nova recomendação para ${matchName} com ${confidence}% de confiança`,
      actionUrl: "/ai-recommendations",
      actionLabel: "Ver Recomendação",
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

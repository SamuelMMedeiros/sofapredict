/**
 * Payment Gateway Integration
 * Supports: Pix (via Asaas), Credit Card, Telegram Stars, PayPal
 */

import axios from "axios";
import { encryptData, decryptData } from "./encryption";

// ============================================================================
// PIX PAYMENT (via Asaas - Brazilian Payment Gateway)
// ============================================================================

interface AsaasPixConfig {
  apiKey: string;
  baseUrl: string;
}

export class PixPaymentGateway {
  private config: AsaasPixConfig;

  constructor() {
    this.config = {
      apiKey: process.env.ASAAS_API_KEY || "",
      baseUrl: "https://api.asaas.com/v3",
    };

    if (!this.config.apiKey) {
      console.warn("[Pix] ASAAS_API_KEY not configured");
    }
  }

  /**
   * Create a Pix payment charge
   */
  async createPixCharge(params: {
    customerId: string;
    amount: number;
    description: string;
    dueDate: string;
    notificationUrl?: string;
  }) {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/payments`,
        {
          customer: params.customerId,
          billingType: "PIX",
          value: params.amount,
          description: params.description,
          dueDate: params.dueDate,
          notificationUrl: params.notificationUrl,
        },
        {
          headers: {
            "access-token": this.config.apiKey,
          },
        }
      );

      return {
        success: true,
        paymentId: response.data.id,
        pixQrCode: response.data.pixQrCode,
        pixCopyPaste: response.data.pixCopyPaste,
        externalId: response.data.id,
        status: response.data.status,
      };
    } catch (error) {
      console.error("[Pix] Error creating charge:", error);
      return {
        success: false,
        error: "Failed to create Pix charge",
      };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string) {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/payments/${paymentId}`,
        {
          headers: {
            "access-token": this.config.apiKey,
          },
        }
      );

      return {
        status: response.data.status,
        value: response.data.value,
        confirmedDate: response.data.confirmedDate,
      };
    } catch (error) {
      console.error("[Pix] Error getting payment status:", error);
      return null;
    }
  }

  /**
   * Create a customer in Asaas
   */
  async createCustomer(params: {
    name: string;
    email: string;
    cpfCnpj?: string;
    phone?: string;
  }) {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/customers`,
        {
          name: params.name,
          email: params.email,
          cpfCnpj: params.cpfCnpj,
          phone: params.phone,
        },
        {
          headers: {
            "access-token": this.config.apiKey,
          },
        }
      );

      return {
        success: true,
        customerId: response.data.id,
      };
    } catch (error) {
      console.error("[Pix] Error creating customer:", error);
      return {
        success: false,
        error: "Failed to create customer",
      };
    }
  }
}

// ============================================================================
// CREDIT CARD PAYMENT (via Stripe)
// ============================================================================

interface StripeConfig {
  apiKey: string;
}

export class CreditCardPaymentGateway {
  private config: StripeConfig;

  constructor() {
    this.config = {
      apiKey: process.env.STRIPE_SECRET_KEY || "",
    };

    if (!this.config.apiKey) {
      console.warn("[Credit Card] STRIPE_SECRET_KEY not configured");
    }
  }

  /**
   * Create payment intent for credit card
   */
  async createPaymentIntent(params: {
    amount: number; // in cents
    currency: string;
    description: string;
    customerId?: string;
    metadata?: Record<string, string>;
  }) {
    try {
      const response = await axios.post(
        "https://api.stripe.com/v1/payment_intents",
        {
          amount: params.amount,
          currency: params.currency,
          description: params.description,
          customer: params.customerId,
          metadata: params.metadata,
        },
        {
          auth: {
            username: this.config.apiKey,
            password: "",
          },
        }
      );

      return {
        success: true,
        clientSecret: response.data.client_secret,
        paymentIntentId: response.data.id,
        status: response.data.status,
      };
    } catch (error) {
      console.error("[Credit Card] Error creating payment intent:", error);
      return {
        success: false,
        error: "Failed to create payment intent",
      };
    }
  }

  /**
   * Confirm payment intent
   */
  async confirmPayment(paymentIntentId: string) {
    try {
      const response = await axios.post(
        `https://api.stripe.com/v1/payment_intents/${paymentIntentId}/confirm`,
        {},
        {
          auth: {
            username: this.config.apiKey,
            password: "",
          },
        }
      );

      return {
        success: response.data.status === "succeeded",
        status: response.data.status,
        chargeId: response.data.charges.data[0]?.id,
      };
    } catch (error) {
      console.error("[Credit Card] Error confirming payment:", error);
      return {
        success: false,
        error: "Failed to confirm payment",
      };
    }
  }
}

// ============================================================================
// TELEGRAM STARS PAYMENT
// ============================================================================

interface TelegramStarsConfig {
  botToken: string;
}

export class TelegramStarsPaymentGateway {
  private config: TelegramStarsConfig;

  constructor() {
    this.config = {
      botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    };

    if (!this.config.botToken) {
      console.warn("[Telegram Stars] TELEGRAM_BOT_TOKEN not configured");
    }
  }

  /**
   * Create invoice for Telegram Stars payment
   */
  async createInvoice(params: {
    title: string;
    description: string;
    payload: string;
    currency: string;
    prices: Array<{ label: string; amount: number }>;
  }) {
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${this.config.botToken}/createInvoiceLink`,
        {
          title: params.title,
          description: params.description,
          payload: params.payload,
          currency: params.currency,
          prices: params.prices,
        }
      );

      return {
        success: true,
        invoiceLink: response.data.result,
      };
    } catch (error) {
      console.error("[Telegram Stars] Error creating invoice:", error);
      return {
        success: false,
        error: "Failed to create Telegram Stars invoice",
      };
    }
  }
}

// ============================================================================
// PAYPAL PAYMENT
// ============================================================================

interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  mode: "sandbox" | "live";
}

export class PayPalPaymentGateway {
  private config: PayPalConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      clientId: process.env.PAYPAL_CLIENT_ID || "",
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
      mode: (process.env.PAYPAL_MODE as "sandbox" | "live") || "sandbox",
    };

    this.baseUrl =
      this.config.mode === "sandbox"
        ? "https://api.sandbox.paypal.com"
        : "https://api.paypal.com";

    if (!this.config.clientId || !this.config.clientSecret) {
      console.warn("[PayPal] PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not configured");
    }
  }

  /**
   * Get access token
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        "grant_type=client_credentials",
        {
          auth: {
            username: this.config.clientId,
            password: this.config.clientSecret,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error("[PayPal] Error getting access token:", error);
      return null;
    }
  }

  /**
   * Create order
   */
  async createOrder(params: {
    amount: string;
    currency: string;
    description: string;
    returnUrl: string;
    cancelUrl: string;
  }) {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: "Failed to authenticate with PayPal" };
      }

      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders`,
        {
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: params.currency,
                value: params.amount,
              },
              description: params.description,
            },
          ],
          return_url: params.returnUrl,
          cancel_url: params.cancelUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return {
        success: true,
        orderId: response.data.id,
        approvalUrl: response.data.links.find((l: any) => l.rel === "approve")?.href,
      };
    } catch (error) {
      console.error("[PayPal] Error creating order:", error);
      return {
        success: false,
        error: "Failed to create PayPal order",
      };
    }
  }

  /**
   * Capture order
   */
  async captureOrder(orderId: string) {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: "Failed to authenticate with PayPal" };
      }

      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return {
        success: response.data.status === "COMPLETED",
        orderId: response.data.id,
        status: response.data.status,
      };
    } catch (error) {
      console.error("[PayPal] Error capturing order:", error);
      return {
        success: false,
        error: "Failed to capture PayPal order",
      };
    }
  }
}

// ============================================================================
// Payment Gateway Factory
// ============================================================================

export class PaymentGatewayFactory {
  static getPix(): PixPaymentGateway {
    return new PixPaymentGateway();
  }

  static getCreditCard(): CreditCardPaymentGateway {
    return new CreditCardPaymentGateway();
  }

  static getTelegramStars(): TelegramStarsPaymentGateway {
    return new TelegramStarsPaymentGateway();
  }

  static getPayPal(): PayPalPaymentGateway {
    return new PayPalPaymentGateway();
  }
}

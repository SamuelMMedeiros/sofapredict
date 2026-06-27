/**
 * Payment Webhook Handlers
 * Automatically verifies payments and activates subscriptions
 */

import { getDb } from "./db";
import { payments, userSubscriptions } from "../drizzle/subscription-schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

/**
 * Handle Asaas (Pix) Webhook
 * Verifies Pix payment and activates subscription
 */
export async function handleAsaasWebhook(body: any, signature: string) {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    // Verify webhook signature
    const secret = process.env.ASAAS_WEBHOOK_SECRET || "";
    const hash = crypto.createHmac("sha256", secret).update(JSON.stringify(body)).digest("hex");

    if (hash !== signature) {
      console.warn("[Asaas] Invalid webhook signature");
      return { success: false, error: "Invalid signature" };
    }

    // Handle payment confirmation
    if (body.event === "payment_confirmed") {
      const paymentId = body.payment.id;

      // Find payment record
      const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.externalPaymentId, paymentId))
        .limit(1);

      if (payment.length === 0) {
        console.warn("[Asaas] Payment not found:", paymentId);
        return { success: false, error: "Payment not found" };
      }

      const paymentRecord = payment[0];

      // Update payment status
      await db
        .update(payments)
        .set({
          status: "completed",
          completedAt: new Date(),
        })
        .where(eq(payments.id, paymentRecord.id));

      // Activate subscription
      if (paymentRecord.subscriptionId) {
        await db
          .update(userSubscriptions)
          .set({
            status: "active",
          })
          .where(eq(userSubscriptions.id, paymentRecord.subscriptionId));

        console.log(
          `[Asaas] Subscription ${paymentRecord.subscriptionId} activated for user ${paymentRecord.userId}`
        );
      }

      return { success: true, message: "Payment confirmed and subscription activated" };
    }

    // Handle payment failure
    if (body.event === "payment_failed") {
      const paymentId = body.payment.id;

      const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.externalPaymentId, paymentId))
        .limit(1);

      if (payment.length > 0) {
        await db
          .update(payments)
          .set({
            status: "failed",
            failureReason: body.payment.failureReason || "Payment declined",
          })
          .where(eq(payments.id, payment[0].id));

        console.log(`[Asaas] Payment ${paymentId} failed`);
      }

      return { success: true, message: "Payment failure recorded" };
    }

    return { success: true, message: "Webhook processed" };
  } catch (error) {
    console.error("[Asaas] Webhook error:", error);
    return { success: false, error: "Webhook processing failed" };
  }
}

/**
 * Handle Stripe Webhook
 * Verifies credit card payment and activates subscription
 */
export async function handleStripeWebhook(body: any, signature: string) {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    // Verify webhook signature
    const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
    const hash = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(body))
      .digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))) {
      console.warn("[Stripe] Invalid webhook signature");
      return { success: false, error: "Invalid signature" };
    }

    // Handle payment intent succeeded
    if (body.type === "payment_intent.succeeded") {
      const paymentIntentId = body.data.object.id;

      const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.externalPaymentId, paymentIntentId))
        .limit(1);

      if (payment.length === 0) {
        console.warn("[Stripe] Payment intent not found:", paymentIntentId);
        return { success: false, error: "Payment not found" };
      }

      const paymentRecord = payment[0];

      // Update payment status
      await db
        .update(payments)
        .set({
          status: "completed",
          completedAt: new Date(),
          externalTransactionId: body.data.object.charges.data[0]?.id,
        })
        .where(eq(payments.id, paymentRecord.id));

      // Activate subscription
      if (paymentRecord.subscriptionId) {
        await db
          .update(userSubscriptions)
          .set({
            status: "active",
          })
          .where(eq(userSubscriptions.id, paymentRecord.subscriptionId));

        console.log(
          `[Stripe] Subscription ${paymentRecord.subscriptionId} activated for user ${paymentRecord.userId}`
        );
      }

      return { success: true, message: "Payment confirmed and subscription activated" };
    }

    // Handle payment intent failed
    if (body.type === "payment_intent.payment_failed") {
      const paymentIntentId = body.data.object.id;

      const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.externalPaymentId, paymentIntentId))
        .limit(1);

      if (payment.length > 0) {
        await db
          .update(payments)
          .set({
            status: "failed",
            failureReason: body.data.object.last_payment_error?.message || "Payment declined",
          })
          .where(eq(payments.id, payment[0].id));

        console.log(`[Stripe] Payment ${paymentIntentId} failed`);
      }

      return { success: true, message: "Payment failure recorded" };
    }

    return { success: true, message: "Webhook processed" };
  } catch (error) {
    console.error("[Stripe] Webhook error:", error);
    return { success: false, error: "Webhook processing failed" };
  }
}

/**
 * Handle PayPal Webhook
 * Verifies PayPal payment and activates subscription
 */
export async function handlePayPalWebhook(body: any) {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    // Handle payment completed
    if (body.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const orderId = body.resource.id;

      const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.externalPaymentId, orderId))
        .limit(1);

      if (payment.length === 0) {
        console.warn("[PayPal] Payment not found:", orderId);
        return { success: false, error: "Payment not found" };
      }

      const paymentRecord = payment[0];

      // Update payment status
      await db
        .update(payments)
        .set({
          status: "completed",
          completedAt: new Date(),
          externalTransactionId: body.resource.id,
        })
        .where(eq(payments.id, paymentRecord.id));

      // Activate subscription
      if (paymentRecord.subscriptionId) {
        await db
          .update(userSubscriptions)
          .set({
            status: "active",
          })
          .where(eq(userSubscriptions.id, paymentRecord.subscriptionId));

        console.log(
          `[PayPal] Subscription ${paymentRecord.subscriptionId} activated for user ${paymentRecord.userId}`
        );
      }

      return { success: true, message: "Payment confirmed and subscription activated" };
    }

    // Handle payment denied
    if (body.event_type === "PAYMENT.CAPTURE.DENIED") {
      const orderId = body.resource.id;

      const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.externalPaymentId, orderId))
        .limit(1);

      if (payment.length > 0) {
        await db
          .update(payments)
          .set({
            status: "failed",
            failureReason: "Payment denied by PayPal",
          })
          .where(eq(payments.id, payment[0].id));

        console.log(`[PayPal] Payment ${orderId} denied`);
      }

      return { success: true, message: "Payment denial recorded" };
    }

    return { success: true, message: "Webhook processed" };
  } catch (error) {
    console.error("[PayPal] Webhook error:", error);
    return { success: false, error: "Webhook processing failed" };
  }
}

/**
 * Handle Telegram Stars Webhook
 * Verifies Telegram Stars payment and activates subscription
 */
export async function handleTelegramStarsWebhook(body: any) {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    // Handle successful payment
    if (body.successful_payment) {
      const telegramPaymentChargeId = body.successful_payment.telegram_payment_charge_id;

      const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.externalTransactionId, telegramPaymentChargeId))
        .limit(1);

      if (payment.length === 0) {
        console.warn("[Telegram] Payment not found:", telegramPaymentChargeId);
        return { success: false, error: "Payment not found" };
      }

      const paymentRecord = payment[0];

      // Update payment status
      await db
        .update(payments)
        .set({
          status: "completed",
          completedAt: new Date(),
        })
        .where(eq(payments.id, paymentRecord.id));

      // Activate subscription
      if (paymentRecord.subscriptionId) {
        await db
          .update(userSubscriptions)
          .set({
            status: "active",
          })
          .where(eq(userSubscriptions.id, paymentRecord.subscriptionId));

        console.log(
          `[Telegram] Subscription ${paymentRecord.subscriptionId} activated for user ${paymentRecord.userId}`
        );
      }

      return { success: true, message: "Payment confirmed and subscription activated" };
    }

    return { success: true, message: "Webhook processed" };
  } catch (error) {
    console.error("[Telegram] Webhook error:", error);
    return { success: false, error: "Webhook processing failed" };
  }
}

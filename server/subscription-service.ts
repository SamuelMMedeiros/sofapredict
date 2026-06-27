/**
 * Subscription Management Service
 * Handles subscription lifecycle, upgrades, downgrades, and cancellations
 */

import { getDb } from "./db";
import { userSubscriptions, payments, subscriptionPlans, userPaymentMethods } from "../drizzle/subscription-schema";
import { eq, and } from "drizzle-orm";
import { PaymentGatewayFactory } from "./payment-gateway";

export interface SubscriptionFeatures {
  maxFavoriteTeams: number;
  maxBetsPerMonth: number;
  accessToAiAnalysis: boolean;
  accessToSurebet: boolean;
  accessToRadar: boolean;
  accessToMetrics: boolean;
  accessToExport: boolean;
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, "active")
        )
      )
      .limit(1);

    if (subscription.length === 0) return null;

    // Get plan details
    const plan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, subscription[0].planId))
      .limit(1);

    return {
      subscription: subscription[0],
      plan: plan[0],
    };
  } catch (error) {
    console.error("[Subscription] Error getting user subscription:", error);
    return null;
  }
}

/**
 * Get user's subscription features
 */
export async function getUserSubscriptionFeatures(userId: number): Promise<SubscriptionFeatures> {
  const db = await getDb();
  if (!db) {
    // Return free tier features
    return {
      maxFavoriteTeams: 1,
      maxBetsPerMonth: 5,
      accessToAiAnalysis: false,
      accessToSurebet: false,
      accessToRadar: false,
      accessToMetrics: false,
      accessToExport: false,
    };
  }

  try {
    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      // Return free tier features
      return {
        maxFavoriteTeams: 1,
        maxBetsPerMonth: 5,
        accessToAiAnalysis: false,
        accessToSurebet: false,
        accessToRadar: false,
        accessToMetrics: false,
        accessToExport: false,
      };
    }

    const plan = subscription.plan;
    return {
      maxFavoriteTeams: plan.maxFavoriteTeams || 1,
      maxBetsPerMonth: plan.maxBetsPerMonth || 5,
      accessToAiAnalysis: plan.accessToAiAnalysis || false,
      accessToSurebet: plan.accessToSurebet || false,
      accessToRadar: plan.accessToRadar || false,
      accessToMetrics: plan.accessToMetrics || false,
      accessToExport: plan.accessToExport || false,
    };
  } catch (error) {
    console.error("[Subscription] Error getting subscription features:", error);
    // Return free tier on error
    return {
      maxFavoriteTeams: 1,
      maxBetsPerMonth: 5,
      accessToAiAnalysis: false,
      accessToSurebet: false,
      accessToRadar: false,
      accessToMetrics: false,
      accessToExport: false,
    };
  }
}

/**
 * Create subscription with Pix payment
 */
export async function createPixSubscription(params: {
  userId: number;
  planId: number;
  userEmail: string;
  userName: string;
  userCpf?: string;
}) {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    // Get plan details
    const plan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, params.planId))
      .limit(1);

    if (plan.length === 0) {
      return { success: false, error: "Plan not found" };
    }

    const planData = plan[0];

    // Create Asaas customer
    const pix = PaymentGatewayFactory.getPix();
    const customerResult = await pix.createCustomer({
      name: params.userName,
      email: params.userEmail,
      cpfCnpj: params.userCpf,
    });

    if (!customerResult.success) {
      return { success: false, error: "Failed to create customer" };
    }

    // Create Pix charge
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // 3 days to pay

    const chargeResult = await pix.createPixCharge({
      customerId: customerResult.customerId,
      amount: parseFloat(planData.priceMonthly.toString()),
      description: `SofaPredict - ${planData.name} Plan`,
      dueDate: dueDate.toISOString().split("T")[0],
      notificationUrl: `${process.env.APP_URL}/api/webhooks/pix`,
    });

    if (!chargeResult.success) {
      return { success: false, error: "Failed to create Pix charge" };
    }

    // Create subscription record
    const now = new Date();
    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1);

    const subscriptionResult = await db.insert(userSubscriptions).values({
      userId: params.userId,
      planId: params.planId,
      status: "pending",
      billingCycle: "monthly",
      currentPeriodStart: now,
      currentPeriodEnd: nextBilling,
      nextBillingDate: nextBilling,
    });

    const subscriptionId = (subscriptionResult as any).insertId || 1;

    // Create payment record
    await db.insert(payments).values({
      userId: params.userId,
      subscriptionId: subscriptionId,
      amount: planData.priceMonthly,
      currency: "BRL",
      paymentMethod: "pix",
      externalPaymentId: chargeResult.paymentId,
      status: "pending",
    });

    return {
      success: true,
      subscriptionId: subscriptionId,
      pixQrCode: chargeResult.pixQrCode,
      pixCopyPaste: chargeResult.pixCopyPaste,
      amount: planData.priceMonthly,
    };
  } catch (error) {
    console.error("[Subscription] Error creating Pix subscription:", error);
    return { success: false, error: "Failed to create subscription" };
  }
}

/**
 * Create subscription with credit card
 */
export async function createCreditCardSubscription(params: {
  userId: number;
  planId: number;
  paymentMethodId: number;
}) {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    // Get plan details
    const plan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, params.planId))
      .limit(1);

    if (plan.length === 0) {
      return { success: false, error: "Plan not found" };
    }

    const planData = plan[0];

    // Get payment method
    const paymentMethod = await db
      .select()
      .from(userPaymentMethods)
      .where(eq(userPaymentMethods.id, params.paymentMethodId))
      .limit(1);

    if (paymentMethod.length === 0) {
      return { success: false, error: "Payment method not found" };
    }

    // Create payment intent with Stripe
    const creditCard = PaymentGatewayFactory.getCreditCard();
    const paymentResult = await creditCard.createPaymentIntent({
      amount: Math.round(parseFloat(planData.priceMonthly.toString()) * 100), // Convert to cents
      currency: "brl",
      description: `SofaPredict - ${planData.name} Plan`,
      metadata: {
        userId: params.userId.toString(),
        planId: params.planId.toString(),
      },
    });

    if (!paymentResult.success) {
      return { success: false, error: "Failed to create payment" };
    }

    // Create subscription record
    const now = new Date();
    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1);

    const subscriptionResult = await db.insert(userSubscriptions).values({
      userId: params.userId,
      planId: params.planId,
      status: "pending",
      billingCycle: "monthly",
      currentPeriodStart: now,
      currentPeriodEnd: nextBilling,
      nextBillingDate: nextBilling,
    });

    const subscriptionId = (subscriptionResult as any).insertId || 1;

    // Create payment record
    await db.insert(payments).values({
      userId: params.userId,
      subscriptionId: subscriptionId,
      amount: planData.priceMonthly,
      currency: "BRL",
      paymentMethod: "credit_card",
      externalPaymentId: paymentResult.paymentIntentId,
      status: "processing",
    });

    return {
      success: true,
      subscriptionId: subscriptionId,
      clientSecret: paymentResult.clientSecret,
      amount: planData.priceMonthly,
    };
  } catch (error) {
    console.error("[Subscription] Error creating credit card subscription:", error);
    return { success: false, error: "Failed to create subscription" };
  }
}

/**
 * Confirm subscription payment
 */
export async function confirmSubscriptionPayment(subscriptionId: number) {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    // Get subscription
    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.id, subscriptionId))
      .limit(1);

    if (subscription.length === 0) {
      return { success: false, error: "Subscription not found" };
    }

    // Update subscription status to active
    await db
      .update(userSubscriptions)
      .set({ status: "active" })
      .where(eq(userSubscriptions.id, subscriptionId));

    // Update payment status
    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.subscriptionId, subscriptionId))
      .limit(1);

    if (payment.length > 0) {
      await db
        .update(payments)
        .set({ status: "completed", completedAt: new Date() })
        .where(eq(payments.id, payment[0].id));
    }

    return { success: true, message: "Subscription activated" };
  } catch (error) {
    console.error("[Subscription] Error confirming payment:", error);
    return { success: false, error: "Failed to confirm payment" };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: number, reason?: string) {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, "active")
        )
      )
      .limit(1);

    if (subscription.length === 0) {
      return { success: false, error: "No active subscription found" };
    }

    await db
      .update(userSubscriptions)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        cancelReason: reason,
      })
      .where(eq(userSubscriptions.id, subscription[0].id));

    return { success: true, message: "Subscription cancelled" };
  } catch (error) {
    console.error("[Subscription] Error cancelling subscription:", error);
    return { success: false, error: "Failed to cancel subscription" };
  }
}

/**
 * Get all available plans
 */
export async function getAllPlans() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true));
  } catch (error) {
    console.error("[Subscription] Error getting plans:", error);
    return [];
  }
}

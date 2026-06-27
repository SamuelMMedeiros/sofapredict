/**
 * Trial Subscription Service
 * Manages free trial periods for new users
 */

import { getDb } from "./db";
import { userSubscriptions } from "../drizzle/subscription-schema";
import { trialSubscriptions } from "../drizzle/feature-blocks-schema";
import { eq, and, lt } from "drizzle-orm";

/**
 * Create a free trial for a new user
 */
export async function createFreeTrial(
  userId: number,
  trialPlanId: number = 2, // Default to Pro plan
  trialDays: number = 14
) {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    // Check if user already has a trial
    const existingTrial = await db
      .select()
      .from(trialSubscriptions)
      .where(eq(trialSubscriptions.userId, userId))
      .limit(1);

    if (existingTrial.length > 0) {
      return { success: false, error: "User already has a trial" };
    }

    // Create trial
    const now = new Date();
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + trialDays);

    await db.insert(trialSubscriptions).values({
      userId,
      trialPlanId,
      trialDaysRemaining: trialDays,
      startedAt: now,
      endsAt,
      status: "active",
    });

    return {
      success: true,
      message: `Trial created for ${trialDays} days`,
      endsAt,
    };
  } catch (error) {
    console.error("[Trial] Error creating trial:", error);
    return { success: false, error: "Failed to create trial" };
  }
}

/**
 * Get user's active trial
 */
export async function getUserTrial(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const trial = await db
      .select()
      .from(trialSubscriptions)
      .where(
        and(
          eq(trialSubscriptions.userId, userId),
          eq(trialSubscriptions.status, "active")
        )
      )
      .limit(1);

    if (trial.length === 0) {
      return null;
    }

    const t = trial[0];

    // Calculate remaining days
    const now = new Date();
    const daysRemaining = Math.ceil(
      (t.endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      ...t,
      daysRemaining: Math.max(0, daysRemaining),
      isExpired: now > t.endsAt,
    };
  } catch (error) {
    console.error("[Trial] Error getting trial:", error);
    return null;
  }
}

/**
 * Check if user's trial has expired
 */
export async function hasTrialExpired(userId: number): Promise<boolean> {
  const trial = await getUserTrial(userId);
  if (!trial) return false;
  return trial.isExpired;
}

/**
 * Convert trial to paid subscription
 */
export async function convertTrialToSubscription(
  userId: number,
  subscriptionId: number
) {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    const trial = await db
      .select()
      .from(trialSubscriptions)
      .where(
        and(
          eq(trialSubscriptions.userId, userId),
          eq(trialSubscriptions.status, "active")
        )
      )
      .limit(1);

    if (trial.length === 0) {
      return { success: false, error: "No active trial found" };
    }

    // Update trial status
    await db
      .update(trialSubscriptions)
      .set({
        status: "converted",
        convertedToSubscriptionId: subscriptionId,
      })
      .where(eq(trialSubscriptions.id, trial[0].id));

    return { success: true, message: "Trial converted to subscription" };
  } catch (error) {
    console.error("[Trial] Error converting trial:", error);
    return { success: false, error: "Failed to convert trial" };
  }
}

/**
 * Cancel trial
 */
export async function cancelTrial(userId: number, reason?: string) {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    const trial = await db
      .select()
      .from(trialSubscriptions)
      .where(eq(trialSubscriptions.userId, userId))
      .limit(1);

    if (trial.length === 0) {
      return { success: false, error: "No trial found" };
    }

    await db
      .update(trialSubscriptions)
      .set({
        status: "cancelled",
      })
      .where(eq(trialSubscriptions.id, trial[0].id));

    return { success: true, message: "Trial cancelled" };
  } catch (error) {
    console.error("[Trial] Error cancelling trial:", error);
    return { success: false, error: "Failed to cancel trial" };
  }
}

/**
 * Send trial expiration reminder (call this daily)
 */
export async function sendTrialExpirationReminders() {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    const now = new Date();
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 3); // Remind 3 days before expiry

    const expiringTrials = await db
      .select()
      .from(trialSubscriptions)
      .where(
        and(
          eq(trialSubscriptions.status, "active"),
          lt(trialSubscriptions.endsAt, reminderDate)
        )
      );

    // Filter for those without reminder sent
    const trialsToRemind = expiringTrials.filter(t => !t.reminderSentAt);

    for (const trial of trialsToRemind) {
      // TODO: Send email reminder to user
      console.log(`[Trial] Sending reminder to user ${trial.userId}`);

      // Mark reminder as sent
      await db
        .update(trialSubscriptions)
        .set({
          reminderSentAt: now,
        })
        .where(eq(trialSubscriptions.id, trial.id));
    }

    return { success: true, remindersCount: trialsToRemind.length };
  } catch (error) {
    console.error("[Trial] Error sending reminders:", error);
    return { success: false, error: "Failed to send reminders" };
  }
}

/**
 * Expire old trials (call this daily)
 */
export async function expireOldTrials() {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    const now = new Date();

    const expiredTrials = await db
      .select()
      .from(trialSubscriptions)
      .where(
        and(
          eq(trialSubscriptions.status, "active"),
          lt(trialSubscriptions.endsAt, now)
        )
      );

    for (const trial of expiredTrials) {
      await db
        .update(trialSubscriptions)
        .set({
          status: "expired",
        })
        .where(eq(trialSubscriptions.id, trial.id));
    }

    return { success: true, expiredCount: expiredTrials.length };
  } catch (error) {
    console.error("[Trial] Error expiring trials:", error);
    return { success: false, error: "Failed to expire trials" };
  }
}

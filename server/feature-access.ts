/**
 * Feature Access Control Service
 * Manages which features are available to which users based on subscription
 */

import { getDb } from "./db";
import {
  featureBlocks,
  planFeatures,
  userFeatureUsage,
  trialSubscriptions,
} from "../drizzle/feature-blocks-schema";
import { userSubscriptions, subscriptionPlans } from "../drizzle/subscription-schema";
import { eq, and, gte, lte } from "drizzle-orm";

/**
 * Check if user has access to a feature
 */
export async function hasFeatureAccess(
  userId: number | null,
  featureKey: string,
  guestSessionId?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Get feature block
    const feature = await db
      .select()
      .from(featureBlocks)
      .where(eq(featureBlocks.key, featureKey))
      .limit(1);

    if (feature.length === 0) {
      console.warn(`[Feature] Feature not found: ${featureKey}`);
      return false;
    }

    const featureBlock = feature[0];

    // If feature doesn't require auth, it's always available
    if (!featureBlock.requiresAuth) {
      return true;
    }

    // If feature requires auth but no user, deny access
    if (!userId) {
      return false;
    }

    // Check if user has active subscription
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

    if (subscription.length > 0 && subscription[0]) {
      const sub = subscription[0];
      // Check if feature is available in their plan
      const planFeature = await db
        .select()
        .from(planFeatures)
        .where(
          and(
            eq(planFeatures.planId, sub.planId),
            eq(planFeatures.featureBlockId, featureBlock.id),
            eq(planFeatures.isEnabled, true)
          )
        )
        .limit(1);

      if (planFeature.length > 0 && planFeature[0]) {
        // Check usage limits
        return await checkUsageLimit(userId, featureBlock.id, planFeature[0].usageLimit);
      }
    }

    // Check if user has active trial
    const trial = await db
      .select()
      .from(trialSubscriptions)
      .where(
        and(
          eq(trialSubscriptions.userId, userId),
          eq(trialSubscriptions.status, "active"),
          lte(trialSubscriptions.endsAt, new Date())
        )
      )
      .limit(1);

    if (trial.length > 0 && featureBlock.availableInTrial) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("[Feature] Error checking access:", error);
    return false;
  }
}

/**
 * Check if user has exceeded usage limit for a feature
 */
async function checkUsageLimit(
  userId: number,
  featureBlockId: number,
  limit?: number | null
): Promise<boolean> {
  if (!limit) {
    // No limit = unlimited access
    return true;
  }

  const db = await getDb();
  if (!db) return false;

  try {
    const now = new Date();
    const usage = await db
      .select()
      .from(userFeatureUsage)
      .where(
        and(
          eq(userFeatureUsage.userId, userId),
          eq(userFeatureUsage.featureBlockId, featureBlockId),
          lte(userFeatureUsage.periodStart, now),
          gte(userFeatureUsage.periodEnd, now)
        )
      )
      .limit(1);

    if (usage.length === 0 || !usage[0]) {
      return true; // No usage yet, within limit
    }

    return (usage[0].usageCount || 0) < limit;
  } catch (error) {
    console.error("[Feature] Error checking usage limit:", error);
    return false;
  }
}

/**
 * Increment feature usage counter
 */
export async function incrementFeatureUsage(
  userId: number,
  featureKey: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Get feature block
    const feature = await db
      .select()
      .from(featureBlocks)
      .where(eq(featureBlocks.key, featureKey))
      .limit(1);

    if (feature.length === 0) {
      return false;
    }

    const featureBlockId = feature[0].id;
    const now = new Date();

    // Get or create usage record
    const usage = await db
      .select()
      .from(userFeatureUsage)
      .where(
        and(
          eq(userFeatureUsage.userId, userId),
          eq(userFeatureUsage.featureBlockId, featureBlockId),
          lte(userFeatureUsage.periodStart, now),
          gte(userFeatureUsage.periodEnd, now)
        )
      )
      .limit(1);

    if (usage.length > 0 && usage[0]) {
      // Update existing record
      const u = usage[0];
      await db
        .update(userFeatureUsage)
        .set({
          usageCount: (u.usageCount || 0) + 1,
          lastUsedAt: now,
        })
        .where(eq(userFeatureUsage.id, u.id));
    } else {
      // Create new record
      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await db.insert(userFeatureUsage).values({
        userId,
        featureBlockId,
        usageCount: 1,
        lastUsedAt: now,
        periodStart,
        periodEnd,
      });
    }

    return true;
  } catch (error) {
    console.error("[Feature] Error incrementing usage:", error);
    return false;
  }
}

/**
 * Get user's remaining usage for a feature
 */
export async function getRemainingUsage(
  userId: number,
  featureKey: string
): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Get feature block
    const feature = await db
      .select()
      .from(featureBlocks)
      .where(eq(featureBlocks.key, featureKey))
      .limit(1);

    if (feature.length === 0) {
      return null;
    }

    const featureBlockId = feature[0].id;

    // Get user's subscription
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

    if (subscription.length === 0 || !subscription[0]) {
      return null;
    }

    const sub = subscription[0];

    // Get plan feature
    const planFeature = await db
      .select()
      .from(planFeatures)
      .where(
        and(
          eq(planFeatures.planId, sub.planId),
          eq(planFeatures.featureBlockId, featureBlockId)
        )
      )
      .limit(1);

    if (planFeature.length === 0 || !planFeature[0]?.usageLimit) {
      return null; // Unlimited
    }

    const limit = planFeature[0].usageLimit;

    // Get current usage
    const now = new Date();
    const usage = await db
      .select()
      .from(userFeatureUsage)
      .where(
        and(
          eq(userFeatureUsage.userId, userId),
          eq(userFeatureUsage.featureBlockId, featureBlockId),
          lte(userFeatureUsage.periodStart, now),
          gte(userFeatureUsage.periodEnd, now)
        )
      )
      .limit(1);

    if (usage.length === 0) {
      return limit;
    }

    return Math.max(0, limit - (usage[0]?.usageCount || 0));
  } catch (error) {
    console.error("[Feature] Error getting remaining usage:", error);
    return null;
  }
}

/**
 * Get all available features for a user
 */
export async function getUserAvailableFeatures(userId: number | null) {
  const db = await getDb();
  if (!db) return [];

  try {
    const features = await db.select().from(featureBlocks).where(eq(featureBlocks.isActive, true));

    const availableFeatures = [];

    for (const feature of features) {
      const hasAccess = await hasFeatureAccess(userId, feature.key);
      if (hasAccess) {
        availableFeatures.push(feature);
      }
    }

    return availableFeatures;
  } catch (error) {
    console.error("[Feature] Error getting user features:", error);
    return [];
  }
}

/**
 * Get all features (for admin panel)
 */
export async function getAllFeatures() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(featureBlocks);
  } catch (error) {
    console.error("[Feature] Error getting all features:", error);
    return [];
  }
}

/**
 * Get feature configuration for a plan
 */
export async function getPlanFeatureConfig(planId: number, featureKey: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const feature = await db
      .select()
      .from(featureBlocks)
      .where(eq(featureBlocks.key, featureKey))
      .limit(1);

    if (feature.length === 0) {
      return null;
    }

    const planFeature = await db
      .select()
      .from(planFeatures)
      .where(
        and(
          eq(planFeatures.planId, planId),
          eq(planFeatures.featureBlockId, feature[0].id)
        )
      )
      .limit(1);

    if (planFeature.length === 0 || !planFeature[0]) {
      return null;
    }

    const pf = planFeature[0];
    return {
      enabled: pf.isEnabled,
      usageLimit: pf.usageLimit,
      resetPeriod: pf.resetPeriod,
      config: pf.config ? JSON.parse(pf.config) : {},
    };
  } catch (error) {
    console.error("[Feature] Error getting plan feature config:", error);
    return null;
  }
}

import { eq, desc } from "drizzle-orm";
import {
  userProfiles,
  userBetsHistory,
  userStats,
  lgpdConsentLog,
  InsertUserProfile,
  InsertUserBetHistory,
  InsertUserStats,
  InsertLgpdConsentLog,
} from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Get or create user profile
 */
export async function getOrCreateUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new profile
    await db.insert(userProfiles).values({
      userId,
      favoriteTeams: [],
      oledModeActive: false,
      soundAlertsActive: true,
      lgpdConsentGiven: false,
    } as InsertUserProfile);

    const created = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
    return created[0] || null;
  } catch (error) {
    console.error("[UserQueries] Error getting/creating user profile:", error);
    return null;
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: number,
  preferences: {
    favoriteTeams?: string[];
    oledModeActive?: boolean;
    soundAlertsActive?: boolean;
  }
) {
  const db = await getDb();
  if (!db) return false;

  try {
    const updateData: any = {};
    if (preferences.favoriteTeams !== undefined) {
      updateData.favoriteTeams = preferences.favoriteTeams;
    }
    if (preferences.oledModeActive !== undefined) {
      updateData.oledModeActive = preferences.oledModeActive;
    }
    if (preferences.soundAlertsActive !== undefined) {
      updateData.soundAlertsActive = preferences.soundAlertsActive;
    }

    await db.update(userProfiles).set(updateData).where(eq(userProfiles.userId, userId));

    return true;
  } catch (error) {
    console.error("[UserQueries] Error updating user preferences:", error);
    return false;
  }
}

/**
 * Store LGPD consent
 */
export async function storeLgpdConsent(
  userId: number,
  consentType: "data_processing" | "marketing" | "analytics",
  consentGiven: boolean,
  ipAddress?: string,
  userAgent?: string
) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.insert(lgpdConsentLog).values({
      userId,
      consentType,
      consentGiven,
      ipAddress,
      userAgent,
    } as InsertLgpdConsentLog);

    // Update user profile LGPD flag
    if (consentType === "data_processing" && consentGiven) {
      await db
        .update(userProfiles)
        .set({
          lgpdConsentGiven: true,
          lgpdConsentDate: new Date(),
        })
        .where(eq(userProfiles.userId, userId));
    }

    return true;
  } catch (error) {
    console.error("[UserQueries] Error storing LGPD consent:", error);
    return false;
  }
}

/**
 * Create betting slip
 */
export async function createBettingSlip(
  userId: number,
  data: {
    compositeOdds: string;
    investedAmount: string;
    projectedReturn: string;
    selections: Array<{
      matchId: string;
      league: string;
      homeTeam: string;
      awayTeam: string;
      selectionLabel: string;
      odd: number;
      type: "1" | "X" | "2";
    }>;
    notes?: string;
  }
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(userBetsHistory).values({
      userId,
      compositeOdds: data.compositeOdds,
      investedAmount: data.investedAmount,
      projectedReturn: data.projectedReturn,
      selections: data.selections,
      notes: data.notes,
      status: "pending",
    } as InsertUserBetHistory);

    return result;
  } catch (error) {
    console.error("[UserQueries] Error creating betting slip:", error);
    return null;
  }
}

/**
 * Get user betting history
 */
export async function getUserBettingHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  try {
    const bets = await db
      .select()
      .from(userBetsHistory)
      .where(eq(userBetsHistory.userId, userId))
      .orderBy(desc(userBetsHistory.createdAt))
      .limit(limit);

    return bets;
  } catch (error) {
    console.error("[UserQueries] Error getting user betting history:", error);
    return [];
  }
}

/**
 * Update bet status
 */
export async function updateBetStatus(
  betId: number,
  status: "pending" | "won" | "lost" | "cancelled",
  actualReturn?: string
) {
  const db = await getDb();
  if (!db) return false;

  try {
    const updateData: any = {
      status,
      settledAt: new Date(),
    };

    if (actualReturn !== undefined) {
      updateData.actualReturn = actualReturn;
    }

    await db.update(userBetsHistory).set(updateData).where(eq(userBetsHistory.id, betId));

    return true;
  } catch (error) {
    console.error("[UserQueries] Error updating bet status:", error);
    return false;
  }
}

/**
 * Get or create user stats
 */
export async function getOrCreateUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const existing = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new stats
    await db.insert(userStats).values({
      userId,
      totalBets: 0,
      wonBets: 0,
      lostBets: 0,
      winRate: "0.00",
      roi: "0.00",
      totalInvested: "0.00",
      totalReturned: "0.00",
      currentStreak: 0,
      bestStreak: 0,
    } as InsertUserStats);

    const created = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
    return created[0] || null;
  } catch (error) {
    console.error("[UserQueries] Error getting/creating user stats:", error);
    return null;
  }
}

/**
 * Update user statistics based on bet results
 */
export async function updateUserStats(userId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    const bets = await db.select().from(userBetsHistory).where(eq(userBetsHistory.userId, userId));

    const totalBets = bets.length;
    const wonBets = bets.filter(b => b.status === "won").length;
    const lostBets = bets.filter(b => b.status === "lost").length;

    const winRate = totalBets > 0 ? ((wonBets / totalBets) * 100).toFixed(2) : "0.00";

    const totalInvested = bets.reduce((sum, b) => {
      const amount = parseFloat(b.investedAmount?.toString() || "0");
      return sum + amount;
    }, 0);

    const totalReturned = bets.reduce((sum, b) => {
      const amount = parseFloat(b.actualReturn?.toString() || "0");
      return sum + amount;
    }, 0);

    const roi = totalInvested > 0 ? (((totalReturned - totalInvested) / totalInvested) * 100).toFixed(2) : "0.00";

    // Calculate streak
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    for (let i = bets.length - 1; i >= 0; i--) {
      if (bets[i].status === "won") {
        tempStreak++;
        currentStreak = tempStreak;
      } else if (bets[i].status === "lost") {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 0;
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);

    await db
      .update(userStats)
      .set({
        totalBets,
        wonBets,
        lostBets,
        winRate,
        roi,
        totalInvested: totalInvested.toFixed(2),
        totalReturned: totalReturned.toFixed(2),
        currentStreak,
        bestStreak,
      })
      .where(eq(userStats.userId, userId));

    return true;
  } catch (error) {
    console.error("[UserQueries] Error updating user stats:", error);
    return false;
  }
}

/**
 * Get user data for export (LGPD requirement)
 */
export async function getUserDataForExport(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
    const bets = await db.select().from(userBetsHistory).where(eq(userBetsHistory.userId, userId));
    const stats = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
    const consents = await db.select().from(lgpdConsentLog).where(eq(lgpdConsentLog.userId, userId));

    return {
      profile: profile[0] || null,
      bets,
      stats: stats[0] || null,
      consents,
      exportDate: new Date(),
    };
  } catch (error) {
    console.error("[UserQueries] Error exporting user data:", error);
    return null;
  }
}

/**
 * Delete user data (LGPD right to be forgotten)
 */
export async function deleteUserData(userId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    // Delete in order of dependencies
    await db.delete(lgpdConsentLog).where(eq(lgpdConsentLog.userId, userId));
    await db.delete(userBetsHistory).where(eq(userBetsHistory.userId, userId));
    await db.delete(userStats).where(eq(userStats.userId, userId));
    await db.delete(userProfiles).where(eq(userProfiles.userId, userId));

    return true;
  } catch (error) {
    console.error("[UserQueries] Error deleting user data:", error);
    return false;
  }
}

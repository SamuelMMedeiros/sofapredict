import { decimal, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User profiles with preferences and favorite teams
 */
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  favoriteTeams: json("favorite_teams").$type<string[]>(),
  oledModeActive: boolean("oled_mode_active").default(false).notNull(),
  soundAlertsActive: boolean("sound_alerts_active").default(true).notNull(),
  rapidApiKey: text("rapidapi_key"), // Encrypted in production
  lgpdConsentGiven: boolean("lgpd_consent_given").default(false),
  lgpdConsentDate: timestamp("lgpd_consent_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * User betting history and slips
 */
export const userBetsHistory = mysqlTable("user_bets_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  compositeOdds: decimal("composite_odds", { precision: 10, scale: 2 }).notNull(),
  investedAmount: decimal("invested_amount", { precision: 10, scale: 2 }).notNull(),
  projectedReturn: decimal("projected_return", { precision: 10, scale: 2 }).notNull(),
  actualReturn: decimal("actual_return", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["pending", "won", "lost", "cancelled"]).notNull(),
  selections: json("selections").$type<Array<{
    matchId: string;
    league: string;
    homeTeam: string;
    awayTeam: string;
    selectionLabel: string;
    odd: number;
    type: "1" | "X" | "2";
  }>>(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  settledAt: timestamp("settled_at"),
});

export type UserBetHistory = typeof userBetsHistory.$inferSelect;
export type InsertUserBetHistory = typeof userBetsHistory.$inferInsert;

/**
 * Server-side cache for API responses (RapidAPI, Gemini)
 */
export const apiCache = mysqlTable("api_cache", {
  id: int("id").autoincrement().primaryKey(),
  cacheKey: varchar("cache_key", { length: 255 }).notNull().unique(),
  source: mysqlEnum("source", ["rapidapi", "gemini", "sofascore"]),
  data: json("data"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ApiCache = typeof apiCache.$inferSelect;
export type InsertApiCache = typeof apiCache.$inferInsert;

/**
 * User statistics and metrics
 */
export const userStats = mysqlTable("user_stats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  totalBets: int("total_bets").default(0).notNull(),
  wonBets: int("won_bets").default(0).notNull(),
  lostBets: int("lost_bets").default(0).notNull(),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }).default("0.00"),
  roi: decimal("roi", { precision: 8, scale: 2 }).default("0.00"),
  totalInvested: decimal("total_invested", { precision: 12, scale: 2 }).default("0.00"),
  totalReturned: decimal("total_returned", { precision: 12, scale: 2 }).default("0.00"),
  currentStreak: int("current_streak").default(0).notNull(),
  bestStreak: int("best_streak").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;

/**
 * LGPD consent log for compliance
 */
export const lgpdConsentLog = mysqlTable("lgpd_consent_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  consentType: mysqlEnum("consent_type", ["data_processing", "marketing", "analytics"]),
  consentGiven: boolean("consent_given"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LgpdConsentLog = typeof lgpdConsentLog.$inferSelect;
export type InsertLgpdConsentLog = typeof lgpdConsentLog.$inferInsert;
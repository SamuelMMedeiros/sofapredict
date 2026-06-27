import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Feature Blocks/Modules Table
 * Defines all features that can be restricted by subscription plan
 */
export const featureBlocks = mysqlTable("feature_blocks", {
  id: int("id").autoincrement().primaryKey(),
  
  // Block identification
  key: varchar("key", { length: 100 }).unique().notNull(), // e.g., "ai_analysis", "surebet_calculator"
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Análise com IA"
  description: text("description"),
  category: mysqlEnum("category", [
    "core",           // Funcionalidades básicas
    "analytics",      // Análises e métricas
    "tools",          // Ferramentas
    "premium",        // Features premium
    "export",         // Exportação de dados
  ]).default("core"),
  
  // Availability
  requiresAuth: boolean("requiresAuth").default(false), // Precisa estar logado?
  requiresSubscription: boolean("requiresSubscription").default(false), // Precisa de plano pago?
  isActive: boolean("isActive").default(true),
  
  // Trial access
  availableInTrial: boolean("availableInTrial").default(false), // Disponível no período de teste?
  
  // Metadata
  icon: varchar("icon", { length: 50 }), // lucide-react icon name
  order: int("order").default(0), // Display order
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeatureBlock = typeof featureBlocks.$inferSelect;
export type InsertFeatureBlock = typeof featureBlocks.$inferInsert;

/**
 * Plan Features Mapping Table
 * Maps which features are available in each plan
 */
export const planFeatures = mysqlTable("plan_features", {
  id: int("id").autoincrement().primaryKey(),
  
  planId: int("planId").notNull(),
  featureBlockId: int("featureBlockId").notNull(),
  
  // Limits per plan
  usageLimit: int("usageLimit"), // e.g., max 50 AI analyses per month
  resetPeriod: mysqlEnum("resetPeriod", ["daily", "weekly", "monthly", "yearly", "unlimited"]).default("unlimited"),
  
  // Feature-specific config
  config: text("config"), // JSON with feature-specific settings
  
  isEnabled: boolean("isEnabled").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlanFeature = typeof planFeatures.$inferSelect;
export type InsertPlanFeature = typeof planFeatures.$inferInsert;

/**
 * User Feature Usage Tracking
 * Tracks how much of each feature the user has used in current period
 */
export const userFeatureUsage = mysqlTable("user_feature_usage", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull(),
  featureBlockId: int("featureBlockId").notNull(),
  
  // Usage tracking
  usageCount: int("usageCount").default(0),
  lastUsedAt: timestamp("lastUsedAt"),
  
  // Period tracking
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserFeatureUsage = typeof userFeatureUsage.$inferSelect;
export type InsertUserFeatureUsage = typeof userFeatureUsage.$inferInsert;

/**
 * Trial Subscriptions Table
 * Tracks free trial periods for users
 */
export const trialSubscriptions = mysqlTable("trial_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().unique(),
  
  // Trial details
  trialPlanId: int("trialPlanId").notNull(), // Which plan they're trialing (usually Pro)
  trialDaysRemaining: int("trialDaysRemaining").default(14),
  
  // Dates
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  endsAt: timestamp("endsAt").notNull(),
  
  // Status
  status: mysqlEnum("status", ["active", "expired", "converted", "cancelled"]).default("active"),
  convertedToSubscriptionId: int("convertedToSubscriptionId"), // If they upgraded
  
  // Tracking
  reminderSentAt: timestamp("reminderSentAt"), // When we sent the trial ending reminder
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrialSubscription = typeof trialSubscriptions.$inferSelect;
export type InsertTrialSubscription = typeof trialSubscriptions.$inferInsert;

/**
 * Guest Access Log
 * Tracks which features guests (non-authenticated users) access
 */
export const guestAccessLog = mysqlTable("guest_access_log", {
  id: int("id").autoincrement().primaryKey(),
  
  // Guest identification (no user ID)
  guestSessionId: varchar("guestSessionId", { length: 255 }).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
  
  // Feature access
  featureBlockId: int("featureBlockId").notNull(),
  accessCount: int("accessCount").default(1),
  
  // Dates
  firstAccessAt: timestamp("firstAccessAt").defaultNow().notNull(),
  lastAccessAt: timestamp("lastAccessAt").defaultNow().onUpdateNow().notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GuestAccessLog = typeof guestAccessLog.$inferSelect;
export type InsertGuestAccessLog = typeof guestAccessLog.$inferInsert;

import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * Subscription Plans Table
 * Defines different tiers and features available
 */
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // "Free", "Pro", "Premium"
  description: text("description"),
  priceMonthly: decimal("priceMonthly", { precision: 10, scale: 2 }).notNull(),
  priceYearly: decimal("priceYearly", { precision: 10, scale: 2 }),
  
  // Features
  maxFavoriteTeams: int("maxFavoriteTeams").default(0),
  maxBetsPerMonth: int("maxBetsPerMonth").default(0),
  accessToAiAnalysis: boolean("accessToAiAnalysis").default(false),
  accessToSurebet: boolean("accessToSurebet").default(false),
  accessToRadar: boolean("accessToRadar").default(false),
  accessToMetrics: boolean("accessToMetrics").default(false),
  accessToExport: boolean("accessToExport").default(false),
  
  // Status
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

/**
 * User Subscriptions Table
 * Tracks active subscriptions for each user
 */
export const userSubscriptions = mysqlTable("user_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: int("planId").notNull(),
  
  // Subscription status
  status: mysqlEnum("status", ["active", "cancelled", "expired", "pending"]).default("pending"),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "yearly"]).default("monthly"),
  
  // Payment tracking
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  nextBillingDate: timestamp("nextBillingDate"),
  
  // Cancellation
  cancelledAt: timestamp("cancelledAt"),
  cancelReason: text("cancelReason"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

/**
 * Payments Table
 * Records all payment transactions
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subscriptionId: int("subscriptionId"),
  
  // Payment details
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  paymentMethod: mysqlEnum("paymentMethod", ["pix", "credit_card", "telegram_stars", "paypal"]),
  
  // External references
  externalPaymentId: varchar("externalPaymentId", { length: 255 }),
  externalTransactionId: varchar("externalTransactionId", { length: 255 }),
  
  // Status
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "refunded"]).default("pending"),
  failureReason: text("failureReason"),
  
  // Metadata
  metadata: text("metadata"), // JSON string with additional data
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Payment Methods Table
 * Stores user's saved payment methods
 */
export const userPaymentMethods = mysqlTable("user_payment_methods", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Payment method type
  type: mysqlEnum("type", ["pix", "credit_card", "paypal"]),
  
  // For Pix
  pixKey: varchar("pixKey", { length: 255 }), // CPF, email, phone, or random key
  pixKeyType: mysqlEnum("pixKeyType", ["cpf", "email", "phone", "random"]),
  
  // For Credit Card (tokenized, never store full card)
  cardToken: varchar("cardToken", { length: 255 }),
  cardLast4: varchar("cardLast4", { length: 4 }),
  cardBrand: varchar("cardBrand", { length: 50 }), // "visa", "mastercard", etc
  cardExpiryMonth: int("cardExpiryMonth"),
  cardExpiryYear: int("cardExpiryYear"),
  
  // For PayPal
  paypalEmail: varchar("paypalEmail", { length: 255 }),
  
  // Status
  isDefault: boolean("isDefault").default(false),
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPaymentMethod = typeof userPaymentMethods.$inferSelect;
export type InsertUserPaymentMethod = typeof userPaymentMethods.$inferInsert;

/**
 * Invoices Table
 * Stores invoice records for accounting
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  paymentId: int("paymentId"),
  
  // Invoice details
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  
  // Period
  periodStart: timestamp("periodStart"),
  periodEnd: timestamp("periodEnd"),
  
  // Status
  status: mysqlEnum("status", ["draft", "issued", "paid", "cancelled"]).default("draft"),
  
  // URLs
  pdfUrl: varchar("pdfUrl", { length: 500 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

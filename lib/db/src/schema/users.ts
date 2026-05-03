import { pgTable, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "FREE",
  "EXPLORER",
  "ARCHITECT",
  "CERTIFIED",
]);

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  currentPhase: integer("current_phase").notNull().default(1),
  onboardingDone: boolean("onboarding_done").notNull().default(false),
  subscriptionTier: subscriptionTierEnum("subscription_tier").notNull().default("FREE"),
  stripeCustomerId: text("stripe_customer_id"),
  streakDays: integer("streak_days").notNull().default(0),
  totalSessions: integer("total_sessions").notNull().default(0),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

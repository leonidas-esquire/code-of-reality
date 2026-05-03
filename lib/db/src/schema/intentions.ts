import { pgTable, text, real, boolean, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const intentionCategoryEnum = pgEnum("intention_category", [
  "wealth",
  "health",
  "relationships",
  "purpose",
  "creativity",
  "spiritual",
]);

export const intentionsTable = pgTable("intentions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: intentionCategoryEnum("category").notNull(),
  targetVector: jsonb("target_vector").notNull(),
  crystallizationScore: real("crystallization_score").notNull().default(0),
  standingWaveStrength: real("standing_wave_strength").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const intentionConstellationsTable = pgTable("intention_constellations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  intentionIds: jsonb("intention_ids").notNull(),
  harmonicScore: real("harmonic_score").notNull().default(0),
  interferenceScore: real("interference_score").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertIntentionSchema = createInsertSchema(intentionsTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertIntention = z.infer<typeof insertIntentionSchema>;
export type Intention = typeof intentionsTable.$inferSelect;

export const insertConstellationSchema = createInsertSchema(intentionConstellationsTable).omit({
  createdAt: true,
});
export type InsertConstellation = z.infer<typeof insertConstellationSchema>;
export type IntentionConstellation = typeof intentionConstellationsTable.$inferSelect;

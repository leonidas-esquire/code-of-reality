import { pgTable, text, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const patternStatusEnum = pgEnum("pattern_status", [
  "LOCKED",
  "UNLOCKING",
  "RESOLVED",
]);

export const patternLocksTable = pgTable("pattern_locks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  dimension: integer("dimension").notNull(),
  dimensionName: text("dimension_name").notNull(),
  description: text("description").notNull(),
  severity: real("severity").notNull(),
  status: patternStatusEnum("status").notNull().default("LOCKED"),
  timelineOrigin: text("timeline_origin"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPatternLockSchema = createInsertSchema(patternLocksTable).omit({
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});
export type InsertPatternLock = z.infer<typeof insertPatternLockSchema>;
export type PatternLock = typeof patternLocksTable.$inferSelect;

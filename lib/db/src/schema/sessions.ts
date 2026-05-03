import { pgTable, text, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessionTypeEnum = pgEnum("session_type", [
  "reading",
  "practice",
  "tool",
  "group",
  "scanner",
  "crystallizer",
  "echo_field",
  "identity_mapping",
]);

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: sessionTypeEnum("type").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  phase: integer("phase").notNull(),
  preScore: real("pre_score"),
  postScore: real("post_score"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({
  createdAt: true,
});
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;

import { pgTable, text, integer, real, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const assessmentTypeEnum = pgEnum("assessment_type", [
  "DIMENSIONAL_SCAN",
  "COHERENCE_AUDIT",
  "IDENTITY_MAP",
  "PHASE_TRANSITION",
]);

export const assessmentsTable = pgTable("assessments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: assessmentTypeEnum("type").notNull(),
  dimensionScores: jsonb("dimension_scores").notNull(),
  overallScore: real("overall_score").notNull(),
  phase: integer("phase").notNull().default(1),
  responses: jsonb("responses"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAssessmentSchema = createInsertSchema(assessmentsTable).omit({
  createdAt: true,
});
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessmentsTable.$inferSelect;

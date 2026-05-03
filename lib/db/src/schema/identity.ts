import { pgTable, text, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const identityGeometriesTable = pgTable("identity_geometries", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  dimensionalScores: jsonb("dimensional_scores").notNull(),
  coherenceScore: real("coherence_score").notNull(),
  shapeType: text("shape_type").notNull(),
  coherenceGaps: jsonb("coherence_gaps").notNull(),
  responses: jsonb("responses"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertIdentityGeometrySchema = createInsertSchema(identityGeometriesTable).omit({
  createdAt: true,
});
export type InsertIdentityGeometry = z.infer<typeof insertIdentityGeometrySchema>;
export type IdentityGeometry = typeof identityGeometriesTable.$inferSelect;

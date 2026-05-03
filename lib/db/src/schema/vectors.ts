import { pgTable, text, real, timestamp, jsonb } from "drizzle-orm/pg-core";

export const realityVectorsTable = pgTable("reality_vectors", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  assessmentId: text("assessment_id"),
  components: jsonb("components").notNull(),
  magnitude: real("magnitude").notNull(),
  direction: jsonb("direction").notNull(),
  trajectory: jsonb("trajectory").notNull(),
  stability: real("stability").notNull().default(0.5),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type RealityVector = typeof realityVectorsTable.$inferSelect;
export type InsertRealityVector = typeof realityVectorsTable.$inferInsert;

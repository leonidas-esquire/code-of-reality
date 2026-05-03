import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const achievementsTable = pgTable("achievements", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconType: text("icon_type").notNull(),
  points: text("points").notNull().default("0"),
});

export const userAchievementsTable = pgTable("user_achievements", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  achievementId: text("achievement_id").notNull(),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
});

export const insertAchievementSchema = createInsertSchema(achievementsTable);
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievementsTable.$inferSelect;

export const insertUserAchievementSchema = createInsertSchema(userAchievementsTable).omit({
  earnedAt: true,
});
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievementsTable.$inferSelect;

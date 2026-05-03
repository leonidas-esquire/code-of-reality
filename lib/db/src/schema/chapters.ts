import { pgTable, text, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const chaptersTable = pgTable("chapters", {
  id: text("id").primaryKey(),
  phase: integer("phase").notNull(),
  sequence: integer("sequence").notNull(),
  title: text("title").notNull(),
  openingParagraph: text("opening_paragraph").notNull(),
  summary: text("summary").notNull(),
  quotables: jsonb("quotables").notNull().default([]),
  linkedToolIds: jsonb("linked_tool_ids").notNull().default([]),
});

export const chapterProgressTable = pgTable("chapter_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  chapterId: text("chapter_id").notNull(),
  isComplete: boolean("is_complete").notNull().default(false),
  assessmentScore: real("assessment_score"),
  reflectionSubmitted: boolean("reflection_submitted").notNull().default(false),
  reflectionText: text("reflection_text"),
  completedAt: timestamp("completed_at"),
  lastReadAt: timestamp("last_read_at").defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChapterSchema = createInsertSchema(chaptersTable);
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type Chapter = typeof chaptersTable.$inferSelect;

export const insertChapterProgressSchema = createInsertSchema(chapterProgressTable).omit({
  createdAt: true,
});
export type InsertChapterProgress = z.infer<typeof insertChapterProgressSchema>;
export type ChapterProgress = typeof chapterProgressTable.$inferSelect;

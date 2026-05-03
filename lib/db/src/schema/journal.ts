import { pgTable, text, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const journalEntriesTable = pgTable("journal_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  tags: jsonb("tags").notNull().default([]),
  linkedChapterId: text("linked_chapter_id"),
  linkedTool: text("linked_tool"),
  sentimentScore: real("sentiment_score"),
  prompt: text("prompt"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntriesTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntriesTable.$inferSelect;

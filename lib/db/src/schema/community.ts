import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const forumThreadsTable = pgTable("forum_threads", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  authorName: text("author_name").notNull(),
  title: text("title").notNull(),
  phase: integer("phase").notNull().default(1),
  tags: jsonb("tags").notNull().default([]),
  postCount: integer("post_count").notNull().default(0),
  lastActivityAt: timestamp("last_activity_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const forumPostsTable = pgTable("forum_posts", {
  id: text("id").primaryKey(),
  threadId: text("thread_id").notNull(),
  userId: text("user_id").notNull(),
  authorName: text("author_name").notNull(),
  authorPhase: integer("author_phase").notNull().default(1),
  content: text("content").notNull(),
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertForumThreadSchema = createInsertSchema(forumThreadsTable).omit({
  createdAt: true,
  lastActivityAt: true,
});
export type InsertForumThread = z.infer<typeof insertForumThreadSchema>;
export type ForumThread = typeof forumThreadsTable.$inferSelect;

export const insertForumPostSchema = createInsertSchema(forumPostsTable).omit({
  createdAt: true,
});
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumPost = typeof forumPostsTable.$inferSelect;

import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../lib/db";
import { journalEntriesTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { generateId } from "../lib/id";

const router = Router();

router.get("/journal", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const limit = parseInt(req.query.limit as string) || 20;
    const linkedChapterId = req.query.linkedChapterId as string | undefined;

    let entries;
    if (linkedChapterId) {
      entries = await db.select().from(journalEntriesTable)
        .where(and(eq(journalEntriesTable.userId, userId), eq(journalEntriesTable.linkedChapterId, linkedChapterId)))
        .orderBy(desc(journalEntriesTable.createdAt)).limit(limit);
    } else {
      entries = await db.select().from(journalEntriesTable)
        .where(eq(journalEntriesTable.userId, userId))
        .orderBy(desc(journalEntriesTable.createdAt)).limit(limit);
    }
    res.json(entries);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/journal", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const { content, tags, linkedChapterId, linkedTool, prompt } = req.body;
    const id = generateId();
    const [entry] = await db.insert(journalEntriesTable).values({
      id, userId, content, tags: tags ?? [], linkedChapterId, linkedTool, prompt,
    }).returning();
    res.status(201).json(entry);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/journal/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const { content, tags } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (content !== undefined) updates.content = content;
    if (tags !== undefined) updates.tags = tags;
    const [entry] = await db.update(journalEntriesTable).set(updates)
      .where(and(eq(journalEntriesTable.id, req.params.id), eq(journalEntriesTable.userId, userId)))
      .returning();
    if (!entry) { res.status(404).json({ error: "Not Found" }); return; }
    res.json(entry);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/journal/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    await db.delete(journalEntriesTable)
      .where(and(eq(journalEntriesTable.id, req.params.id), eq(journalEntriesTable.userId, userId)));
    res.json({ message: "Deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

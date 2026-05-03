import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../lib/db";
import { chaptersTable, chapterProgressTable, usersTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { generateId } from "../lib/id";

const router = Router();

router.get("/chapters", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const phaseFilter = req.query.phase ? parseInt(req.query.phase as string) : null;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const currentPhase = user?.currentPhase ?? 1;

    let query = db.select().from(chaptersTable);
    const allChapters = phaseFilter
      ? await query.where(eq(chaptersTable.phase, phaseFilter))
      : await query;

    const progressList = await db.select().from(chapterProgressTable)
      .where(eq(chapterProgressTable.userId, userId));
    const progressMap = new Map(progressList.map(p => [p.chapterId, p]));

    const chaptersWithProgress = allChapters.map(c => ({
      ...c,
      isUnlocked: c.phase <= currentPhase,
      progress: progressMap.get(c.id) ?? null,
    }));
    res.json(chaptersWithProgress);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/chapters/progress", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const progress = await db.select().from(chapterProgressTable)
      .where(eq(chapterProgressTable.userId, userId));
    res.json(progress);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/chapters/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const currentPhase = user?.currentPhase ?? 1;

    const [chapter] = await db.select().from(chaptersTable)
      .where(eq(chaptersTable.id, req.params.id)).limit(1);
    if (!chapter) { res.status(404).json({ error: "Not Found" }); return; }

    const [progress] = await db.select().from(chapterProgressTable)
      .where(and(eq(chapterProgressTable.chapterId, chapter.id), eq(chapterProgressTable.userId, userId)))
      .limit(1);

    res.json({ ...chapter, isUnlocked: chapter.phase <= currentPhase, progress: progress ?? null });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/chapters/:id/complete", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const { assessmentScore, reflectionText } = req.body;
    const [chapter] = await db.select().from(chaptersTable).where(eq(chaptersTable.id, req.params.id)).limit(1);
    if (!chapter) { res.status(404).json({ error: "Not Found" }); return; }

    const [existing] = await db.select().from(chapterProgressTable)
      .where(and(eq(chapterProgressTable.chapterId, req.params.id), eq(chapterProgressTable.userId, userId)))
      .limit(1);

    let progress;
    if (existing) {
      [progress] = await db.update(chapterProgressTable)
        .set({ isComplete: true, assessmentScore, reflectionSubmitted: !!reflectionText, reflectionText, completedAt: new Date(), lastReadAt: new Date() })
        .where(eq(chapterProgressTable.id, existing.id))
        .returning();
    } else {
      [progress] = await db.insert(chapterProgressTable).values({
        id: generateId(), userId, chapterId: req.params.id, isComplete: true, assessmentScore, reflectionSubmitted: !!reflectionText, reflectionText, completedAt: new Date(),
      }).returning();
    }
    res.json(progress);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

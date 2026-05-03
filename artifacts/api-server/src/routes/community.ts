import { Router } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "../lib/db";
import { forumThreadsTable, forumPostsTable, usersTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { generateId } from "../lib/id";

const router = Router();

/** Add authorId alias to satisfy OpenAPI ForumThread schema */
function serializeThread(t: typeof forumThreadsTable.$inferSelect) {
  return { ...t, authorId: t.userId };
}

/** Add authorId alias to satisfy OpenAPI ForumPost schema */
function serializePost(p: typeof forumPostsTable.$inferSelect) {
  return { ...p, authorId: p.userId };
}

router.get("/community/threads", requireAuth, async (req, res) => {
  try {
    const phaseFilter = req.query.phase ? parseInt(req.query.phase as string) : null;
    const limit = parseInt(req.query.limit as string) || 20;

    const threads = phaseFilter
      ? await db.select().from(forumThreadsTable)
          .where(eq(forumThreadsTable.phase, phaseFilter))
          .orderBy(desc(forumThreadsTable.lastActivityAt)).limit(limit)
      : await db.select().from(forumThreadsTable)
          .orderBy(desc(forumThreadsTable.lastActivityAt)).limit(limit);

    res.json(threads.map(serializeThread));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/community/threads", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const { title, content, tags } = req.body;
    const threadId = generateId();

    const [thread] = await db.insert(forumThreadsTable).values({
      id: threadId,
      userId,
      authorName: user?.displayName ?? user?.email ?? "Practitioner",
      title,
      phase: user?.currentPhase ?? 1,
      tags: tags ?? [],
      postCount: 1,
    }).returning();

    await db.insert(forumPostsTable).values({
      id: generateId(),
      threadId,
      userId,
      authorName: user?.displayName ?? user?.email ?? "Practitioner",
      authorPhase: user?.currentPhase ?? 1,
      content,
    });

    res.status(201).json(serializeThread(thread));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/community/threads/:id/posts", requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const posts = await db.select().from(forumPostsTable)
      .where(eq(forumPostsTable.threadId, req.params.id))
      .orderBy(forumPostsTable.createdAt).limit(limit);
    res.json(posts.map(serializePost));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/community/threads/:id/posts", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const { content } = req.body;

    const [post] = await db.insert(forumPostsTable).values({
      id: generateId(),
      threadId: req.params.id,
      userId,
      authorName: user?.displayName ?? user?.email ?? "Practitioner",
      authorPhase: user?.currentPhase ?? 1,
      content,
    }).returning();

    await db.update(forumThreadsTable)
      .set({ postCount: sql`post_count + 1`, lastActivityAt: new Date() })
      .where(eq(forumThreadsTable.id, req.params.id));

    res.status(201).json(serializePost(post));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/community/resonance", requireAuth, async (req, res) => {
  try {
    const users = await db.select().from(usersTable);
    const dist: Record<string, number> = {};
    users.forEach(u => { dist[u.currentPhase] = (dist[u.currentPhase] ?? 0) + 1; });
    const phaseNums = users.map(u => u.currentPhase);
    const avgPhase = phaseNums.length > 0 ? phaseNums.reduce((a, b) => a + b, 0) / phaseNums.length : 1;
    const level = avgPhase >= 6 ? "transcendent" : avgPhase >= 4 ? "resonant" : avgPhase >= 2 ? "growing" : "low";

    res.json({
      totalActiveUsers: users.length,
      avgCoherenceScore: avgPhase * 1.2,
      avgDimensionScores: { spatial:6,temporal:6,causal:6,intentional:6,identity:6,emotional:6,mental:6,transcendent:6 },
      collectivePhaseDistribution: dist,
      resonanceLevel: level,
      updatedAt: new Date(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

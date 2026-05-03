import { Router } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "../lib/db";
import { sessionsTable, usersTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { generateId } from "../lib/id";

const router = Router();

router.get("/sessions", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const limit = parseInt(req.query.limit as string) || 20;
    const list = await db.select().from(sessionsTable)
      .where(eq(sessionsTable.userId, userId))
      .orderBy(desc(sessionsTable.createdAt))
      .limit(limit);
    res.json(list);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/sessions", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const { type, durationMinutes, phase, preScore, postScore, notes } = req.body;
    const id = generateId();
    const [session] = await db.insert(sessionsTable).values({
      id, userId, type, durationMinutes, phase, preScore, postScore, notes,
    }).returning();

    // Update user total sessions
    await db.update(usersTable)
      .set({ totalSessions: sql`total_sessions + 1`, updatedAt: new Date() })
      .where(eq(usersTable.id, userId));

    res.status(201).json(session);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/sessions/stats", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const sessions = await db.select().from(sessionsTable)
      .where(eq(sessionsTable.userId, userId));

    const totalMinutes = sessions.reduce((s, sess) => s + sess.durationMinutes, 0);
    const byType = sessions.reduce((acc: Record<string, number>, s) => {
      acc[s.type] = (acc[s.type] ?? 0) + 1;
      return acc;
    }, {});

    const prePostSessions = sessions.filter(s => s.preScore !== null && s.postScore !== null);
    const avgImprovement = prePostSessions.length > 0
      ? prePostSessions.reduce((s, sess) => s + (sess.postScore! - sess.preScore!), 0) / prePostSessions.length
      : 0;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    res.json({
      totalSessions: sessions.length,
      totalMinutes,
      currentStreakDays: user?.streakDays ?? 0,
      longestStreakDays: user?.streakDays ?? 0,
      sessionsByType: byType,
      avgPrePostImprovement: avgImprovement,
      weeklyFrequency: sessions.length > 0 ? sessions.length / Math.max(1, Math.ceil(sessions.length / 7)) : 0,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

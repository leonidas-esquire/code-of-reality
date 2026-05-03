import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../lib/db";
import { patternLocksTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router = Router();

router.get("/patterns", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const patterns = await db.select().from(patternLocksTable)
      .where(eq(patternLocksTable.userId, userId));
    res.json(patterns);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/patterns/:id/status", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const { status, timelineOrigin } = req.body;
    const updates: Record<string, unknown> = { status, updatedAt: new Date() };
    if (timelineOrigin) updates.timelineOrigin = timelineOrigin;
    if (status === "RESOLVED") updates.resolvedAt = new Date();

    const [pattern] = await db.update(patternLocksTable)
      .set(updates)
      .where(and(eq(patternLocksTable.id, req.params.id), eq(patternLocksTable.userId, userId)))
      .returning();

    if (!pattern) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    res.json(pattern);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

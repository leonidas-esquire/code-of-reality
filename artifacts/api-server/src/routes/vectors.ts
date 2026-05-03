import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "../lib/db";
import { realityVectorsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router = Router();

router.get("/vectors", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const limit = parseInt(req.query.limit as string) || 30;
    const vectors = await db.select().from(realityVectorsTable)
      .where(eq(realityVectorsTable.userId, userId))
      .orderBy(desc(realityVectorsTable.createdAt))
      .limit(limit);
    res.json(vectors);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/vectors/current", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [vector] = await db.select().from(realityVectorsTable)
      .where(eq(realityVectorsTable.userId, userId))
      .orderBy(desc(realityVectorsTable.createdAt))
      .limit(1);
    if (!vector) {
      // Return default vector
      res.json({
        id: "default",
        userId,
        components: [5,5,5,5,5,5,5,5],
        magnitude: Math.sqrt(200),
        direction: Array(8).fill(1/Math.sqrt(8)),
        trajectory: Array(8).fill(0),
        stability: 0.5,
        createdAt: new Date(),
      });
      return;
    }
    res.json(vector);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/vectors/trajectory", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const vectors = await db.select().from(realityVectorsTable)
      .where(eq(realityVectorsTable.userId, userId))
      .orderBy(desc(realityVectorsTable.createdAt))
      .limit(30);

    if (vectors.length === 0) {
      res.json({ vectors: [], trend: "stable", overallGrowth: 0, dimensionTrends: {} });
      return;
    }

    const first = vectors[vectors.length - 1];
    const last = vectors[0];
    const growth = last.magnitude - first.magnitude;
    const trend = growth > 1 ? "ascending" : growth < -1 ? "descending" : "stable";

    res.json({ vectors, trend, overallGrowth: growth, dimensionTrends: {} });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

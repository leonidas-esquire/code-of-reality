import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../lib/db";
import { intentionsTable, intentionConstellationsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { generateId } from "../lib/id";

const router = Router();

// ── INTENTIONS ──────────────────────────────────────────────────────────────

router.get("/intentions", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const list = await db.select().from(intentionsTable)
      .where(eq(intentionsTable.userId, userId));
    res.json(list);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/intentions", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const { title, category, dimensionTargets, description } = req.body;
    const targetVector = Object.values(dimensionTargets) as number[];
    const id = generateId();
    const [intention] = await db.insert(intentionsTable).values({
      id, userId, title, category, description, targetVector, crystallizationScore: 0.1, standingWaveStrength: 0.1, isActive: true,
    }).returning();
    res.status(201).json(intention);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/intentions/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [intention] = await db.select().from(intentionsTable)
      .where(and(eq(intentionsTable.id, req.params.id), eq(intentionsTable.userId, userId)));
    if (!intention) { res.status(404).json({ error: "Not Found" }); return; }
    res.json(intention);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/intentions/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const { title, category, isActive } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;
    if (isActive !== undefined) updates.isActive = isActive;
    const [intention] = await db.update(intentionsTable).set(updates)
      .where(and(eq(intentionsTable.id, req.params.id), eq(intentionsTable.userId, userId)))
      .returning();
    if (!intention) { res.status(404).json({ error: "Not Found" }); return; }
    res.json(intention);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/intentions/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    await db.delete(intentionsTable)
      .where(and(eq(intentionsTable.id, req.params.id), eq(intentionsTable.userId, userId)));
    res.json({ message: "Deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/intentions/:id/crystallize", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [intention] = await db.select().from(intentionsTable)
      .where(and(eq(intentionsTable.id, req.params.id), eq(intentionsTable.userId, userId)));
    if (!intention) { res.status(404).json({ error: "Not Found" }); return; }
    const newScore = Math.min(1, intention.crystallizationScore + 0.15);
    const newStrength = Math.min(1, intention.standingWaveStrength + 0.1);
    const [updated] = await db.update(intentionsTable)
      .set({ crystallizationScore: newScore, standingWaveStrength: newStrength, updatedAt: new Date() })
      .where(eq(intentionsTable.id, req.params.id))
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── CONSTELLATIONS ──────────────────────────────────────────────────────────

router.get("/constellations", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const list = await db.select().from(intentionConstellationsTable)
      .where(eq(intentionConstellationsTable.userId, userId));
    // For each constellation, attach the intentions
    const constellationsWithIntentions = await Promise.all(list.map(async (c) => {
      const ids = c.intentionIds as string[];
      const intentions = ids.length > 0
        ? await db.select().from(intentionsTable).where(eq(intentionsTable.userId, userId))
        : [];
      return { ...c, intentions: intentions.filter(i => ids.includes(i.id)) };
    }));
    res.json(constellationsWithIntentions);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/constellations", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const { name, intentionIds } = req.body;
    const id = generateId();
    const [c] = await db.insert(intentionConstellationsTable).values({
      id, userId, name, intentionIds, harmonicScore: 0.7, interferenceScore: 0.2,
    }).returning();
    res.status(201).json({ ...c, intentions: [] });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/constellations/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [c] = await db.select().from(intentionConstellationsTable)
      .where(and(eq(intentionConstellationsTable.id, req.params.id), eq(intentionConstellationsTable.userId, userId)));
    if (!c) { res.status(404).json({ error: "Not Found" }); return; }
    const ids = c.intentionIds as string[];
    const allIntentions = await db.select().from(intentionsTable).where(eq(intentionsTable.userId, userId));
    res.json({ ...c, intentions: allIntentions.filter(i => ids.includes(i.id)) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "../lib/db";
import { identityGeometriesTable, intentionsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { generateId } from "../lib/id";

const router = Router();

const DIMENSION_NAMES = ["spatial","temporal","causal","intentional","identity","emotional","mental","transcendent"];

function computeCoherenceGaps(identityScores: number[], intentions: {targetVector: unknown}[]) {
  const intentionAvg = DIMENSION_NAMES.map((_, i) => {
    const vals = intentions.map(int => (int.targetVector as number[])[i] ?? 5);
    return vals.length > 0 ? vals.reduce((a,b) => a+b, 0) / vals.length : 5;
  });
  return DIMENSION_NAMES.map((name, i) => {
    const gap = Math.abs(identityScores[i] - intentionAvg[i]);
    const severity = gap > 4 ? "critical" : gap > 3 ? "high" : gap > 2 ? "medium" : "low";
    return { dimension: i, dimensionName: name, identityScore: identityScores[i], intentionScore: intentionAvg[i], gapMagnitude: gap, severity };
  });
}

function detectShape(scores: number[]): string {
  const avg = scores.reduce((a,b) => a+b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + (s - avg) ** 2, 0) / scores.length;
  if (variance < 1) return "coherent sphere";
  if (variance < 4) return "balanced octahedron";
  return "asymmetric polytope";
}

router.get("/identity", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [geo] = await db.select().from(identityGeometriesTable)
      .where(eq(identityGeometriesTable.userId, userId))
      .orderBy(desc(identityGeometriesTable.createdAt))
      .limit(1);
    if (!geo) {
      res.status(404).json({ error: "No identity assessment found" });
      return;
    }
    res.json(geo);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/identity", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const { responses } = req.body;

    // Simple scoring: average the scores from responses
    const dimensionalScores = DIMENSION_NAMES.map((_, i) => {
      const relevant = (responses || []).filter((_: unknown, j: number) => j % 8 === i);
      if (relevant.length === 0) return 5;
      return Math.min(10, Math.max(1, relevant.length * 1.5 + 3));
    });

    const intentions = await db.select().from(intentionsTable)
      .where(eq(intentionsTable.userId, userId));

    const coherenceGaps = computeCoherenceGaps(dimensionalScores, intentions);
    const coherenceScore = 10 - (coherenceGaps.reduce((s, g) => s + g.gapMagnitude, 0) / coherenceGaps.length);
    const shapeType = detectShape(dimensionalScores);

    const id = generateId();
    const [geo] = await db.insert(identityGeometriesTable).values({
      id, userId, dimensionalScores, coherenceScore, shapeType, coherenceGaps, responses,
    }).returning();
    res.status(201).json(geo);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/identity/coherence-audit", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [geo] = await db.select().from(identityGeometriesTable)
      .where(eq(identityGeometriesTable.userId, userId))
      .orderBy(desc(identityGeometriesTable.createdAt))
      .limit(1);

    if (!geo) {
      res.json({
        overallCoherenceScore: 5,
        gaps: [],
        identityGeometry: null,
        totalGaps: 0,
        criticalGaps: 0,
        auditDate: new Date(),
      });
      return;
    }

    const gaps = geo.coherenceGaps as Array<{severity: string}>;
    const criticalGaps = gaps.filter(g => g.severity === "critical").length;

    res.json({
      overallCoherenceScore: geo.coherenceScore,
      gaps,
      identityGeometry: geo,
      totalGaps: gaps.length,
      criticalGaps,
      auditDate: geo.createdAt,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

import { Router } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db } from "../lib/db";
import { assessmentsTable, realityVectorsTable, patternLocksTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { generateId } from "../lib/id";

const router = Router();

const DIMENSION_NAMES = [
  "spatial", "temporal", "causal", "intentional",
  "identity", "emotional", "mental", "transcendent"
];

function computeOverallScore(scores: Record<string, number>): number {
  const values = Object.values(scores);
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function scoresTo8d(scores: Record<string, number>): number[] {
  return DIMENSION_NAMES.map(d => scores[d] ?? 5);
}

function computeMagnitude(components: number[]): number {
  return Math.sqrt(components.reduce((s, v) => s + v * v, 0));
}

function detectPatternLocks(userId: string, scores: Record<string, number>): Array<{id: string; userId: string; dimension: number; dimensionName: string; description: string; severity: number; status: "LOCKED"}> {
  const locks: Array<{id: string; userId: string; dimension: number; dimensionName: string; description: string; severity: number; status: "LOCKED"}> = [];
  DIMENSION_NAMES.forEach((name, i) => {
    const score = scores[name] ?? 5;
    if (score < 4) {
      locks.push({
        id: generateId(),
        userId,
        dimension: i,
        dimensionName: name,
        description: `Low ${name} coherence detected — pattern lock identified in the ${name} dimension`,
        severity: (4 - score) / 3,
        status: "LOCKED" as const,
      });
    }
  });
  return locks;
}

router.get("/assessments", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const limit = parseInt(req.query.limit as string) || 10;
    const typeFilter = req.query.type as string | undefined;

    const conditions = typeFilter
      ? and(eq(assessmentsTable.userId, userId), eq(assessmentsTable.type, typeFilter as "DIMENSIONAL_SCAN" | "COHERENCE_AUDIT" | "IDENTITY_MAP" | "PHASE_TRANSITION"))
      : eq(assessmentsTable.userId, userId);

    const list = await db.select().from(assessmentsTable)
      .where(conditions)
      .orderBy(desc(assessmentsTable.createdAt))
      .limit(limit);
    res.json(list);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/assessments", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const { type, dimensionScores, responses, phase = 1 } = req.body;
    const overallScore = computeOverallScore(dimensionScores);
    const id = generateId();

    const [assessment] = await db.insert(assessmentsTable).values({
      id,
      userId,
      type,
      dimensionScores,
      overallScore,
      phase,
      responses: responses ?? null,
    }).returning();

    // Create reality vector
    const components = scoresTo8d(dimensionScores);
    const magnitude = computeMagnitude(components);
    const vectorId = generateId();
    const [vector] = await db.insert(realityVectorsTable).values({
      id: vectorId,
      userId,
      assessmentId: id,
      components,
      magnitude,
      direction: components.map(c => c / (magnitude || 1)),
      trajectory: components.map(() => 0),
      stability: overallScore / 10,
    }).returning();

    // Create pattern locks
    const newLocks = detectPatternLocks(userId, dimensionScores);
    let patternLocks: typeof patternLocksTable.$inferSelect[] = [];
    if (newLocks.length > 0) {
      patternLocks = await db.insert(patternLocksTable).values(newLocks).returning();
    }

    const insights = [
      `Your overall coherence score is ${overallScore.toFixed(1)}/10`,
      ...newLocks.map(l => `Pattern lock detected in ${l.dimensionName} dimension`),
    ];

    res.status(201).json({ assessment, realityVector: vector, patternLocks, insights });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/assessments/latest", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [assessment] = await db.select().from(assessmentsTable)
      .where(eq(assessmentsTable.userId, userId))
      .orderBy(desc(assessmentsTable.createdAt))
      .limit(1);
    if (!assessment) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    const scores = assessment.dimensionScores as Record<string, number>;
    const components = scoresTo8d(scores);
    const magnitude = computeMagnitude(components);
    const vector = { id: "latest", userId, assessmentId: assessment.id, components, magnitude, direction: components.map(c => c / (magnitude || 1)), trajectory: [], stability: assessment.overallScore / 10, createdAt: assessment.createdAt };
    res.json({ assessment, realityVector: vector, patternLocks: [], insights: [] });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/assessments/:id", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [assessment] = await db.select().from(assessmentsTable)
      .where(and(eq(assessmentsTable.id, req.params.id), eq(assessmentsTable.userId, userId)))
      .limit(1);
    if (!assessment) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    const scores = assessment.dimensionScores as Record<string, number>;
    const components = scoresTo8d(scores);
    const magnitude = computeMagnitude(components);
    const vector = { id: generateId(), userId, assessmentId: assessment.id, components, magnitude, direction: components.map(c => c / (magnitude || 1)), trajectory: [], stability: assessment.overallScore / 10, createdAt: assessment.createdAt };
    res.json({ assessment, realityVector: vector, patternLocks: [], insights: [] });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "../lib/db";
import { assessmentsTable, usersTable, realityVectorsTable, patternLocksTable, intentionsTable, sessionsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router = Router();

const DIMENSION_LABELS = ["spatial","temporal","causal","intentional","identity","emotional","mental","transcendent"];

router.get("/analytics/dimensions", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const days = parseInt(req.query.days as string) || 90;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const assessments = await db.select().from(assessmentsTable)
      .where(eq(assessmentsTable.userId, userId))
      .orderBy(assessmentsTable.createdAt);

    const dataPoints = assessments.map(a => ({
      date: a.createdAt,
      scores: a.dimensionScores as Record<string, number>,
      overallScore: a.overallScore,
    }));

    // Find phase transitions from user history
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    res.json({
      dataPoints,
      dimensionLabels: DIMENSION_LABELS,
      phaseTransitions: user ? [{ phase: user.currentPhase, date: user.createdAt }] : [],
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/analytics/summary", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    const [latestAssessment] = await db.select().from(assessmentsTable)
      .where(eq(assessmentsTable.userId, userId))
      .orderBy(desc(assessmentsTable.createdAt)).limit(1);

    const [latestVector] = await db.select().from(realityVectorsTable)
      .where(eq(realityVectorsTable.userId, userId))
      .orderBy(desc(realityVectorsTable.createdAt)).limit(1);

    const patterns = await db.select().from(patternLocksTable)
      .where(eq(patternLocksTable.userId, userId));

    const intentions = await db.select().from(intentionsTable)
      .where(eq(intentionsTable.userId, userId));

    const sessions = await db.select().from(sessionsTable)
      .where(eq(sessionsTable.userId, userId));

    const defaultScores = { spatial:5,temporal:5,causal:5,intentional:5,identity:5,emotional:5,mental:5,transcendent:5 };
    const dimensionScores = latestAssessment?.dimensionScores as Record<string, number> ?? defaultScores;
    const overallCoherence = latestAssessment?.overallScore ?? 5;

    const activeIntentions = intentions.filter(i => i.isActive);
    const constellationHarmony = activeIntentions.length > 0
      ? activeIntentions.reduce((s, i) => s + i.crystallizationScore, 0) / activeIntentions.length
      : 0;

    const resolvedPatterns = patterns.filter(p => p.status === "RESOLVED").length;
    const totalTransformation = (overallCoherence * 10) + (resolvedPatterns * 50) + (sessions.length * 2) + ((user?.currentPhase ?? 1) * 100);

    res.json({
      currentPhase: user?.currentPhase ?? 1,
      overallCoherenceScore: overallCoherence,
      dimensionScores,
      vectorMagnitude: latestVector?.magnitude ?? 0,
      patternLocksResolved: resolvedPatterns,
      patternLocksTotal: patterns.length,
      intentionsActive: activeIntentions.length,
      constellationHarmony,
      practiceStreak: user?.streakDays ?? 0,
      totalTransformationScore: totalTransformation,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

import { Router } from "express";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import { db } from "../lib/db";
import { usersTable, chapterProgressTable, sessionsTable, chaptersTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router = Router();

const PHASE_CONFIG = [
  { phase: 1, name: "Awakening", description: "The initial stirring of consciousness — recognizing the malleable nature of reality", chapterRange: [1, 5], unlockedTools: ["scanner"] },
  { phase: 2, name: "Clearing", description: "Releasing legacy patterns and timeline artifacts that constrain your reality field", chapterRange: [6, 10], unlockedTools: ["scanner", "echo_field"] },
  { phase: 3, name: "Mapping", description: "Cartographing the multi-dimensional terrain of your identity geometry", chapterRange: [11, 15], unlockedTools: ["scanner", "echo_field", "identity_mapping"] },
  { phase: 4, name: "Crystallizing", description: "Encoding precise intention structures into standing wave formations", chapterRange: [16, 20], unlockedTools: ["scanner", "echo_field", "identity_mapping", "crystallizer"] },
  { phase: 5, name: "Weaving", description: "Integrating all dimensional elements into a unified reality field", chapterRange: [21, 26], unlockedTools: ["scanner", "echo_field", "identity_mapping", "crystallizer"] },
  { phase: 6, name: "Transmitting", description: "Broadcasting your coherent reality signature into the collective field", chapterRange: [27, 31], unlockedTools: ["scanner", "echo_field", "identity_mapping", "crystallizer"] },
  { phase: 7, name: "Mastering", description: "Achieving sovereign command over your multi-dimensional reality architecture", chapterRange: [32, 37], unlockedTools: ["scanner", "echo_field", "identity_mapping", "crystallizer"] },
  { phase: 8, name: "Transcending", description: "Operating as a fully conscious reality architect at the E₈ level of coherence", chapterRange: [38, 42], unlockedTools: ["scanner", "echo_field", "identity_mapping", "crystallizer"] },
];

const TIER_ORDER = { FREE: 0, EXPLORER: 1, ARCHITECT: 2, CERTIFIED: 3 } as const;
type Tier = keyof typeof TIER_ORDER;
function hasTier(userTier: string, requiredTier: Tier): boolean {
  return (TIER_ORDER[userTier as Tier] ?? 0) >= TIER_ORDER[requiredTier];
}

const CHAPTERS_PER_PHASE_REQUIRED = 1.0; // 100% of chapters must be completed
const SESSIONS_PER_PHASE_REQUIRED = 3;

router.get("/phases", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const currentPhase = user?.currentPhase ?? 1;
    const tier = user?.subscriptionTier ?? "FREE";

    const phases = PHASE_CONFIG.map(p => ({
      ...p,
      isUnlocked: p.phase <= currentPhase,
      isCompleted: p.phase < currentPhase,
      requiresSubscription: p.phase >= 5 && !hasTier(tier, "ARCHITECT"),
    }));
    res.json(phases);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/phases/current", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const currentPhase = user?.currentPhase ?? 1;
    const config = PHASE_CONFIG[currentPhase - 1];
    const [phaseStart, phaseEnd] = config.chapterRange;

    // Get all chapter IDs in the current phase range
    const phaseChapters = await db.select({ id: chaptersTable.id })
      .from(chaptersTable)
      .where(and(gte(chaptersTable.sequence, phaseStart), lte(chaptersTable.sequence, phaseEnd)));

    const chapterIds = phaseChapters.map(c => c.id);
    const chaptersRequired = phaseChapters.length;

    let doneCount = 0;
    let reflectionSubmitted = false;

    if (chapterIds.length > 0) {
      const completedProgress = await db.select().from(chapterProgressTable)
        .where(and(
          eq(chapterProgressTable.userId, userId),
          inArray(chapterProgressTable.chapterId, chapterIds),
          eq(chapterProgressTable.isComplete, true)
        ));
      doneCount = completedProgress.length;
      reflectionSubmitted = completedProgress.some(p => p.reflectionSubmitted);
    }

    const sessions = await db.select().from(sessionsTable)
      .where(and(eq(sessionsTable.userId, userId), eq(sessionsTable.phase, currentPhase)));
    const practiceCompleted = sessions.length;
    const toolSessionsCompleted = sessions.filter(s => s.type === "tool").length;

    const missingReqs: string[] = [];
    if (doneCount < chaptersRequired) {
      missingReqs.push(`Complete ${chaptersRequired - doneCount} more chapter${chaptersRequired - doneCount === 1 ? "" : "s"} (${doneCount}/${chaptersRequired})`);
    }
    if (practiceCompleted < SESSIONS_PER_PHASE_REQUIRED) {
      missingReqs.push(`Complete ${SESSIONS_PER_PHASE_REQUIRED - practiceCompleted} more practice session${SESSIONS_PER_PHASE_REQUIRED - practiceCompleted === 1 ? "" : "s"} (${practiceCompleted}/${SESSIONS_PER_PHASE_REQUIRED})`);
    }

    // Subscription gate for advancing to phase 5+
    const nextPhase = currentPhase + 1;
    if (nextPhase >= 5 && !hasTier(user?.subscriptionTier ?? "FREE", "ARCHITECT")) {
      missingReqs.push("ARCHITECT or CERTIFIED subscription required to unlock Phase 5+");
    }

    res.json({
      currentPhase,
      phaseName: config.name,
      chaptersCompleted: doneCount,
      chaptersRequired,
      toolSessionsCompleted,
      toolSessionsRequired: 3,
      practiceSessionsCompleted: practiceCompleted,
      practiceSessionsRequired: SESSIONS_PER_PHASE_REQUIRED,
      reflectionSubmitted,
      canAdvance: missingReqs.length === 0 && currentPhase < 8,
      percentComplete: chaptersRequired > 0 ? Math.min(100, (doneCount / chaptersRequired) * 100) : 0,
      missingRequirements: missingReqs,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/phases/:phase/advance", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) { res.status(404).json({ error: "Not Found" }); return; }

    const currentPhase = user.currentPhase;

    if (currentPhase >= 8) {
      res.json({ success: false, newPhase: null, message: "Already at maximum phase — you have transcended.", missingRequirements: [] });
      return;
    }

    const config = PHASE_CONFIG[currentPhase - 1];
    const [phaseStart, phaseEnd] = config.chapterRange;

    // Get all chapters in the current phase
    const phaseChapters = await db.select({ id: chaptersTable.id })
      .from(chaptersTable)
      .where(and(gte(chaptersTable.sequence, phaseStart), lte(chaptersTable.sequence, phaseEnd)));

    const chapterIds = phaseChapters.map(c => c.id);
    const chaptersRequired = phaseChapters.length;
    let doneCount = 0;

    if (chapterIds.length > 0) {
      const completedProgress = await db.select().from(chapterProgressTable)
        .where(and(
          eq(chapterProgressTable.userId, userId),
          inArray(chapterProgressTable.chapterId, chapterIds),
          eq(chapterProgressTable.isComplete, true)
        ));
      doneCount = completedProgress.length;
    }

    const sessions = await db.select().from(sessionsTable)
      .where(and(eq(sessionsTable.userId, userId), eq(sessionsTable.phase, currentPhase)));
    const practiceCompleted = sessions.length;

    const missingReqs: string[] = [];
    if (doneCount < chaptersRequired) {
      missingReqs.push(`Complete ${chaptersRequired - doneCount} more chapter${chaptersRequired - doneCount === 1 ? "" : "s"} in Phase ${currentPhase} (${doneCount}/${chaptersRequired})`);
    }
    if (practiceCompleted < SESSIONS_PER_PHASE_REQUIRED) {
      missingReqs.push(`Log ${SESSIONS_PER_PHASE_REQUIRED - practiceCompleted} more practice session${SESSIONS_PER_PHASE_REQUIRED - practiceCompleted === 1 ? "" : "s"} for Phase ${currentPhase} (${practiceCompleted}/${SESSIONS_PER_PHASE_REQUIRED})`);
    }

    const newPhase = currentPhase + 1;

    // Subscription gate for Phase 5+
    if (newPhase >= 5 && !hasTier(user.subscriptionTier, "ARCHITECT")) {
      res.status(403).json({
        error: "SubscriptionRequired",
        success: false,
        message: "Phase 5+ requires an ARCHITECT or CERTIFIED subscription",
        missingRequirements: ["ARCHITECT or CERTIFIED subscription required"],
        requiredTier: "ARCHITECT",
        currentTier: user.subscriptionTier,
      });
      return;
    }

    if (missingReqs.length > 0) {
      res.json({ success: false, newPhase: null, message: "Progression requirements not met", missingRequirements: missingReqs });
      return;
    }

    await db.update(usersTable).set({ currentPhase: newPhase, updatedAt: new Date() }).where(eq(usersTable.id, userId));
    res.json({
      success: true,
      newPhase,
      message: `Phase ${newPhase} — ${PHASE_CONFIG[newPhase - 1].name} — unlocked. The field recognizes your advancement.`,
      missingRequirements: [],
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

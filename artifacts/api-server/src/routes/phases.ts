import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { usersTable, chapterProgressTable, sessionsTable } from "@workspace/db";
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

router.get("/phases", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const currentPhase = user?.currentPhase ?? 1;

    const phases = PHASE_CONFIG.map(p => ({
      ...p,
      isUnlocked: p.phase <= currentPhase,
      isCompleted: p.phase < currentPhase,
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

    // Count completed chapters in current phase range
    const chaptersCompleted = await db.select().from(chapterProgressTable)
      .where(eq(chapterProgressTable.userId, userId));

    const chaptersRequired = config.chapterRange[1] - config.chapterRange[0] + 1;
    const doneCount = chaptersCompleted.filter(p => p.isComplete).length;
    const sessions = await db.select().from(sessionsTable)
      .where(eq(sessionsTable.userId, userId));
    const practiceRequired = 5;
    const practiceCompleted = sessions.filter(s => s.phase === currentPhase).length;

    const missingReqs: string[] = [];
    if (doneCount < chaptersRequired) missingReqs.push(`Complete ${chaptersRequired - doneCount} more chapters`);
    if (practiceCompleted < practiceRequired) missingReqs.push(`Complete ${practiceRequired - practiceCompleted} more practice sessions`);

    res.json({
      currentPhase,
      phaseName: config.name,
      chaptersCompleted: doneCount,
      chaptersRequired,
      toolSessionsCompleted: sessions.filter(s => s.type === "tool").length,
      toolSessionsRequired: 3,
      practiceSessionsCompleted: practiceCompleted,
      practiceSessionsRequired: practiceRequired,
      reflectionSubmitted: chaptersCompleted.some(p => p.reflectionSubmitted),
      canAdvance: missingReqs.length === 0 && currentPhase < 8,
      percentComplete: Math.min(100, (doneCount / chaptersRequired) * 100),
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
    const targetPhase = parseInt(req.params.phase);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) { res.status(404).json({ error: "Not Found" }); return; }

    if (user.currentPhase >= 8) {
      res.json({ success: false, newPhase: null, message: "Already at maximum phase", missingRequirements: [] });
      return;
    }

    const newPhase = user.currentPhase + 1;
    await db.update(usersTable).set({ currentPhase: newPhase, updatedAt: new Date() }).where(eq(usersTable.id, userId));
    res.json({ success: true, newPhase, message: `Phase ${newPhase} unlocked. Welcome to ${PHASE_CONFIG[newPhase - 1].name}.`, missingRequirements: [] });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

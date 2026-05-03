import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { achievementsTable, userAchievementsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router = Router();

const ALL_ACHIEVEMENTS = [
  { id: "ach_first_scan", type: "FIRST_SCAN", name: "First Contact", description: "Complete your first dimensional scan", iconType: "scan", points: "100" },
  { id: "ach_phase2", type: "PHASE_2", name: "Clarity Seeker", description: "Advance to Phase 2: Clearing", iconType: "phase", points: "250" },
  { id: "ach_phase3", type: "PHASE_3", name: "Pattern Cartographer", description: "Advance to Phase 3: Mapping", iconType: "phase", points: "500" },
  { id: "ach_first_intention", type: "FIRST_INTENTION", name: "Intention Architect", description: "Create your first intention", iconType: "intention", points: "150" },
  { id: "ach_constellation", type: "FIRST_CONSTELLATION", name: "Star Weaver", description: "Create your first intention constellation", iconType: "constellation", points: "300" },
  { id: "ach_streak_7", type: "STREAK_7", name: "7-Day Practitioner", description: "Maintain a 7-day practice streak", iconType: "streak", points: "200" },
  { id: "ach_streak_30", type: "STREAK_30", name: "Monthly Devotee", description: "Maintain a 30-day practice streak", iconType: "streak", points: "750" },
  { id: "ach_ai_coach", type: "FIRST_AI_SESSION", name: "Neural Bridge", description: "Complete your first AI coach session", iconType: "ai", points: "100" },
  { id: "ach_journal_10", type: "JOURNAL_10", name: "Inner Scribe", description: "Write 10 journal entries", iconType: "journal", points: "200" },
  { id: "ach_pattern_resolved", type: "PATTERN_RESOLVED", name: "Pattern Breaker", description: "Resolve your first pattern lock", iconType: "pattern", points: "400" },
];

router.get("/achievements", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;

    // Ensure all achievement records exist
    for (const ach of ALL_ACHIEVEMENTS) {
      const existing = await db.select().from(achievementsTable).where(eq(achievementsTable.id, ach.id)).limit(1);
      if (existing.length === 0) {
        await db.insert(achievementsTable).values(ach).onConflictDoNothing();
      }
    }

    const earned = await db.select().from(userAchievementsTable)
      .where(eq(userAchievementsTable.userId, userId));
    const earnedIds = new Set(earned.map(e => e.achievementId));

    const all = ALL_ACHIEVEMENTS.map(a => ({ ...a, isEarned: earnedIds.has(a.id), earnedAt: earned.find(e => e.achievementId === a.id)?.earnedAt ?? null }));
    const earnedList = all.filter(a => a.isEarned);
    const available = all.filter(a => !a.isEarned);
    const totalPoints = earnedList.reduce((s, a) => s + parseInt(a.points), 0);

    res.json({ earned: earnedList, available, totalPoints });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

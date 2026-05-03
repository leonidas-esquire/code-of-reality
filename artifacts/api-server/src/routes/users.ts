import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { usersTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router = Router();

router.get("/users/me", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      currentPhase: user.currentPhase,
      onboardingDone: user.onboardingDone,
      subscriptionTier: user.subscriptionTier,
      streakDays: user.streakDays,
      totalSessions: user.totalSessions,
      createdAt: user.createdAt,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/users/me", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const { displayName, avatarUrl } = req.body;
    const [user] = await db.update(usersTable)
      .set({ displayName, avatarUrl, updatedAt: new Date() })
      .where(eq(usersTable.id, userId))
      .returning();
    res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      currentPhase: user.currentPhase,
      onboardingDone: user.onboardingDone,
      subscriptionTier: user.subscriptionTier,
      streakDays: user.streakDays,
      totalSessions: user.totalSessions,
      createdAt: user.createdAt,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/users/me/onboarding", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [user] = await db.update(usersTable)
      .set({ onboardingDone: true, updatedAt: new Date() })
      .where(eq(usersTable.id, userId))
      .returning();
    res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      currentPhase: user.currentPhase,
      onboardingDone: user.onboardingDone,
      subscriptionTier: user.subscriptionTier,
      streakDays: user.streakDays,
      totalSessions: user.totalSessions,
      createdAt: user.createdAt,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

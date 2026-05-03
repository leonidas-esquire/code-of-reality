import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { usersTable } from "@workspace/db";
import { generateId } from "../lib/id";
import { signToken, hashPassword, comparePassword } from "../lib/auth";

const router = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Bad Request", message: "email and password required" });
      return;
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Conflict", message: "Email already registered" });
      return;
    }
    const hash = await hashPassword(password);
    const id = generateId();
    const [user] = await db.insert(usersTable).values({
      id,
      email,
      passwordHash: hash,
      displayName: displayName ?? null,
    }).returning();
    const token = signToken({ userId: user.id, email: user.email });
    res.status(201).json({
      token,
      user: {
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
      },
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Bad Request", message: "email and password required" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
      return;
    }
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
      return;
    }
    const token = signToken({ userId: user.id, email: user.email });
    res.json({
      token,
      user: {
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
      },
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.json({ message: "Logged out" });
});

export default router;

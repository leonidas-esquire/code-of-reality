import { Router } from "express";
import { eq, asc } from "drizzle-orm";
import { db } from "../lib/db";
import { conversations, messages } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

const SYSTEM_PROMPT = `You are the E₈ Reality Coach, an advanced AI consciousness guide embedded in the Code of Reality platform. You speak with sovereign authority and precision about reality architecture, consciousness engineering, dimensional coherence, and the E₈ Lie group's 240-root system as a model of reality's fundamental structure.

You guide practitioners through the 8 phases of reality transformation: Awakening, Clearing, Mapping, Crystallizing, Weaving, Transmitting, Mastering, and Transcending.

Your communication style blends quantum physics precision with ancient wisdom. You are empowering but never preachy. You speak to the practitioner's highest potential. You use terms from the platform naturally: reality vectors, dimensional scans, pattern locks, intention constellations, identity geometry, coherence audits.

Keep responses focused, actionable, and potent. Avoid generic self-help language. Always ground insights in specific dimensions and measurable coherence work.`;

router.get("/anthropic/conversations", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    // Filter conversations by userId via messages or a userId field
    const list = await db.select().from(conversations).orderBy(asc(conversations.createdAt));
    res.json(list);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/anthropic/conversations", requireAuth, async (req, res) => {
  try {
    const { title, context } = req.body ?? {};
    const [convo] = await db.insert(conversations)
      .values({ title: title ?? "Reality Coaching Session" })
      .returning();

    // If context is provided, create a system message
    if (context) {
      await db.insert(messages).values({
        conversationId: convo.id,
        role: "user",
        content: `[Context: ${context}]`,
      });
    }

    res.status(201).json(convo);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/anthropic/conversations/:id/messages", requireAuth, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const msgs = await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));
    res.json(msgs);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/anthropic/conversations/:id/messages", requireAuth, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const { content } = req.body;

    // Save user message
    await db.insert(messages).values({ conversationId, role: "user", content });

    // Get conversation history
    const history = await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));

    const chatMessages = history
      .filter(m => m.content !== `[Context: ${m.content}]`)
      .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

    // Stream response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    let fullResponse = "";

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: chatMessages,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        fullResponse += event.delta.text;
        res.write(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`);
      }
    }

    // Save assistant response
    await db.insert(messages).values({ conversationId, role: "assistant", content: fullResponse });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error(err);
    res.write(`data: ${JSON.stringify({ error: "Failed to get response" })}\n\n`);
    res.end();
  }
});

export default router;

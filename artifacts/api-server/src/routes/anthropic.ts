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

/** Serialize a DB conversation row to match the OpenAPI Conversation schema (id as string, updatedAt present) */
function serializeConversation(c: typeof conversations.$inferSelect) {
  return {
    id: String(c.id),
    userId: c.userId,
    title: c.title,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

/** Serialize a DB message row to match the OpenAPI Message schema (id and conversationId as strings) */
function serializeMessage(m: typeof messages.$inferSelect) {
  return {
    id: String(m.id),
    conversationId: String(m.conversationId),
    role: m.role,
    content: m.content,
    createdAt: m.createdAt,
  };
}

router.get("/anthropic/conversations", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const list = await db.select().from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(asc(conversations.createdAt));
    res.json(list.map(serializeConversation));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/anthropic/conversations", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const { title, context } = req.body ?? {};
    const [convo] = await db.insert(conversations)
      .values({ userId, title: title ?? "Reality Coaching Session" })
      .returning();

    if (context) {
      await db.insert(messages).values({
        conversationId: convo.id,
        role: "user",
        content: `[Context: ${context}]`,
      });
    }

    res.status(201).json(serializeConversation(convo));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/anthropic/conversations/:id/messages", requireAuth, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    if (isNaN(conversationId)) { res.status(400).json({ error: "Invalid conversation ID" }); return; }
    const msgs = await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));
    res.json(msgs.map(serializeMessage));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/anthropic/conversations/:id/messages", requireAuth, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    if (isNaN(conversationId)) { res.status(400).json({ error: "Invalid conversation ID" }); return; }
    const { content } = req.body;

    await db.insert(messages).values({ conversationId, role: "user", content });

    const history = await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));

    const chatMessages = history.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

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

    await db.insert(messages).values({ conversationId, role: "assistant", content: fullResponse });
    // Update conversation updatedAt
    await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, conversationId));
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error(err);
    res.write(`data: ${JSON.stringify({ error: "Failed to get response" })}\n\n`);
    res.end();
  }
});

export default router;

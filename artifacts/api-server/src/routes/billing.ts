import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import Stripe from "stripe";
import { db } from "../lib/db";
import { usersTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/auth";
import {
  findOrCreateStripeCustomer,
  createCheckoutSession,
  createCustomerPortalSession,
  getActiveSubscription,
} from "../lib/stripeService";

const router = Router();

const TIER_FROM_META: Record<string, "ARCHITECT" | "CERTIFIED"> = {
  ARCHITECT: "ARCHITECT",
  CERTIFIED: "CERTIFIED",
};

/** GET /api/billing/products — list plans for pricing page */
router.get("/billing/products", async (req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT
        p.id as product_id,
        p.name as product_name,
        p.description as product_description,
        p.metadata as product_metadata,
        pr.id as price_id,
        pr.unit_amount,
        pr.currency,
        pr.recurring
      FROM stripe.products p
      LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      WHERE p.active = true
      ORDER BY pr.unit_amount ASC NULLS LAST
    `);

    const map = new Map<string, Record<string, unknown>>();
    for (const row of result.rows as Record<string, unknown>[]) {
      const pid = row.product_id as string;
      if (!map.has(pid)) {
        map.set(pid, {
          id: pid,
          name: row.product_name,
          description: row.product_description,
          metadata: row.product_metadata,
          prices: [],
        });
      }
      if (row.price_id) {
        (map.get(pid)!.prices as unknown[]).push({
          id: row.price_id,
          unitAmount: row.unit_amount,
          currency: row.currency,
          recurring: row.recurring,
        });
      }
    }

    res.json({ products: Array.from(map.values()) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error", message: "Stripe may not be configured yet" });
  }
});

/** GET /api/billing/subscription — current user subscription status */
router.get("/billing/subscription", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) { res.status(404).json({ error: "Not Found" }); return; }

    if (!user.stripeCustomerId) {
      res.json({ subscription: null, tier: user.subscriptionTier });
      return;
    }

    const sub = await getActiveSubscription(user.stripeCustomerId);
    res.json({
      subscription: sub ? {
        id: sub.id,
        status: sub.status,
        currentPeriodEnd: new Date((sub as { current_period_end: number }).current_period_end * 1000),
      } : null,
      tier: user.subscriptionTier,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** POST /api/billing/checkout — create Stripe checkout session */
router.post("/billing/checkout", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const { priceId } = req.body;
    if (!priceId) { res.status(400).json({ error: "priceId required" }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) { res.status(404).json({ error: "Not Found" }); return; }

    const customerId = await findOrCreateStripeCustomer(userId, user.email, user.stripeCustomerId);

    if (!user.stripeCustomerId) {
      await db.update(usersTable).set({ stripeCustomerId: customerId }).where(eq(usersTable.id, userId));
    }

    const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
    const baseUrl = domain ? `https://${domain}/code-of-reality` : "http://localhost:5173";

    const session = await createCheckoutSession(
      customerId,
      priceId,
      `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/pricing`
    );

    res.json({ url: session.url });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** POST /api/billing/portal — create Stripe customer portal session */
router.post("/billing/portal", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user?.stripeCustomerId) {
      res.status(400).json({ error: "No Stripe customer found" });
      return;
    }

    const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
    const returnUrl = domain ? `https://${domain}/code-of-reality/pricing` : "http://localhost:5173/pricing";

    const portal = await createCustomerPortalSession(user.stripeCustomerId, returnUrl);
    res.json({ url: portal.url });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** POST /api/billing/sync — sync subscription tier from Stripe API */
router.post("/billing/sync", requireAuth, async (req, res) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) { res.status(404).json({ error: "Not Found" }); return; }

    if (!user.stripeCustomerId) {
      res.json({ tier: user.subscriptionTier });
      return;
    }

    const sub = await getActiveSubscription(user.stripeCustomerId);
    let tier: "FREE" | "EXPLORER" | "ARCHITECT" | "CERTIFIED" = "FREE";

    if (sub) {
      const item = sub.items?.data?.[0];
      const product = item?.price?.product as Stripe.Product | undefined;
      const metaTier = product?.metadata?.tier;
      tier = TIER_FROM_META[metaTier ?? ""] ?? "ARCHITECT";
    }

    await db.update(usersTable)
      .set({ subscriptionTier: tier, stripeSubscriptionId: sub?.id ?? null, updatedAt: new Date() })
      .where(eq(usersTable.id, userId));

    res.json({ tier });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

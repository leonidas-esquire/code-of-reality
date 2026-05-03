import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { getStripeSync } from "./stripeClient";
import { db } from "./db";
import { usersTable } from "@workspace/db";

async function syncSubscriptionTier(sub: Stripe.Subscription): Promise<void> {
  try {
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const [user] = await db.select({ id: usersTable.id })
      .from(usersTable).where(eq(usersTable.stripeCustomerId, customerId)).limit(1);
    if (!user) return;

    // Determine tier from subscription metadata
    const item = sub.items?.data?.[0];
    const product = item?.price?.product as Stripe.Product | undefined;
    const metaTier = product?.metadata?.tier;
    let tier: "FREE" | "EXPLORER" | "ARCHITECT" | "CERTIFIED" = "ARCHITECT";
    if (metaTier === "CERTIFIED") tier = "CERTIFIED";
    else if (metaTier === "ARCHITECT") tier = "ARCHITECT";

    await db.update(usersTable)
      .set({ subscriptionTier: tier, stripeSubscriptionId: sub.id, updatedAt: new Date() })
      .where(eq(usersTable.id, user.id));
  } catch (err) {
    console.error("Failed to sync subscription tier:", err);
  }
}

async function revokeSubscriptionTier(customerId: string): Promise<void> {
  try {
    const [user] = await db.select({ id: usersTable.id })
      .from(usersTable).where(eq(usersTable.stripeCustomerId, customerId)).limit(1);
    if (!user) return;
    await db.update(usersTable)
      .set({ subscriptionTier: "FREE", stripeSubscriptionId: null, updatedAt: new Date() })
      .where(eq(usersTable.id, user.id));
  } catch (err) {
    console.error("Failed to revoke subscription tier:", err);
  }
}

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        "STRIPE WEBHOOK ERROR: Payload must be a Buffer. " +
        "Ensure webhook route is registered BEFORE app.use(express.json())."
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    try {
      const event = JSON.parse(payload.toString()) as Stripe.Event;
      if (
        event.type === "customer.subscription.created" ||
        event.type === "customer.subscription.updated"
      ) {
        await syncSubscriptionTier(event.data.object as Stripe.Subscription);
      } else if (event.type === "customer.subscription.deleted") {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await revokeSubscriptionTier(customerId);
      }
    } catch {
      // Non-fatal: stripe schema is already synced, tier update is best-effort
    }
  }
}

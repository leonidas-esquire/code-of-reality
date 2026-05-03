import { getUncachableStripeClient } from "./stripeClient";

export async function findOrCreateStripeCustomer(userId: string, email: string, existingCustomerId?: string | null): Promise<string> {
  const stripe = await getUncachableStripeClient();
  if (existingCustomerId) return existingCustomerId;
  const customer = await stripe.customers.create({ email, metadata: { userId } });
  return customer.id;
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const stripe = await getUncachableStripeClient();
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  const stripe = await getUncachableStripeClient();
  return stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
}

export async function getActiveSubscription(customerId: string) {
  const stripe = await getUncachableStripeClient();
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    expand: ["data.items.data.price.product"],
    limit: 1,
  });
  return subs.data[0] ?? null;
}

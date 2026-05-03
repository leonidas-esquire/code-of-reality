import { getUncachableStripeClient } from "./stripeClient";

async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  console.log("Seeding E₈ RealityMastery products...");

  // --- ARCHITECT tier ---
  const existingArchitect = await stripe.products.search({ query: "name:'E₈ ARCHITECT' AND active:'true'" });
  if (existingArchitect.data.length > 0) {
    console.log("ARCHITECT product already exists:", existingArchitect.data[0].id);
  } else {
    const architect = await stripe.products.create({
      name: "E₈ ARCHITECT",
      description: "Phases 5–8: Weaving, Transmitting, Mastering, Transcending — plus full AI Reality Coach access.",
      metadata: { tier: "ARCHITECT" },
    });
    const price = await stripe.prices.create({
      product: architect.id,
      unit_amount: 4900,
      currency: "usd",
      recurring: { interval: "month" },
    });
    console.log("Created ARCHITECT:", architect.id, "Price:", price.id, "($49/mo)");
  }

  // --- CERTIFIED tier ---
  const existingCertified = await stripe.products.search({ query: "name:'E₈ CERTIFIED' AND active:'true'" });
  if (existingCertified.data.length > 0) {
    console.log("CERTIFIED product already exists:", existingCertified.data[0].id);
  } else {
    const certified = await stripe.products.create({
      name: "E₈ CERTIFIED",
      description: "Everything in ARCHITECT plus E₈ Mastery Certification, private masterminds, and 1:1 reality architecture sessions.",
      metadata: { tier: "CERTIFIED" },
    });
    const price = await stripe.prices.create({
      product: certified.id,
      unit_amount: 9900,
      currency: "usd",
      recurring: { interval: "month" },
    });
    console.log("Created CERTIFIED:", certified.id, "Price:", price.id, "($99/mo)");
  }

  console.log("Seeding complete.");
}

seedProducts().catch(err => { console.error(err); process.exit(1); });

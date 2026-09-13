const Stripe = require("stripe");
const Order = require("../models/Order");
const connectToMongoDB = require("../database/connectToMongoDB");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * The actual proof a payment happened - not the frontend's
 * ?checkout=success redirect, which anyone could reach by typing the URL
 * without ever paying. Stripe signs every delivery, so this is the only
 * place in the API that trusts a checkout session enough to create a real
 * Order from it.
 *
 * Mounted with express.raw() ahead of the app's normal express.json(),
 * because Stripe's signature covers the exact raw request bytes - a
 * JSON-parsed-and-reserialized body would never verify.
 */
const handleStripeWebhook = asyncHandler(async (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new AppError("Stripe webhooks are not configured.", 500, "WEBHOOK_NOT_CONFIGURED");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    throw new AppError(`Webhook signature verification failed: ${error.message}`, 400, "INVALID_WEBHOOK_SIGNATURE");
  }

  if (event.type !== "checkout.session.completed") {
    return res.status(200).json({ received: true });
  }

  const session = event.data.object;

  await connectToMongoDB();

  // Stripe retries webhook delivery on any non-2xx response, so a session
  // already turned into an Order must not create a duplicate.
  const alreadyRecorded = await Order.findOne({ stripeSessionId: session.id });
  if (alreadyRecorded) {
    return res.status(200).json({ received: true });
  }

  const items = session.metadata?.items ? JSON.parse(session.metadata.items) : [];

  await Order.create({
    clerkUserId: session.metadata?.clerkUserId || undefined,
    stripeSessionId: session.id,
    products: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    totalPrice: session.amount_total / 100,
  });

  res.status(200).json({ received: true });
});

module.exports = { handleStripeWebhook };

const Stripe = require("stripe");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Creates a Stripe Checkout Session (test mode - whatever key is configured)
 * for the given cart items. Stateless with respect to this API's own
 * database: the frontend's cart is client-side only, so there is no backend
 * Cart/Customer record to attach this to yet.
 */
const createCheckoutSession = asyncHandler(async (req, res) => {
  // Constructed per call, not at module scope - the Stripe SDK throws
  // synchronously in its constructor when no key is present, which would
  // crash on require() alone, before requireStripeConfigured ever runs.
  // A missing key still fails safely: requireStripeConfigured 500s first.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { items } = req.body;

  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== new Set(productIds).size) {
    throw new AppError("One or more products could not be found.", 404, "PRODUCT_NOT_FOUND");
  }

  const productsById = new Map(products.map((product) => [product._id.toString(), product]));

  // unit_amount always comes from the database's price field, never from
  // the request - see validateCheckoutRequest.
  const lineItems = items.map((item) => {
    const product = productsById.get(item.productId);

    if (item.quantity > product.stock) {
      throw new AppError(`Only ${product.stock} left of ${product.name}.`, 400, "INSUFFICIENT_STOCK");
    }

    return {
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(product.price * 100),
        product_data: {
          name: product.name,
          images: product.image ? [product.image] : undefined,
        },
      },
    };
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    // {CHECKOUT_SESSION_ID} is a literal Stripe placeholder, substituted
    // with the real session id on redirect - the confirmation page uses it
    // to fetch what was actually charged, not just whatever the client-side
    // cart happened to contain when checkout was clicked.
    success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/cart?checkout=cancelled`,
    // Managed Payments (on by default on newer Stripe accounts) requires a
    // tax_code on every line item, meant for real tax compliance - not
    // something a test-mode portfolio demo needs.
    managed_payments: { enabled: false },
    // Carried through to the checkout.session.completed webhook, which is
    // the only place an Order actually gets created - metadata values must
    // be strings, so the cart is round-tripped as JSON.
    metadata: {
      clerkUserId: req.clerkUserId || "",
      items: JSON.stringify(
        items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
      ),
    },
  });

  res.status(200).json({
    message: "Checkout session created successfully.",
    url: session.url,
  });
});

/**
 * Retrieves a completed Checkout Session's real line items and total, for
 * the confirmation page to display. No admin lock, matching
 * createCheckoutSession - a session id is Stripe-generated and effectively
 * unguessable, and reveals nothing beyond what was in that one purchase.
 */
const getCheckoutSession = asyncHandler(async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { sessionId } = req.params;

  if (!sessionId.startsWith("cs_")) {
    throw new AppError("Invalid checkout session id.", 400, "INVALID_SESSION_ID");
  }

  const session = await stripe.checkout.sessions
    .retrieve(sessionId)
    .catch(() => null);

  if (!session) {
    throw new AppError("Checkout session not found.", 404, "SESSION_NOT_FOUND");
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);

  res.status(200).json({
    message: "Checkout session retrieved successfully.",
    paid: session.payment_status === "paid",
    total: session.amount_total / 100,
    items: lineItems.data.map((item) => ({
      name: item.description,
      quantity: item.quantity,
      amount: item.amount_total / 100,
    })),
  });
});

module.exports = { createCheckoutSession, getCheckoutSession };

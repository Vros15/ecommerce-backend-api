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
    success_url: `${frontendUrl}/cart?checkout=success`,
    cancel_url: `${frontendUrl}/cart?checkout=cancelled`,
    // Managed Payments (on by default on newer Stripe accounts) requires a
    // tax_code on every line item, meant for real tax compliance - not
    // something a test-mode portfolio demo needs.
    managed_payments: { enabled: false },
  });

  res.status(200).json({
    message: "Checkout session created successfully.",
    url: session.url,
  });
});

module.exports = { createCheckoutSession };

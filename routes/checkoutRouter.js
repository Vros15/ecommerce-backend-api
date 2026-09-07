const express = require("express");
const router = express.Router();
const { createCheckoutSession, getCheckoutSession } = require("../controllers/checkoutController");
const { validateCheckoutBody } = require("../middlewares/validateCheckoutRequest");
const requireStripeConfigured = require("../middlewares/requireStripeConfigured");

// No requireAuth/requireAdmin on either route, unlike every other write
// route in this API - neither writes to our own database, and a session id
// is Stripe-generated and effectively unguessable.

// POST create a Stripe Checkout Session for the given cart items
// endpoint: POST /api/checkout
router.post("/", requireStripeConfigured, validateCheckoutBody, createCheckoutSession);

// GET a completed session's real line items and total, for the
// confirmation page
// endpoint: GET /api/checkout/session/:sessionId
router.get("/session/:sessionId", requireStripeConfigured, getCheckoutSession);

module.exports = router;

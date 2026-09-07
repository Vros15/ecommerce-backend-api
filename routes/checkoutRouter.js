const express = require("express");
const router = express.Router();
const { createCheckoutSession } = require("../controllers/checkoutController");
const { validateCheckoutBody } = require("../middlewares/validateCheckoutRequest");
const requireStripeConfigured = require("../middlewares/requireStripeConfigured");

// No requireAuth/requireAdmin here, unlike every other write route in this
// API - this doesn't write to our own database, it asks Stripe to open a
// payment page, and in a real store any shopper (signed in or not) can
// check out.

// POST create a Stripe Checkout Session for the given cart items
// endpoint: POST /api/checkout
router.post("/", requireStripeConfigured, validateCheckoutBody, createCheckoutSession);

module.exports = router;

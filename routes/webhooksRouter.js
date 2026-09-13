const express = require("express");
const router = express.Router();
const { handleStripeWebhook } = require("../controllers/webhooksController");

// No requireAuth/requireAdmin - Stripe itself is the caller. The request's
// own signature (verified inside the controller) is the security boundary.
// endpoint: POST /api/webhooks/stripe
router.post("/", handleStripeWebhook);

module.exports = router;

const AppError = require("../utils/AppError");

// Checked before the Stripe SDK ever runs a real request, so a missing key
// produces a clear 500 instead of an opaque failure the first time
// stripe.checkout.sessions.create() actually needs it. Same reasoning as
// requireClerkConfigured.
const requireStripeConfigured = (req, res, next) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return next(new AppError("Payments are not configured.", 500, "STRIPE_NOT_CONFIGURED"));
  }

  next();
};

module.exports = requireStripeConfigured;

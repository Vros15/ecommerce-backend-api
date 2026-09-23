const Stripe = require("stripe");

// The Stripe API version this code was written and verified against. Without
// it, the account's default version applies: changing that in the Stripe
// dashboard, or upgrading the SDK, would silently change the shape of every
// object read here (a renamed field on a Checkout Session, a moved property
// on a refund) with no code change to point at.
const STRIPE_API_VERSION = "2026-08-26.dahlia";

/**
 * Builds a Stripe client for one request.
 *
 * Deliberately not a module-scope singleton: the SDK constructor throws
 * synchronously when the key is missing, which would crash the whole app on
 * `require()` alone, before `requireStripeConfigured` could answer with a
 * clean 500. Constructing per call keeps a missing key a handled error.
 */
const createStripeClient = () =>
  new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: STRIPE_API_VERSION });

module.exports = { createStripeClient, STRIPE_API_VERSION };

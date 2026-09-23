const Stripe = require("stripe");

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

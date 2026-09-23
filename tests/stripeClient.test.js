// Unit tests for the shared Stripe client. No network, no database: the SDK
// only talks to Stripe when a request method is called, and none are here.
const { test, describe, after } = require("node:test");
const assert = require("node:assert/strict");
const Stripe = require("stripe");

const { createStripeClient, STRIPE_API_VERSION } = require("../utils/createStripeClient");

describe("createStripeClient", () => {
  const originalKey = process.env.STRIPE_SECRET_KEY;

  after(() => {
    process.env.STRIPE_SECRET_KEY = originalKey;
  });

  test("pins the API version rather than following the account default", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_placeholder";

    const client = createStripeClient();

    assert.equal(client.getApiField("version"), STRIPE_API_VERSION);
  });

  test("builds a fresh client per call rather than sharing one", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_placeholder";

    // A module-scope singleton would be constructed at require() time, which
    // is exactly the crash-on-missing-key bug this shape exists to avoid.
    assert.notEqual(createStripeClient(), createStripeClient());
  });

  test("throws on a missing key instead of returning a broken client", () => {
    delete process.env.STRIPE_SECRET_KEY;

    // requireStripeConfigured answers 500 before any route reaches this, so
    // the throw is a backstop, not the user-facing path.
    assert.throws(() => createStripeClient());
  });

  test("the pinned version matches the installed SDK's own default", () => {
    // Fails after an SDK upgrade that moves to a newer API version. That is a
    // prompt to read Stripe's changelog and bump the pin deliberately, not a
    // reason to delete this test.
    assert.equal(
      STRIPE_API_VERSION,
      Stripe.API_VERSION,
      `Pinned ${STRIPE_API_VERSION}, SDK defaults to ${Stripe.API_VERSION}.`
    );
  });
});

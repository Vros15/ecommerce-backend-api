// Unit tests for the central error handler - no app, no database. A fake
// response object records what the handler sends.
const { test, describe, beforeEach, mock } = require("node:test");
const assert = require("node:assert/strict");

const errorHandler = require("../middlewares/errorHandler");
const AppError = require("../utils/AppError");

const runHandler = (err, { headersSent = false } = {}) => {
  const res = {
    headersSent,
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  let passedOn = null;

  errorHandler(err, {}, res, (error) => {
    passedOn = error;
  });

  return { res, passedOn };
};

describe("errorHandler", () => {
  beforeEach(() => {
    // Unexpected errors are logged; keep test output clean.
    mock.method(console, "error", () => {});
  });

  test("passes an AppError's status, code, message, and details through", () => {
    const { res } = runHandler(new AppError("Order not found.", 404, "ORDER_NOT_FOUND", { id: "x" }));

    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.body, {
      success: false,
      code: "ORDER_NOT_FOUND",
      message: "Order not found.",
      details: { id: "x" },
    });
  });

  test("hides an unexpected error behind a generic 500", () => {
    const err = new Error("E11000 duplicate key error collection: shop.orders index: stripeSessionId_1");
    err.code = 11000;

    const { res } = runHandler(err);

    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, {
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
      details: null,
    });
    assert.equal(console.error.mock.callCount(), 1);
  });

  test("hides a third-party error that carries its own statusCode", () => {
    // Stripe SDK errors set statusCode (e.g. 400) but aren't ours to expose.
    const err = new Error("No such price: 'price_123'; a similar object exists in live mode");
    err.statusCode = 400;
    err.type = "StripeInvalidRequestError";

    const { res } = runHandler(err);

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.message, "Something went wrong");
  });

  test("describes a malformed request body as a client error", () => {
    // Shape of the error express.json() raises on invalid JSON.
    const err = new SyntaxError("Unexpected token } in JSON at position 10");
    err.status = 400;
    err.statusCode = 400;
    err.expose = true;

    const { res } = runHandler(err);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.code, "INVALID_REQUEST");
    assert.equal(res.body.message, "Unexpected token } in JSON at position 10");
  });

  test("hands off to Express once headers have already been sent", () => {
    const err = new Error("late failure");
    const { res, passedOn } = runHandler(err, { headersSent: true });

    assert.equal(passedOn, err);
    assert.equal(res.body, null);
  });
});

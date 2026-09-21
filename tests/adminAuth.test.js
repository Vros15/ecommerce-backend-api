// Tests for the single-admin write protection. The requireAdmin cases are unit
// tests against a faked Clerk request; the route cases boot the app and run
// unauthenticated requests, so they need MONGODB_URI like the other suite. No
// real Clerk credentials are needed: rejecting a caller never verifies a token.
const { test, before, after, describe } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const mongoose = require("mongoose");

// clerkMiddleware refuses to start without keys, and the routers build their
// middleware when required, so these must be set before the app is loaded.
process.env.CLERK_SECRET_KEY ||= "sk_test_0000000000000000000000000000000000000000";
process.env.CLERK_PUBLISHABLE_KEY ||= "pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk";

const requireAdmin = require("../middlewares/requireAdmin");
const app = require("../app");

const ADMIN_ID = "user_admin";
const ID = "000000000000000000000000";

// getAuth only reads a request Clerk has decorated, which it marks with this
// symbol. Faking it keeps the unit tests offline and credential-free.
const CLERK_AUTH_BRAND = Symbol.for("@clerk/express.auth");

const requestSignedInAs = (userId) => ({
  auth: Object.assign(() => ({ userId, tokenType: "session_token" }), { [CLERK_AUTH_BRAND]: true }),
});

// Captures whatever requireAdmin passes to next(), or null when it passed nothing.
const runRequireAdmin = (req) => {
  let captured = null;
  requireAdmin(req, {}, (error) => {
    captured = error ?? null;
  });
  return captured;
};

describe("requireAdmin", () => {
  const originalAdminId = process.env.ADMIN_USER_ID;

  after(() => {
    process.env.ADMIN_USER_ID = originalAdminId;
  });

  test("admits the account named by ADMIN_USER_ID", () => {
    process.env.ADMIN_USER_ID = ADMIN_ID;

    assert.equal(runRequireAdmin(requestSignedInAs(ADMIN_ID)), null);
  });

  test("rejects any other signed-in account with 403", () => {
    process.env.ADMIN_USER_ID = ADMIN_ID;

    const error = runRequireAdmin(requestSignedInAs("user_someone_else"));

    assert.equal(error.statusCode, 403);
    assert.equal(error.code, "FORBIDDEN");
  });

  test("closes the route when ADMIN_USER_ID is unset rather than opening it", () => {
    delete process.env.ADMIN_USER_ID;

    const error = runRequireAdmin(requestSignedInAs(ADMIN_ID));

    assert.equal(error.statusCode, 500);
    assert.equal(error.code, "ADMIN_NOT_CONFIGURED");
  });
});

describe("write routes", () => {
  let server;
  let baseUrl;

  before(async () => {
    assert.ok(process.env.MONGODB_URI, "MONGODB_URI must be set to run these tests");

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });

  const request = async (method, path, body) => {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { "content-type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    return { status: response.status, body: await response.json().catch(() => ({})) };
  };

  const writeRoutes = [
    ["POST", "/api/products", { name: "x", description: "x", price: 1, category: "x", stock: 1 }],
    ["PUT", `/api/products/${ID}`, { name: "x" }],
    ["DELETE", `/api/products/${ID}`, null],
    ["POST", "/api/customers", { name: "x", email: "x@example.com" }],
    ["PUT", `/api/customers/${ID}`, { name: "x" }],
    ["DELETE", `/api/customers/${ID}`, null],
    ["POST", "/api/carts", { customer: ID }],
    ["POST", `/api/carts/${ID}/products`, { product: ID, quantity: 1 }],
    ["PUT", `/api/carts/${ID}/products`, { product: ID, quantity: 2 }],
    ["DELETE", `/api/carts/${ID}/products`, { product: ID }],
    ["DELETE", `/api/carts/${ID}/clear`, null],
    ["POST", `/api/orders/${ID}`, {}],
    ["PUT", `/api/orders/${ID}`, { status: "shipped" }],
    ["DELETE", `/api/orders/${ID}`, null],
  ];

  test("reject every unauthenticated write with 401", async () => {
    for (const [method, path, body] of writeRoutes) {
      const { status, body: payload } = await request(method, path, body);

      assert.equal(status, 401, `expected 401 for ${method} ${path}`);
      assert.equal(payload.code, "UNAUTHENTICATED", `expected UNAUTHENTICATED for ${method} ${path}`);
    }
  });

  test("reject a write before validating its body or id", async () => {
    // A stranger should learn nothing about the shape of a valid request, so
    // authentication has to run ahead of the validation middleware.
    const { status, body } = await request("PUT", "/api/products/not-an-object-id", {});

    assert.equal(status, 401);
    assert.equal(body.code, "UNAUTHENTICATED");
  });

  test("leave product reads public", async () => {
    const { status } = await request("GET", "/api/products?limit=1", null);

    assert.equal(status, 200);
  });

  test("reject every unauthenticated read of customer, cart, and order data with 401", async () => {
    const protectedReads = [
      "/api/customers",
      `/api/customers/${ID}`,
      `/api/carts/${ID}`,
      "/api/orders",
      `/api/orders/${ID}`,
      "/api/orders/me",
    ];

    for (const path of protectedReads) {
      const { status, body } = await request("GET", path, null);

      assert.equal(status, 401, `expected 401 for GET ${path}`);
      assert.equal(body.code, "UNAUTHENTICATED", `expected UNAUTHENTICATED for GET ${path}`);
    }
  });

  test("reject a protected read before validating its id", async () => {
    const { status, body } = await request("GET", "/api/orders/not-an-object-id", null);

    assert.equal(status, 401);
    assert.equal(body.code, "UNAUTHENTICATED");
  });
});

// Smoke tests for GET /api/products. These run against the database named by
// MONGODB_URI and assume the seeded catalogue, so they are integration tests
// rather than unit tests. They read only and create nothing.
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const mongoose = require("mongoose");

const app = require("../app");

let server;
let baseUrl;

before(async () => {
  assert.ok(process.env.MONGODB_URI, "MONGODB_URI must be set to run these tests");

  server = http.createServer(app);

  // Port 0 lets the OS assign a free port, so a running dev server does not
  // collide with the test run.
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.connection.close();
});

const get = async (query = "") => {
  const response = await fetch(`${baseUrl}/api/products${query}`);
  return { status: response.status, body: await response.json() };
};

test("returns the full catalogue with no parameters", async () => {
  const { status, body } = await get();

  assert.equal(status, 200);
  assert.ok(Array.isArray(body.products));
  assert.ok(body.products.length > 0);
  assert.equal(body.meta.total, body.products.length);
});

test("filters by category, case-insensitively", async () => {
  const exact = await get("?category=Electronics");
  const lowercase = await get("?category=electronics");

  assert.equal(exact.status, 200);
  assert.ok(exact.body.products.length > 0);
  assert.ok(exact.body.products.every((product) => product.category === "Electronics"));
  assert.equal(lowercase.body.products.length, exact.body.products.length);
});

test("returns an empty array for an unknown category", async () => {
  const { status, body } = await get("?category=NoSuchCategory");

  assert.equal(status, 200);
  assert.deepEqual(body.products, []);
});

test("filters by price range inclusively", async () => {
  const { body } = await get("?minPrice=50&maxPrice=100");

  assert.ok(body.products.every((product) => product.price >= 50 && product.price <= 100));
});

test("filters by stock status", async () => {
  const inStock = await get("?inStock=true");
  const outOfStock = await get("?inStock=false");

  assert.ok(inStock.body.products.every((product) => product.stock > 0));
  assert.ok(outOfStock.body.products.every((product) => product.stock === 0));
});

test("searches name and description, case-insensitively", async () => {
  const lower = await get("?search=wireless");
  const upper = await get("?search=WIRELESS");

  assert.equal(lower.status, 200);
  assert.equal(upper.body.products.length, lower.body.products.length);
});

test("sorts by price in both directions", async () => {
  const ascending = await get("?sortBy=price&sortOrder=asc");
  const descending = await get("?sortBy=price&sortOrder=desc");

  const ascendingPrices = ascending.body.products.map((product) => product.price);
  const descendingPrices = descending.body.products.map((product) => product.price);

  assert.deepEqual(ascendingPrices, [...ascendingPrices].sort((a, b) => a - b));
  assert.deepEqual(descendingPrices, [...descendingPrices].sort((a, b) => b - a));
});

test("sorts names using a case-insensitive collation", async () => {
  const { body } = await get("?sortBy=name");
  const names = body.products.map((product) => product.name);

  // Byte-order sorting would place every capitalised word ahead of every
  // lowercase one, putting "LED Desk Lamp" before "Laptop Backpack".
  assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b)));
});

test("treats regular expression syntax in search as a literal", async () => {
  const all = await get();
  const wildcard = await get("?search=.*");

  assert.ok(
    wildcard.body.products.length < all.body.products.length,
    "'.*' matched every product, so the value reached the regular expression unescaped"
  );
});

test("paginates and reports accurate metadata", async () => {
  const all = await get();
  const total = all.body.meta.total;

  const firstPage = await get("?limit=5&sortBy=price&sortOrder=asc");
  const secondPage = await get("?limit=5&page=2&sortBy=price&sortOrder=asc");

  assert.equal(firstPage.body.products.length, 5);
  assert.equal(firstPage.body.meta.totalPages, Math.ceil(total / 5));
  assert.equal(firstPage.body.meta.hasNextPage, true);
  assert.equal(firstPage.body.meta.hasPreviousPage, false);
  assert.equal(secondPage.body.meta.hasPreviousPage, true);

  const firstIds = firstPage.body.products.map((product) => product._id);
  const secondIds = secondPage.body.products.map((product) => product._id);
  assert.ok(secondIds.every((id) => !firstIds.includes(id)), "pages overlapped");

  assert.ok(
    firstPage.body.products.at(-1).price <= secondPage.body.products[0].price,
    "sort order did not continue across the page boundary"
  );
});

test("returns an empty page rather than an error past the end", async () => {
  const { status, body } = await get("?limit=5&page=999");

  assert.equal(status, 200);
  assert.deepEqual(body.products, []);
});

test("counts documents matching the filter, not the collection", async () => {
  const all = await get();
  const filtered = await get("?category=Electronics&limit=2");

  assert.ok(filtered.body.meta.total < all.body.meta.total);
  assert.equal(filtered.body.products.length, 2);
});

test("rejects invalid query values", async () => {
  const invalidQueries = [
    "?sortBy=bogus",
    "?sortOrder=sideways",
    "?minPrice=abc",
    "?minPrice=-5",
    "?minPrice=",
    "?minPrice=100&maxPrice=10",
    "?inStock=yes",
    "?category=",
    "?category=a&category=b",
    "?page=0",
    "?page=1.5",
    "?limit=0",
    "?limit=101",
  ];

  for (const query of invalidQueries) {
    const { status, body } = await get(query);

    assert.equal(status, 400, `expected 400 for ${query}`);
    assert.equal(body.code, "INVALID_PRODUCT_QUERY", `expected INVALID_PRODUCT_QUERY for ${query}`);
  }
});

test("rejects unknown parameters instead of ignoring them", async () => {
  // The parameters were once named sort and order. Accepting them silently
  // would return an unsorted 200 to anyone following older documentation.
  for (const query of ["?sort=price", "?order=asc", "?offset=5"]) {
    const { status, body } = await get(query);

    assert.equal(status, 400, `expected 400 for ${query}`);
    assert.equal(body.code, "INVALID_PRODUCT_QUERY");
  }
});

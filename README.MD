# MegaMart Commerce API

The backend for MegaMart: products, Stripe checkout, and orders, with Clerk
authentication and a single admin account for catalogue management. Built
with Node.js, Express, and MongoDB, and deployed on Vercel.

![Node.js](https://img.shields.io/badge/Node.js-22+-green)
![Express.js](https://img.shields.io/badge/Express.js-5-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

Live API: <https://ecommerce-backend-api-dusky.vercel.app/api/products>

---

## Where this fits

MegaMart is three repositories, each deployed separately:

| Repo | Stack | Responsible for |
| --- | --- | --- |
| [`megamart-react-storefront`](https://github.com/Vros15/megamart-react-storefront) | React, Vite | Everything the shopper and admin see |
| **`ecommerce-backend-api`** (this repo) | Node, Express, MongoDB | Source of truth: products, orders, payments (Stripe), and soon tickets and refunds |
| [`megamart-ai-service`](https://github.com/Vros15/megamart-ai-service) | Python, FastAPI | AI support chat: policy retrieval and grounded replies |

This API is the only place that decides prices, order ownership, and who may
write. The storefront and the AI service are clients of it.

---

## What it does

- **Catalogue:** public product reads with filtering, search, sorting, and
  pagination. Create, update, and delete are limited to one admin account.
- **Checkout:** creates Stripe Checkout Sessions (test mode). Every price is
  re-read from the database, so the client can't change what gets charged.
- **Orders:** created only by a signature-verified Stripe webhook. A
  signed-in shopper can read their own orders, and nobody else's.
- **Hardening:** centralized error handling, request validation, Helmet,
  CORS, payload size limits, rate limiting, structured JSON logs with secret
  redaction, and health/readiness checks.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Runtime | Node.js 22+, Express 5 |
| Database | MongoDB Atlas with Mongoose |
| Auth | Clerk (`@clerk/express`), session tokens sent as bearer tokens |
| Payments | Stripe Checkout (test mode) and webhooks |
| Tests | Node's built-in test runner (`node --test`) against a separate test database |
| Hosting | Vercel serverless function (a long-running server is also supported) |

---

## API reference

Base URL: `/api`. Errors share one shape (see [Errors](#errors)).

### Access levels

| Level | Requirement | On failure |
| --- | --- | --- |
| Public | None | |
| Signed in | Valid Clerk session token | `401 UNAUTHENTICATED` |
| Admin | Signed in as `ADMIN_USER_ID` | `401`, or `403 FORBIDDEN` for any other account |
| Stripe | Valid Stripe webhook signature | `400` |

Only the catalogue and checkout are public. Customer, cart, and order data is
admin-only, except each shopper's own orders at `GET /api/orders/me`.

### Products

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/products` | Public | List products, with the query parameters below |
| GET | `/products/:id` | Public | One product |
| POST | `/products` | Admin | Create a product |
| PUT | `/products/:id` | Admin | Update a product |
| DELETE | `/products/:id` | Admin | Delete a product |

`GET /products` query parameters. Unknown parameters return `400` instead of
being ignored, so a typo shows up right away.

| Parameter | Description |
| --- | --- |
| `category` | Exact match, case-insensitive |
| `search` | Matches `name` or `description`, case-insensitive |
| `minPrice`, `maxPrice` | Inclusive price bounds |
| `inStock` | `true` for `stock > 0`, `false` for `stock === 0` |
| `sortBy`, `sortOrder` | `price` or `name`; `asc` (default) or `desc` |
| `page`, `limit` | Default `1` and `20`; `limit` maximum `100` |

Categories: Electronics, Audio, Home & Kitchen, Home Office, Apparel &
Accessories, Fitness & Wellness.

Responses include a `meta` block (`total`, `page`, `limit`, `totalPages`,
`hasNextPage`, `hasPreviousPage`). `total` counts the filtered result set,
not the whole collection.

### Checkout and webhooks

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/checkout` | Public, sign-in optional | Create a Stripe Checkout Session from `{ items: [{ productId, quantity }] }` and return its `url` |
| GET | `/checkout/session/:sessionId` | Public | A completed session's line items and total, for the confirmation page |
| POST | `/webhooks/stripe` | Stripe | On `checkout.session.completed`, creates the `Order` |

If the shopper is signed in at checkout, their Clerk user id is carried
through the session, so the webhook can attach the order to them.

### Orders

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/orders/me` | Signed in | The caller's own orders |
| GET | `/orders` | Admin | All orders, filterable by `status` |
| GET | `/orders/:orderId` | Admin | One order |
| PUT | `/orders/:orderId` | Admin | Update an order's status |
| DELETE | `/orders/:orderId` | Admin | Delete an order |
| POST | `/orders/:customer` | Admin | Create an order from a customer's cart (legacy flow, below) |

### Customers and carts (admin only)

`/customers` (full CRUD) and `/carts/:customer` (read, add, update quantity,
remove, clear) come from this API's original server-side cart design. Each
customer has one cart, and an order placed from it copies the items, totals
them, and clears the cart.

The storefront doesn't use them. Its cart lives in the browser and checks out
through Stripe. They are kept, locked to the admin, as a working example of
Mongoose relationships and update operators.

### Operational

Outside `/api`, so exempt from rate limiting:

| Endpoint | Returns |
| --- | --- |
| `GET /health` | `200` while the process is running; doesn't touch the database |
| `GET /ready` | `200` when MongoDB is reachable, `503` otherwise |

### Errors

```json
{
  "success": false,
  "code": "INVALID_PRODUCT_QUERY",
  "message": "A message naming what was wrong",
  "details": null
}
```

Only errors the API raises deliberately (`AppError`) or client errors such as
malformed JSON return their real message. Anything unexpected (a database or
Stripe failure, a bug) returns a generic `500 INTERNAL_SERVER_ERROR`, and the
details are logged server-side instead.

| Code | Meaning |
| --- | --- |
| `400` | Invalid request |
| `401` | Not signed in |
| `403` | Signed in, but not allowed |
| `404` | Not found |
| `429` | Rate limit exceeded |
| `500` | Unexpected server error, or a required service isn't configured |

---

## Key design decisions

**One admin account, not a roles system.** The problem was "a stranger can
delete the catalogue," not general permissions. `requireAuth()` answers "who
is this?" (`401`), and `requireAdmin` answers "is it the one account allowed
to write?" (`403`). Both run before body validation, so an anonymous caller
learns nothing about what a valid request looks like. Missing Clerk
configuration closes these routes (`500`) rather than opening them. Roles
(`admin`, `support_agent`) arrive with the support desk.

**The client never sets a price.** Checkout accepts only product ids and
quantities. Each product is re-read from MongoDB for its real price and
checked against stock before the Stripe session is created.

**Orders come from Stripe, not the browser.** The success redirect proves
nothing, so an order is only created when Stripe's signed webhook confirms
the payment.

**Owner scoping on the server.** `GET /orders/me` filters by the Clerk user
id from the verified token, never by an id the client sends.

**Custom `requireAuth()`.** Clerk's own version is deprecated and redirects
to a sign-in page, which is meaningless to an API client.
`middlewares/requireAuth.js` returns a JSON `401` instead.

**Serverless on Vercel.** The API first ran on Render, where free-tier cold
starts took 30–60 seconds, and a portfolio API is idle almost all the time.
Vercel's cold starts are about 1–2 seconds. The trade-offs:

- The MongoDB connection is cached on `globalThis`, including the in-flight
  promise, so concurrent requests to a cold instance share one connection
  attempt instead of exhausting Atlas's connection limit.
- `express-rate-limit` counts in memory per instance, so on serverless the
  limit is advisory. Enforcing it properly needs a shared store such as
  Redis.
- `app.js` holds the whole app. `index.js` (long-running server) and
  `api/index.js` (Vercel) are thin entry points, so either target runs the
  same code.

---

## Project structure

```text
api/index.js        Vercel entry point (exports the app, no listener)
index.js            Long-running server entry point, with graceful shutdown
app.js              Express app: middleware and route mounting
routes/             One router per resource
controllers/        Request handlers
middlewares/        Auth, validation, error handling, 404
models/             Mongoose schemas: Product, Order, Customer, Cart
utils/              AppError, logger, Stripe client factory, pagination
database/           MongoDB connection
seed/               Sample data script
tests/              node:test suites, fixtures, and helpers
SPRINT.md           Task-by-task plan and status
```

---

## Getting started

```bash
git clone https://github.com/Vros15/ecommerce-backend-api.git
cd ecommerce-backend-api
npm install
cp .env.example .env    # then fill in the values
npm run dev
```

The API runs at `http://localhost:3000`.

### Environment variables

Every variable is documented in [`.env.example`](./.env.example).

| Variable | Required for |
| --- | --- |
| `MONGODB_URI` | Everything; the app refuses to start without it |
| `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY` | Signed-in and admin routes |
| `ADMIN_USER_ID` | Admin routes (the Clerk user id of the one admin) |
| `STRIPE_SECRET_KEY` | Checkout (test mode key, `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | The Stripe webhook (`whsec_...`) |
| `FRONTEND_URL` | Where Stripe redirects after checkout |
| `MONGODB_URI_TEST` | `npm test` only; must be a separate database |
| `CORS_ORIGIN`, `RATE_LIMIT_MAX`, `LOG_LEVEL`, `PORT` | Optional |

A missing Clerk or Stripe variable disables only the routes that need it,
with a `500` naming what isn't configured. Reads keep working.

The storefront's Clerk publishable key must come from the same Clerk instance
as `CLERK_SECRET_KEY` here, or its tokens are rejected.

### Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Start with file watching |
| `npm start` | Start without watching |
| `npm test` | Run the test suite against `MONGODB_URI_TEST` |
| `npm run seed` | Replace sample products, customers, and carts. Development only; the data is fictional |

---

## Testing

`npm test` runs Node's built-in test runner. The suites cover the `401` and
`403` auth boundaries (with a faked Clerk request, so no real credentials are
needed), product query parsing, error exposure rules, logger redaction, and
the Stripe client factory.

Tests that touch the database wipe and re-seed it, so they refuse to run
unless `MONGODB_URI_TEST` is set, differs from `MONGODB_URI`, and names a
database containing `test`.

---

## Deployment

Deployed on Vercel as a single serverless function. `vercel.json` rewrites
every path to `api/index.js`, so the Express router stays the only place
routes are defined.

- **Project settings:** framework preset `Other`, with no build command or
  output directory
- **Environment:** set the variables above for every Vercel environment
  (Production, Preview, Development). A preview missing them serves reads and
  fails writes.
- **Region:** `regions` in `vercel.json` should match the Atlas cluster's
  region, or every query pays an extra round trip
- **CORS:** Vercel gives every preview deploy its own URL, so a fixed
  `CORS_ORIGIN` list blocks preview builds of the storefront

Smoke checks after a deploy:

| Request | Expected |
| --- | --- |
| `GET /health` | `200` |
| `GET /ready` | `200` |
| `GET /api/products` | `200` (confirms the rewrite reaches Express) |
| `POST /api/products`, no token | `401`. A `500` means the Clerk variables are missing; a `201` means writes are open |

---

## Roadmap

Full plan and status: [`SPRINT.md`](./SPRINT.md).

**Next: AI-assisted refund support.** A support chat, starting with refunds.
The AI work lives in [`megamart-ai-service`](https://github.com/Vros15/megamart-ai-service).
This API stays the source of truth:

- The AI service reads a shopper's own orders and opens refund tickets by
  forwarding that shopper's Clerk token, so it never holds admin rights here.
- A support agent approves each refund, and this API carries it out only
  after re-checking the order, the payment, and the refund policy itself.
- Every ticket change and refund attempt is written to an audit trail.

Also open: customer-owned cart writes, stock decrement after checkout, and
an OpenAPI spec.

# Sprint Plan

Task-by-task plan and status for the MegaMart backend API. The storefront
that consumes it keeps its own plan in
[`megamart-react-storefront/SPRINT.md`](https://github.com/Vros15/megamart-react-storefront/blob/main/SPRINT.md).

What the API does today, and how to run it, is in the [README](./README.MD).

---

Sprints 1 to 9 cover production hardening and the core commerce features.
Sprints 10 to 13 are this API's share of the AI-assisted refund support work.

## Sprint 1 - Platform and Cart Hardening

- [x] Add centralized error pipeline (`AppError`, `asyncHandler`, `notFound`, `errorHandler`)
- [x] Add fail-fast startup and graceful shutdown
- [x] Add cart request validation middleware and route wiring
- [x] Add baseline security middleware (Helmet, CORS, rate limiting, JSON body limit)

## Sprint 2 - Customer Hardening

- [x] Add customer request validation middleware and route wiring
- [x] Migrate customer controller to centralized error handling

## Sprint 3 - Product Hardening

- [x] Add product request validation middleware and route wiring
- [x] Migrate products controller to centralized error handling

## Sprint 4 - Orders Hardening

- [x] Add order request validation middleware and route wiring
- [x] Migrate orders controller to centralized error handling

## Sprint 5 - Observability and Quality

- [x] Add `/health` endpoint
- [x] Add `/ready` endpoint with database readiness check
- [ ] Add smoke/integration tests for core API flows
- [ ] Update API documentation for standardized error responses

## Sprint 6 - Deployment and Product Query Support

- [x] Split the Express app from the server entry point
- [x] Cache the Mongoose connection for serverless reuse
- [x] Add filtering, search, sorting, and pagination to `GET /api/products`
- [x] Consolidate seed categories into a usable set
- [x] Deploy to Vercel and verify the catch-all rewrite

## Sprint 7 - Write Protection

- [x] Add `requireAuth` and `requireAdmin` middleware
- [x] Restrict every product, customer, cart, and order write to the admin account
- [x] Cover the `401` and `403` boundaries with tests
- [x] Set the Clerk variables on Vercel and verify against the live deployment

## Sprint 8 - Stripe Checkout

- [x] Add `POST /api/checkout` - creates a Stripe Checkout Session (test
      mode) for a given set of cart items
- [x] Re-derive every price from the database and check requested quantity
      against real stock - a client-submitted price or quantity is never
      trusted
- [x] No admin lock on this route, unlike every other write in this API - it
      doesn't write to this API's own database, and any shopper should be
      able to check out
- [x] Fix: construct the Stripe client per request, not at module scope -
      the SDK throws synchronously in its constructor with no key present,
      which crashed the app on `require()` alone before this
- [x] Fix: disable Managed Payments for the session - on by default on newer
      Stripe accounts, requires a tax code per line item, and this test-mode
      demo has no real tax compliance to manage

## Sprint 9 - Order Identity and Webhooks

The frontend's cart is client-side only and Clerk-authenticated shoppers
have no `Customer` record, so there was previously no way to attach a
completed payment to a real `Order`, or to answer "what has this shopper
bought."

- [x] Add an optional `clerkUserId` field to the `Order` model, alongside
      the existing `customer` reference (left as-is for whatever the
      original admin-only order flow still needs it for). Also added
      `stripeSessionId` (unique, sparse), which doubles as the webhook's
      idempotency key
- [x] Add an "optional auth" middleware to `/api/checkout` - reads the
      shopper's Clerk id when signed in, without rejecting guest checkouts;
      passes it through as Stripe session metadata
- [x] Add `STRIPE_WEBHOOK_SECRET` and a new `POST /api/webhooks/stripe`
      endpoint - verifies Stripe's signature (needs the raw request body,
      not JSON-parsed), listens for `checkout.session.completed`, and
      creates the real `Order` from the session. This is the actual proof a
      payment happened, not the frontend's `?checkout=success` redirect,
      which anyone could reach by typing the URL without ever paying
- [x] Add `GET /api/orders/me` - requires real sign-in, filters strictly by
      the verified token's user id, never a client-supplied one (otherwise
      one shopper could read another's orders by editing a query param).
      Registered ahead of the existing `/:orderId` route so Express doesn't
      match `me` as an order id
- [x] Verified the full loop against a real webhook delivery on the live
      Vercel endpoint: signed in, paid with a real test card, confirmed the
      webhook fired and created an `Order` with the correct `clerkUserId`,
      confirmed it appeared under `GET /api/orders/me` for that account

## Up Next - AI-Assisted Refund Support (Sprints 10 to 13)

MegaMart is adding an AI support chat, starting with refunds. The AI work
lives in a separate Python service (`megamart-ai-service`): FastAPI,
retrieval-augmented generation over MegaMart's written policies, and
PostgreSQL with pgvector for the embeddings.

**This API stays the source of truth for orders, tickets, and money.** The AI
service can read a shopper's own orders and open a refund ticket, always by
forwarding that shopper's own Clerk token, so it never holds admin rights
here. It cannot issue refunds. A support agent approves, and this API
executes the refund after re-checking the order, the payment, and the refund
policy itself.

```text
React chat --Clerk token--> AI service --same Clerk token--> this API
                                                               |
                                                    requireAuth + owner scoping

Agent approves --> this API: revalidate -> idempotent Stripe refund -> audit
```

Sprints below are this API's share. The AI service tracks its own sprints in
its repo; the storefront tracks the chat and desk UI in
[`megamart-react-storefront/SPRINT.md`](https://github.com/Vros15/megamart-react-storefront/blob/main/SPRINT.md).

## Sprint 10 - Security Prerequisites

- [x] Restrict order, customer, and cart read endpoints to admin access
      (the storefront only uses `GET /api/orders/me`)
- [x] Generic error message for unexpected `500`s, real message only for
      known `AppError`s
- [x] Separate test database, and fix the failing product-count test
- [x] Shared Stripe client with a pinned API version
- [x] Small structured JSON logger for all new code

## Sprint 11 - Order Facts for the AI Service

- [ ] Add payment details to `Order`: Stripe payment intent id, amount in
      cents, payment status, amount refunded, and a line-item snapshot
- [ ] Webhook saves those, only for sessions Stripe reports as paid, and
      reads line items from Stripe instead of session metadata
- [ ] One-time backfill script for existing orders
- [ ] `GET /api/orders/me/:orderId`, one of the caller's own orders, with a
      response shaped for support use (no internal ids beyond the order
      number)
- [ ] Tests: another shopper's order id returns the same `404` as a
      nonexistent one

## Sprint 12 - Tickets, Approval, and Refunds

- [ ] `Ticket`, `Refund`, and `AuditEvent` models, plus a ticket state
      machine
- [ ] `POST /api/support/tickets`: a signed-in shopper (or the AI service
      acting with that shopper's token) opens a refund request
- [ ] Shopper ticket routes: list, detail, reply
- [ ] `requireRole()` using a Clerk role claim (`admin`, `support_agent`);
      `requireAdmin` becomes `requireRole("admin")`
- [ ] Agent routes: ticket queue, ticket detail, deny, request info
- [ ] Refund service: reloads the ticket, order, and payment, re-checks the
      policy, calculates the amount itself, then refunds through Stripe with
      an idempotency key so it can only happen once
- [ ] Refund webhooks (`charge.refunded`, `refund.updated`) reconcile state
- [ ] Every ticket transition and refund attempt written to the audit trail

## Sprint 13 - Authorization Hardening

- [ ] Cross-user tests: reading another shopper's ticket or order, opening a
      ticket against an order that isn't theirs
- [ ] Refund abuse tests: double approval, concurrent approval, an order
      already refunded elsewhere, a Stripe failure followed by a retry
- [ ] Confirm the AI service cannot reach any admin route with a shopper
      token

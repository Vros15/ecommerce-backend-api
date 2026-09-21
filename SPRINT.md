# Sprint Plan

Task-by-task plan and status for the MegaMart backend API. The storefront
that consumes it keeps its own plan in
[`megamart-react-storefront/SPRINT.md`](https://github.com/Vros15/megamart-react-storefront/blob/main/SPRINT.md).

What the API does today, and how to run it, is in the [README](./README.MD).

---

Sprints 1 to 9 cover production hardening and the core commerce features.
Sprints 10 to 17 add AI-assisted refund support.

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

## Up Next - AI-Assisted Refund Support (Sprints 10 to 17)

A support chat for the storefront, starting with refunds. A signed-in shopper
describes a problem ("my headphones arrived broken"), and the API looks up
MegaMart's written policies (RAG), finds the right order from the shopper's
own account, checks it against a refund policy written in code, and opens a
ticket for a person to approve.

| Piece | Job |
|---|---|
| RAG (policy documents + vector search) | "What does MegaMart policy say?" |
| LLM (Claude) | Understands the message, asks follow-up questions, writes answers grounded in the retrieved policy |
| API code | "What is actually true?" Identity, order ownership, payment status, refund amount |
| Policy engine | Hard rules: ownership, paid, refund window, refundable amount |
| Decision provider | Continue, ask for more info, send to a person, or not eligible. Swappable, built so a dedicated decision model (JEV) can be evaluated later |
| Support agent | Approves or denies. **The AI never moves money** |

No AI framework (LangChain and similar): chunking, embeddings, retrieval,
prompt assembly, and evaluation are small, readable modules in this repo.

These sprints match Sprints 5 to 12 in the storefront's
[`SPRINT.md`](https://github.com/Vros15/megamart-react-storefront/blob/main/SPRINT.md),
which also tracks the frontend tasks (chat page, ticket pages, support desk).
Only the API work is listed here.

## Sprint 10 - Security Prerequisites

- [x] Restrict order, customer, and cart read endpoints to admin access
      (the storefront only uses `GET /api/orders/me`)
- [ ] Generic error message for unexpected `500`s, real message only for
      known `AppError`s
- [ ] Separate test database, and fix the failing product-count test
- [ ] Shared Stripe client with a pinned API version
- [ ] Small structured JSON logger for all new code

## Sprint 11 - RAG Foundation

- [ ] Confirm MongoDB Atlas Vector Search is available on the cluster, and
      pick the embedding model (Voyage AI)
- [ ] Policy documents in `knowledge/` (refunds, damaged products,
      duplicate charges, returns, cancellations, shipping, FAQ), each with a
      version and effective date
- [ ] `config/refundPolicy.js` holds the hard numbers, plus a test that
      fails if the written policy and the config disagree
- [ ] `EmbeddingProvider` with a real and a fake (offline) implementation
- [ ] `KnowledgeDocument` and `KnowledgeChunk` models
- [ ] Chunker that splits on headings so each chunk is one policy section,
      with configurable size and overlap
- [ ] Ingestion script (`npm run ingest:knowledge`): load, clean, block
      anything that looks like a secret, skip unchanged docs, chunk, embed,
      store, mark old versions as superseded. A script only, never an HTTP
      route
- [ ] `Retriever` with Atlas Vector Search and an in-memory version for
      tests; every result carries its source and version
- [ ] Retrieval evaluation (`npm run eval:retrieval`) with 30 labelled
      questions, reporting how often the right policy comes back

## Sprint 12 - Grounded Support Chat

- [ ] `LLMProvider` (Claude, via `@anthropic-ai/sdk`) with a fake for tests,
      timeouts, and bounded retries
- [ ] `Conversation`, `Message`, and `AiDecision` models
- [ ] AI gateway middleware: sign-in required, per-user message limits
      stored in MongoDB (the in-memory rate limiter doesn't hold on
      serverless), message length cap, closed unless the AI key is set
- [ ] Intent detection with schema-validated output (refund or not,
      reason, order hint, what's missing)
- [ ] Prompt assembly with clearly labelled sections, policy text treated
      as data, not instructions
- [ ] Grounded reply that must cite the policy chunks it used, and a fixed
      "let me get a person" reply when no policy matches
- [ ] Support orchestrator (code-driven workflow, the AI gets no tools of
      its own) and `POST /api/support/chat`
- [ ] Raise the Vercel function timeout based on measured latency
- [ ] Chat evaluation (`npm run eval:support`) including prompt-injection
      attempts, with latency and token counts

## Sprint 13 - Trusted Refund Context

- [ ] Add payment details to `Order` (Stripe payment intent id, amount in
      cents, payment status, amount refunded, line-item snapshot)
- [ ] Webhook saves those, only for sessions Stripe reports as paid, and
      reads line items from Stripe instead of session metadata
- [ ] One-time backfill script for existing orders
- [ ] Match the shopper's description to one of **their own** orders, and
      ask when it's ambiguous
- [ ] Refund context from the order plus live Stripe data
- [ ] Refund policy engine as a pure, fully tested function
- [ ] Evaluation cases for someone else's order, an expired window, and an
      already-refunded order

## Sprint 14 - Decisions and Ticket Escalation

- [ ] `DecisionProvider` interface with a rules-based version; any provider
      can only send a case toward human review, never past a failed policy
      check
- [ ] `Ticket` and `AuditEvent` models, ticket state machine
- [ ] Automatic ticket creation with the full case attached: conversation
      summary, policy references, policy result, recommendation, reason for
      escalation
- [ ] Shopper ticket routes: list, detail, reply

## Sprint 15 - Support Desk API

- [ ] `requireRole()` using a Clerk role claim (`admin`, `support_agent`);
      `requireAdmin` becomes `requireRole("admin")`, with `ADMIN_USER_ID`
      kept as a fallback
- [ ] Ticket queue and detail routes under `/api/admin/support/tickets`
- [ ] Deny and request-info actions, each recorded in the audit trail

## Sprint 16 - Stripe Test Refunds

- [ ] `Refund` model, one per ticket
- [ ] Refund service: reloads the ticket, order, and payment, re-checks the
      policy, calculates the amount itself, then refunds through Stripe with
      an idempotency key so it can only happen once
- [ ] Approve route, plus `charge.refunded` / `refund.updated` webhook
      handling to confirm the final result
- [ ] Tests for double approval, concurrent approval, an order refunded
      elsewhere, and a Stripe failure followed by a retry

## Sprint 17 - Evaluation and Hardening

- [ ] Grow the evaluation set to 50+ cases (target 100+), one report
      covering intent accuracy, retrieval quality, made-up answer rate,
      escalation accuracy, security, latency, and cost
- [ ] Failure tests: AI timeout, bad AI output, embedding outage, missing
      search index, rate limits
- [ ] Tune model settings from the evaluation numbers
- [ ] Support metrics endpoint, including how often agents agree with the
      AI's recommendation
- [ ] `docs/ai/` write-ups for the shipped system (RAG, refund workflow,
      security, evaluation)


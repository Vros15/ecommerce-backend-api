# MegaMart E-Commerce Backend API

> A portfolio project demonstrating modern backend API development using **Node.js**, **Express.js**, **MongoDB Atlas**, and **Mongoose**.

![Node.js](https://img.shields.io/badge/Node.js-22.x-green)
![Express.js](https://img.shields.io/badge/Express.js-Backend-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Mongoose](https://img.shields.io/badge/Mongoose-ODM-red)
![License](https://img.shields.io/badge/License-MIT-blue)

A RESTful backend API for a simplified e-commerce platform built with **Node.js**, **Express**, and **MongoDB**.

This project demonstrates backend software engineering concepts including CRUD operations, MongoDB relationships using Mongoose, shopping cart management, order processing, filtering, sorting, validation, and clean RESTful API design.

---

# Skills Demonstrated

- RESTful API Development
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose ODM
- CRUD Operations
- Database Relationships
- MongoDB Query Operators
- Shopping Cart Management
- Order Processing
- Query Filtering
- Query Sorting
- Pagination
- Data Validation
- Error Handling
- Clean Project Architecture
- Serverless and Long-Running Deployment Targets

---

# Learning Objectives

This project was built to strengthen and demonstrate backend software engineering skills including:

- Designing RESTful APIs
- Building scalable Express applications
- Modeling MongoDB document relationships
- Implementing complete CRUD operations
- Applying business rules and validation
- Processing shopping carts into customer orders
- Working with query parameters for filtering and sorting
- Writing clean and maintainable backend code

---

# Technologies Used

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Morgan
- dotenv
- Helmet
- CORS
- express-rate-limit

---

# Production Hardening (Implemented)

The API now includes incremental production-hardening improvements:

- Centralized error handling with a shared error response format
- Async controller wrapper to forward promise errors consistently
- Route-not-found middleware (`404`)
- Request validation middleware for carts, customers, and products
- Security middleware: Helmet, CORS, JSON payload size limit, and API rate limiting (`429`)
- Startup reliability improvements:
     - Fail-fast startup if MongoDB connection fails
     - Graceful shutdown on `SIGINT` and `SIGTERM`

> **In progress**
>
> Orders hardening is tracked in a dedicated branch and will be merged after validation and controller refactor are completed.

---

# Sprint Roadmap

Use this checklist to track production-readiness hardening work.

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

## Sprint 4 - Orders Hardening (Current)

- [ ] Add order request validation middleware and route wiring
- [ ] Migrate orders controller to centralized error handling
- [ ] Merge `orders-hardening` into `main`

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
- [ ] Deploy to Vercel and verify the catch-all rewrite

---

# Mongoose Features Used

- Schema Validation
- ObjectId References
- populate()
- find()
- findById()
- findOne()
- findOneAndUpdate()
- findByIdAndUpdate()
- findByIdAndDelete()

### MongoDB Update Operators

- `$push`
- `$pull`
- `$set`

---

# Features

## Products

Complete CRUD functionality.

- Create products
- Retrieve all products
- Retrieve a product by ID
- Update products
- Delete products

### Query Parameters

`GET /api/products` accepts the parameters below. Unknown parameters are rejected with `400` rather than ignored, so a typo surfaces immediately instead of returning an unfiltered result set.

| Parameter | Type | Description |
|---|---|---|
| `category` | string | Exact match, case-insensitive |
| `search` | string | Matches `name` or `description`, case-insensitive |
| `minPrice` | number | Inclusive lower bound, must be `>= 0` |
| `maxPrice` | number | Inclusive upper bound, must be `>= minPrice` |
| `inStock` | `true` or `false` | `true` returns `stock > 0`, `false` returns `stock === 0` |
| `sortBy` | `price` or `name` | Field to sort on |
| `sortOrder` | `asc` or `desc` | Defaults to `asc` |
| `page` | integer | Defaults to `1` |
| `limit` | integer | Defaults to `20`, maximum `100` |

Available categories:

- Electronics
- Audio
- Home & Kitchen
- Home Office
- Apparel & Accessories
- Fitness & Wellness

Examples:

```http
GET /api/products?category=Audio&minPrice=20&maxPrice=100&inStock=true
GET /api/products?search=wireless&sortBy=price&sortOrder=desc
GET /api/products?page=2&limit=6
```

Implementation notes:

- Name sorting applies an `en` collation at strength 2. MongoDB compares strings by byte value by default, which sorts every capital ahead of every lowercase and would place `LED Desk Lamp` before `Laptop Backpack`.
- `category` and `search` are escaped before being compiled into regular expressions.
- Invalid values return `400` with code `INVALID_PRODUCT_QUERY` and a message naming the parameter at fault.

### Pagination

Product responses include a `meta` block describing the result set:

```json
{
    "message": "Products retrieved successfully",
    "products": ["..."],
    "meta": {
        "total": 20,
        "page": 1,
        "limit": 20,
        "totalPages": 1,
        "hasNextPage": false,
        "hasPreviousPage": false
    }
}
```

`total` counts documents matching the active filter rather than the whole collection, so a filtered request reports the size of its own result set.

---

## Customers

Complete CRUD functionality.

- Create customer
- Retrieve all customers
- Retrieve customer by ID
- Update customer
- Delete customer

---

## Shopping Cart

Each customer is limited to **one shopping cart**.

Current functionality includes:

- Create shopping cart
- Retrieve shopping cart
- Add products to cart
- Remove products from cart
- Update product quantity
- Clear shopping cart
- Calculate total cart price
- Populate customer and product information

### Business Rules

- One shopping cart per customer
- Product existence validation
- Quantity validation
- Automatic total price calculation
- Cart updates performed using MongoDB update operators

---

## Orders

Orders are created directly from a customer's shopping cart.

When an order is placed, the API will:

- Verify the customer's cart exists
- Verify the cart is not empty
- Calculate the total order price
- Copy all cart items into the order
- Set the order status to **Pending**
- Automatically clear the customer's shopping cart

Current functionality:

- Create order from cart

### Business Rules

- Orders can only be created from existing carts
- Empty carts cannot be checked out
- Order totals are calculated automatically
- Shopping carts are automatically cleared after checkout

---

# HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Resource Created |
| 400 | Bad Request |
| 404 | Resource Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

# API Endpoints

## Products

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/products` | Retrieve products, with optional filtering, search, sorting, and pagination |
| GET | `/api/products/:id` | Retrieve a product by ID |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |

---

## Customers

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/customers` | Retrieve all customers |
| GET | `/api/customers/:id` | Retrieve customer by ID |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |

---

## Shopping Cart

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/carts` | Create a shopping cart |
| GET | `/api/carts/:customer` | Retrieve a customer's cart |
| POST | `/api/carts/:customer/products` | Add product to cart |
| PUT | `/api/carts/:customer/products` | Update product quantity |
| DELETE | `/api/carts/:customer/products` | Remove product from cart |
| DELETE | `/api/carts/:customer/clear` | Clear shopping cart |

---

## Orders

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/orders/:customer` | Create an order from a customer's cart |

---

## Operational

These sit outside `/api` and are therefore exempt from rate limiting, which makes `/health` a suitable target for an uptime monitor or keep-warm ping.

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/health` | `200` while the process is running. Does not touch the database |
| GET | `/ready` | `200` when MongoDB is reachable, `503` otherwise |

---

# Example Workflow

```text
Customer
     │
     ▼
Create Shopping Cart
     │
     ▼
Add Products
     │
     ▼
Retrieve Shopping Cart
     │
     ▼
Total Price Calculated
     │
     ▼
Checkout
     │
     ▼
Order Created
     │
     ▼
Shopping Cart Cleared
```

---

# Example Response

```json
{
    "message": "Cart retrieved successfully.",
    "cart": {
        "...": "..."
    },
    "totalPrice": 152.94
}
```

---

# Seed Database (Optional)

This project includes a database seed script to quickly populate MongoDB with sample data for testing.

The seed script creates:

- 20 sample products
- 20 sample customers
- Sample shopping carts populated with products

This allows the API to be tested immediately without manually creating records.

## Run the Seed Script

After configuring your `.env` file:

```env
MONGODB_URI=your_connection_string
```

Run the seed script:

```bash
npm run seed
```

or

```bash
node seed/seed.js
```

The script will automatically:

- Connect to MongoDB
- Remove previously seeded data
- Insert sample products
- Insert sample customers
- Create sample shopping carts

Example output:

```text
Connected to MongoDB
Existing data removed
Inserted 20 products
Inserted 20 customers
Inserted sample carts
Database seeded successfully
```

> **Important**
>
> All customer names, addresses, phone numbers, email addresses, product descriptions, pricing, and other information generated by the seed script are **fictional** and are provided **solely for development and testing purposes**.

Using the seed script is optional.

---

# DNS Troubleshooting (Optional)

If you experience MongoDB Atlas connection issues caused by DNS resolution (commonly when using a mobile hotspot or restrictive network), you may temporarily add the following code before connecting to MongoDB:

```javascript
const dns = require("node:dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);
```

> **Note**
>
> This workaround was only used during development to resolve a local DNS issue. If your application connects to MongoDB Atlas successfully, remove this code before running the application.

---

# Project Structure

```text
ECommerce-Backend-API
│
├── api/
│   └── index.js          Vercel entry point, exports the app without listening
├── controllers/
├── database/
├── middlewares/
├── models/
├── routes/
├── seed/
│   ├── README.md
│   └── seed.js
├── utils/
├── .env
├── .env.example
├── .gitignore
├── app.js                Builds and exports the configured Express app
├── index.js              Local and Render entry point, adds the listener
├── vercel.json
├── package.json
├── package-lock.json
└── README.md
```

`app.js` holds every route and middleware. `index.js` and `api/index.js` are thin entry points that adapt it to a long-running server and a serverless function respectively, so both deployment targets run identical application code.

---

# Installation

Clone the repository:

```bash
git clone https://github.com/Vros15/EComerce-Backend-API.git
```

Navigate into the project:

```bash
cd EComerce-Backend-API
```

Install dependencies:

```bash
npm install
```

Create a `.env` file. See `.env.example` for the full list with notes:

```env
MONGODB_URI=your_connection_string
# Optional
PORT=3000
RATE_LIMIT_MAX=1000
CORS_ORIGIN=http://localhost:5173
```

> `RATE_LIMIT_MAX` defaults to `100` per 15 minutes. That is easy to exhaust while developing a frontend, since React StrictMode double-fires effects and every hot reload refetches.

Start the development server:

```bash
npm start
```

Or with file watching:

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

---

# Future Improvements

- Retrieve all orders
- Retrieve a single order by ID
- Retrieve orders by customer
- Filter orders by status
- Update order status
- Automatically reduce product inventory after checkout
- JWT Authentication
- Password hashing with bcrypt
- User authentication
- Role-based authorization
- Complete orders validation middleware coverage
- Unit and integration testing with Jest
- Swagger / OpenAPI documentation
- Docker support

---

# Deployment History

This API was first deployed to Render as a long-running Express server, then restructured to also run on Vercel as a serverless function. Both targets remain supported: `index.js` attaches a listener for a persistent server, `api/index.js` exports the same app for per-request invocation, and `app.js` holds the application code both share. The move was a hosting decision, not a rewrite.

## Starting on Render

Render matched how the code was already written. Express with a persistent process, a connection pool opened once at startup, graceful shutdown on `SIGINT` and `SIGTERM`, and in-memory rate limiting all behave the way they were designed to behave. Deployment was a build command and a start command, with no changes to the application.

Measured warm, `GET /api/products` returned in roughly 230ms.

## Why the Move

The free tier spins a service down after roughly 15 minutes of inactivity and takes up to a minute to wake it.

That penalty falls hardest on exactly this kind of project. A high-traffic service is rarely idle, so one visitor absorbs the wait and the rest are served warm. A portfolio API is idle almost all the time and receives isolated visits days apart, which means close to every visitor pays the full cold start. Low traffic does not reduce the problem; it makes it near-certain.

The alternatives were a keep-warm ping, a paid instance, or a platform without the penalty. Serverless cold starts are roughly two orders of magnitude smaller, and the frontend that consumes this API deploys to Vercel already.

## Trade-offs Accepted

| | Render | Vercel |
|---|---|---|
| Cold start | 30–60s after idle | Approximately 1–2s |
| Keep-warm ping | Required to avoid it | Not required |
| Rate limiting | Enforced correctly | Per-instance, effectively advisory |
| Connection model | One pool for the process lifetime | Cached per instance, reused while warm |
| Graceful shutdown | Meaningful | Not applicable |
| Cost to avoid cold starts | Paid instance or external monitor | None |

## What the Move Cost

**Rate limiting stopped being enforceable.** `express-rate-limit` stores counters in memory. Every serverless instance keeps its own, so the effective ceiling multiplies by instance count and resets whenever instances recycle. Restoring a real limit requires a shared store such as Redis. On Render the limit works as configured.

**Connection handling required rework.** A serverless platform has no startup phase, so connecting once before listening is not available. The connection is cached on `globalThis` and established per request, with the in-flight promise cached rather than only the resolved connection, so concurrent requests arriving at a cold instance share a single attempt instead of opening one apiece. Without that, instance count multiplies straight into the Atlas connection limit.

Simulating a cold instance locally, five concurrent requests opened exactly one connection and completed in roughly 700ms–1s including the Atlas handshake, against 35ms once warm.

**Shutdown handling became inert.** The `SIGINT` and `SIGTERM` handlers still run under `index.js` and are simply unused on serverless.

## Why Both Are Kept

Splitting `app.js` from the entry points cost a few lines and keeps the decision reversible. Render remains a valid target if the rate limiter needs to be enforceable, and the same code serves both without branching on the environment.

---

# Deploy to Render

Use these settings when creating a new **Web Service** in Render.

## Render Service Settings

- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/health`

## Required Environment Variables

- `MONGODB_URI` = your MongoDB Atlas connection string

## Optional Environment Variables

- `PORT` = leave empty in Render unless you have a special requirement (Render injects `PORT` automatically)
- `RATE_LIMIT_MAX` = request cap per 15-minute window (default `100`)
- `CORS_ORIGIN` = comma-separated allowed origins, for example:

```env
CORS_ORIGIN=https://your-frontend.onrender.com,https://yourdomain.com
```

## Post-Deploy Smoke Checks

After deployment, validate:

```http
GET /health
GET /ready
GET /api/products
```

Expected behavior:

- `/health` returns `200` when the API process is running.
- `/ready` returns `200` when MongoDB is connected, otherwise `503`.

## Pre-Push Checklist

- Ensure `.env` is excluded from git.
- Confirm all endpoints work locally with Atlas.
- Verify order routes are hardened before exposing publicly.
- Seed database only in non-production environments.

> **Free tier note**
>
> Render free web services spin down after roughly 15 minutes of inactivity and take up to a minute to wake. A portfolio API is idle almost all the time, so nearly every visitor hits that delay. Pointing an uptime monitor at `/health` on a 10-minute interval avoids it. `/health` sits outside `/api`, so the ping consumes no rate limit budget and issues no database query.

---

# Deploy to Vercel

The app runs as a single serverless function. `api/index.js` exports the Express instance without a listener, and `vercel.json` rewrites every path to it, so the existing router remains the only place routes are defined.

## Vercel Project Settings

- Framework Preset: `Other`
- Build Command: leave empty
- Output Directory: leave empty
- Install Command: `npm install`

## Required Environment Variables

- `MONGODB_URI` = your MongoDB Atlas connection string

## Optional Environment Variables

- `RATE_LIMIT_MAX` = request cap per 15-minute window
- `CORS_ORIGIN` = comma-separated allowed origins

> **Preview deployments and CORS**
>
> Vercel assigns a unique URL to every branch and commit. A fixed `CORS_ORIGIN` list rejects all of them, so preview builds of a frontend will fail against a production API while working locally. Leaving `CORS_ORIGIN` unset falls through to `*`.

## Serverless Considerations

- The Mongoose connection is cached on `globalThis`, so warm invocations reuse it instead of opening a connection per request and exhausting the Atlas connection limit.
- `express-rate-limit` keeps its counters in memory. Each instance has its own, so the effective limit scales with instance count and resets as instances recycle. A shared store is required for the limit to mean anything in this environment.
- The `SIGINT` and `SIGTERM` handlers in `index.js` do not apply to serverless invocations.
- `regions` in `vercel.json` should match the Atlas cluster region. A mismatch adds a round trip to every query.

## Post-Deploy Smoke Checks

```http
GET /health
GET /ready
GET /api/products
```

`/api/products` also confirms the catch-all rewrite is reaching the Express router rather than returning a platform 404.

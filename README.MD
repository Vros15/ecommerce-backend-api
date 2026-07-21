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
- Data Validation
- Error Handling
- Clean Project Architecture

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

- [ ] Add `/health` endpoint
- [ ] Add `/ready` endpoint with database readiness check
- [ ] Add smoke/integration tests for core API flows
- [ ] Update API documentation for standardized error responses

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

### Product Filtering

Supports filtering by:

- Category
- Minimum Price
- Maximum Price
- In-Stock Products

Example:

```http
GET /api/products?category=Audio&minPrice=20&maxPrice=100&inStock=true
```

### Product Sorting

Supports sorting by:

- Price
- Name

Example:

```http
GET /api/products?sortBy=price&sortOrder=desc
```

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
| GET | `/api/products` | Retrieve all products |
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
├── .gitignore
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

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

Create a `.env` file:

```env
MONGODB_URI=your_connection_string
# Optional
PORT=3000
RATE_LIMIT_MAX=100
CORS_ORIGIN=http://localhost:3000
```

Start the development server:

```bash
node index.js
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
- Pagination
- Automatically reduce product inventory after checkout
- JWT Authentication
- Password hashing with bcrypt
- User authentication
- Role-based authorization
- Complete orders validation middleware coverage
- Unit and integration testing with Jest
- Swagger / OpenAPI documentation
- Docker support
- Deploy to Render

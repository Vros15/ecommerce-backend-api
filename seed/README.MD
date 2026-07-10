# Database Seed Files

This folder contains seed data used to populate the MongoDB database with sample data for development and testing.

## Contents

- `products.js` – Sample product data
- `customers.js` – Sample customer data
- `carts.js` – Sample shopping cart data
- `seed.js` – Main script used to seed the database

## Usage

Run the following command from the project root:

```bash
npm run seed
```

The seed script will:

1. Connect to MongoDB
2. Delete existing products, customers, carts, and orders
3. Insert fresh sample data
4. Close the database connection

## Disclaimer

All customer information, product information, addresses, phone numbers, email addresses, and other data contained in these seed files are **fictional** and are provided **solely for development, demonstration, and testing purposes**.

Any resemblance to real persons, businesses, or products is purely coincidental.

These files do **not** contain real customer information or production data.
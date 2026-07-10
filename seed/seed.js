require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("node:dns");

// Force Node to use public DNS servers
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Models
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

// Seed Data
const products = require("./products");
const customers = require("./customers");
const carts = require("./carts");

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("✅ Connected to MongoDB");

        // Delete existing data
        await Product.deleteMany({});
        await Customer.deleteMany({});
        await Cart.deleteMany({});
        await Order.deleteMany({});

        console.log("🗑️ Existing data removed");

        // Insert products
        const insertedProducts = await Product.insertMany(products);
        console.log(`✅ Inserted ${insertedProducts.length} products`);

        // Insert customers
        const insertedCustomers = await Customer.insertMany(customers);
        console.log(`✅ Inserted ${insertedCustomers.length} customers`);

        // Create cart documents using the inserted IDs
        const cartDocuments = carts.map(cart => ({
            customer: insertedCustomers[cart.customerIndex]._id,
            products: cart.products.map(product => ({
                productId: insertedProducts[product.productIndex]._id,
                quantity: product.quantity
            }))
        }));

        // Insert carts
        const insertedCarts = await Cart.insertMany(cartDocuments);
        console.log(`✅ Inserted ${insertedCarts.length} carts`);

        console.log("🎉 Database seeded successfully!");

        await mongoose.connection.close();
        console.log("🔌 MongoDB connection closed");
    } catch (error) {
        console.error("❌ Error seeding database:");
        console.error(error);

        await mongoose.connection.close();
    }
}

seedDatabase();
//import mongoose
const mongoose = require("mongoose");

//create a schema for the order
const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
    },
    // Set on orders created by the Stripe webhook, where there is no
    // Customer document to reference - a Clerk-authenticated shopper's cart
    // is client-side only. Left unset on the older admin-created-from-cart
    // flow, which still uses `customer` above.
    clerkUserId: {
        type: String,
    },
    // The Stripe Checkout Session this order was created from. Stripe
    // retries webhook delivery on any non-2xx response, so this doubles as
    // the idempotency key that stops a retry from creating a duplicate
    // order. Unset (and therefore absent from the unique index) on the
    // admin-created-from-cart flow, which never touches Stripe.
    stripeSessionId: {
        type: String,
        unique: true,
        sparse: true,
    },
    //products (array of objects with productId (reference to Product) (required) and quantity (number)
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
        },
    ],
    //total price of the order
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    //status of the order (pending, shipped, delivered, cancelled)
    status: {
        type: String,
        enum: ["pending", "shipped", "delivered", "cancelled"],
        default: "pending",
    },
}, { timestamps: true });

// Create a model based on the schema
const Order = mongoose.model("Order", orderSchema);

// Export the model
module.exports = Order;
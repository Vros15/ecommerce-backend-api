//import mongoose
const mongoose = require("mongoose");

//create a schema for the order
const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
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
            },
        },
    ],
    //total price of the order
    totalPrice: {
        type: Number,
        required: true,
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
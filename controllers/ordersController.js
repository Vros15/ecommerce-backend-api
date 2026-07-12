//TODO: Implement the orders controller functions for creating, retrieving, updating, and deleting orders.
const Order = require("../models/Order");
const Cart = require("../models/Cart");

// Function to create a new order from the cart 
// Create a new order from a customer's cart
const createOrderFromCart = async (req, res) => {
    try {
        const { customer } = req.params;

        // Find the customer's cart and populate product details
        const cart = await Cart.findOne({ customer })
            .populate("products.productId");

        // Check if the cart exists
        if (!cart) {
            return res.status(404).json({
                message: "Cart not found for this customer."
            });
        }

        // Check if the cart is empty
        if (cart.products.length === 0) {
            return res.status(400).json({
                message: "Cart is empty."
            });
        }

        // Calculate the total price
        const totalPrice = Number(
            cart.products
                .reduce(
                    (total, item) =>
                        total + item.quantity * item.productId.price,
                    0
                )
                .toFixed(2)
        );

        // Create the order
        const newOrder = await Order.create({
            customer,
            products: cart.products.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity
            })),
            totalPrice
        });

        // Clear the customer's cart
        await Cart.findOneAndUpdate(
            { customer },
            {
                $set: {
                    products: []
                }
            }
        );

        // Return the newly created order
        res.status(201).json({
            message: "Order created successfully.",
            order: newOrder
        });

    } catch (error) {
        res.status(500).json({
            message: "Error creating order.",
            error: error.message
        });
    }
};



// Function to retrieve all orders

// Function to retrieve a single order by ID

// Function to update an order by ID

// Function to delete an order by ID

// Export the controller functions for use in the routes
module.exports = { createOrderFromCart };
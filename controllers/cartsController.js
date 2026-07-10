const Cart = require("../models/Cart");

const createOneCart = async (req, res) => {
    try {
        const { customer, products } = req.body;

        // Check if this customer already has a cart
        const existingCart = await Cart.findOne({ customer });

        if (existingCart) {
            return res.status(400).json({
                message: "Customer already has a shopping cart."
            });
        }

        // Create the cart
        const newCart = await Cart.create({
            customer,
            products
        });

        res.status(201).json({
            message: "Cart created successfully.",
            cart: newCart
        });

    } catch (error) {
        res.status(500).json({
            message: "Error creating cart.",
            error: error.message
        });
    }
};

const getCart = async (req, res) => { 
    try {
        //deconstruct the customer parameter from the request URL
        const { customer } = req.params;

        const cart = await Cart.findOne({ customer });

        // If no cart is found for the given customer, return a 404 error.
        if (!cart) {
            return res.status(404).json({
                message: "Cart not found for this customer."
            });
        }
        // Return the cart details if found
        res.status(200).json({
            message: "Cart retrieved successfully.",
            cart
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving cart.",
            error: error.message
        });
    }
};

const addProductToCart = async (req, res) => {
    try {
        const { customer } = req.params;
        const { productId, quantity } = req.body;

        // Validate request body
        if (!productId || quantity == null) {
            return res.status(400).json({
                message: "Both productId and quantity are required."
            });
        }

        // Find the customer's cart and add the product
        const updatedCart = await Cart.findOneAndUpdate(
            { customer },
            {
                $push: {
                    products: {
                        productId,
                        quantity
                    }
                }
            },
            {
                new: true
            }
        );

        // Check if the cart exists
        if (!updatedCart) {
            return res.status(404).json({
                message: "Cart not found for this customer."
            });
        }

        res.status(200).json({
            message: "Product added to cart successfully.",
            cart: updatedCart
        });

    } catch (error) {
        res.status(500).json({
            message: "Error adding product to cart.",
            error: error.message
        });
    }
};

module.exports = {
    createOneCart,
    getCart,
    addProductToCart
};
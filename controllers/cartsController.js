const Cart = require("../models/Cart");
const Product = require("../models/Product");

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

        const cart = await Cart.findOne({ customer })
        .populate("customer")
        .populate("products.productId");

        // If no cart is found for the given customer, return a 404 error.
        if (!cart) {
            return res.status(404).json({
                message: "Cart not found for this customer."
            });
        }
        const totalPrice = cart.products.reduce((total, item) => total + item.quantity * item.productId.price, 0);
        
        // Return the cart details if found with total price calculated
        res.status(200).json({
            message: "Cart retrieved successfully.",
            cart,
            totalPrice
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
        if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                message: "Both productId and a valid quantity are required."
            });
        }

        // Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found."
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

//Remove product from cart
const removeProductFromCart = async (req, res) => {
    try {
        const { customer } = req.params;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                message: "productId is required."
            });
        }

        const updatedCart = await Cart.findOneAndUpdate(
            {
                customer,
                "products.productId": productId
            },
            {
                $pull: {
                    products: { productId }
                }
            },
            {
                new: true
            }
        );

        if (!updatedCart) {
            return res.status(404).json({
                message: "Cart not found or product not in cart."
            });
        }

        res.status(200).json({
            message: "Product removed from cart successfully.",
            cart: updatedCart
        });

    } catch (error) {
        res.status(500).json({
            message: "Error removing product from cart.",
            error: error.message
        });
    }
};

//clear the cart
const clearCart = async (req, res) => {
    try {
        const { customer } = req.params;

        const updatedCart = await Cart.findOneAndUpdate(
            { customer },
            { $set: { products: [] } },
            { new: true }
        );

        if (!updatedCart) {
            return res.status(404).json({
                message: "Cart not found for this customer."
            });
        }

        res.status(200).json({
            message: "Cart cleared successfully.",
            cart: updatedCart
        });

    } catch (error) {
        res.status(500).json({
            message: "Error clearing cart.",
            error: error.message
        });
    }
};


module.exports = {
    createOneCart,
    getCart,
    addProductToCart,
    removeProductFromCart,
    clearCart
};
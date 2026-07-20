const Cart = require("../models/Cart");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const createOneCart = asyncHandler(async (req, res) => {
    const { customer, products } = req.body;

    // Check if this customer already has a cart
    const existingCart = await Cart.findOne({ customer });

    if (existingCart) {
        throw new AppError("Customer already has a shopping cart.", 400, "CART_ALREADY_EXISTS");
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
});

const getCart = asyncHandler(async (req, res) => { 
    //deconstruct the customer parameter from the request URL
    const { customer } = req.params;

    const cart = await Cart.findOne({ customer })
    .populate("customer")
    .populate("products.productId");

    // If no cart is found for the given customer, return a 404 error.
    if (!cart) {
        throw new AppError("Cart not found for this customer.", 404, "CART_NOT_FOUND");
    }
    const totalPrice = cart.products.reduce((total, item) => total + item.quantity * item.productId.price, 0).toFixed(2);
    
    // Return the cart details if found with total price calculated
    res.status(200).json({
        message: "Cart retrieved successfully.",
        cart,
        totalPrice
    });
});

const addProductToCart = asyncHandler(async (req, res) => {
    const { customer } = req.params;
    const { productId, quantity } = req.body;

    // Validate request body
    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
        throw new AppError("Both productId and a valid quantity are required.", 400, "INVALID_CART_INPUT");
    }

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
        throw new AppError("Product not found.", 404, "PRODUCT_NOT_FOUND");
    }

    //check if product already exist in the cart
    const cart = await Cart.findOne({
            customer,
            "products.productId": productId
        });
    if (cart) {
        throw new AppError("Product already exists in the cart.", 400, "PRODUCT_ALREADY_IN_CART");
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
        throw new AppError("Cart not found for this customer.", 404, "CART_NOT_FOUND");
    }

    res.status(200).json({
        message: "Product added to cart successfully.",
        cart: updatedCart
    });
});

//Remove product from cart
const removeProductFromCart = asyncHandler(async (req, res) => {
    const { customer } = req.params;
    const { productId } = req.body;

    if (!productId) {
        throw new AppError("productId is required.", 400, "INVALID_CART_INPUT");
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
        throw new AppError("Cart not found or product not in cart.", 404, "CART_OR_PRODUCT_NOT_FOUND");
    }

    res.status(200).json({
        message: "Product removed from cart successfully.",
        cart: updatedCart
    });
});

//clear the cart
const clearCart = asyncHandler(async (req, res) => {
    const { customer } = req.params;

    const updatedCart = await Cart.findOneAndUpdate(
        { customer },
        { $set: { products: [] } },
        { new: true }
    );

    if (!updatedCart) {
        throw new AppError("Cart not found for this customer.", 404, "CART_NOT_FOUND");
    }

    res.status(200).json({
        message: "Cart cleared successfully.",
        cart: updatedCart
    });
});

//update the quantity of the cart
const updateQuantity = asyncHandler(async (req, res) => {
    const { customer } = req.params;
    const { productId, quantity } = req.body;

    if (!productId || quantity == null) {
        throw new AppError("productId and quantity are required.", 400, "INVALID_CART_INPUT");
    }

    const updatedCart = await Cart.findOneAndUpdate(
        {
            customer,
            "products.productId": productId
        },
        {
            $set: {
                "products.$.quantity": quantity
            }
        },
        {
            new: true
        }
    );

    if (!updatedCart) {
        throw new AppError("Cart not found or product not in cart.", 404, "CART_OR_PRODUCT_NOT_FOUND");
    }

    res.status(200).json({
        message: "Product quantity updated successfully.",
        cart: updatedCart
    });
});

module.exports = {
    createOneCart,
    getCart,
    addProductToCart,
    removeProductFromCart,
    clearCart,
    updateQuantity
};
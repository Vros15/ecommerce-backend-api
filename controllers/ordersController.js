const { getAuth } = require("@clerk/express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

// Create a new order from a customer's cart
const createOrderFromCart = asyncHandler(async (req, res) => {
    const { customer } = req.params;

    const cart = await Cart.findOne({ customer }).populate("products.productId");

    if (!cart) {
        throw new AppError("Cart not found for this customer.", 404, "CART_NOT_FOUND");
    }

    if (cart.products.length === 0) {
        throw new AppError("Cart is empty.", 400, "EMPTY_CART");
    }

    const totalPrice = Number(
        cart.products
            .reduce((total, item) => total + item.quantity * item.productId.price, 0)
            .toFixed(2)
    );

    const newOrder = await Order.create({
        customer,
        products: cart.products.map((item) => ({
            productId: item.productId._id,
            quantity: item.quantity,
        })),
        totalPrice,
    });

    await Cart.findOneAndUpdate({ customer }, { $set: { products: [] } });

    res.status(201).json({
        message: "Order created successfully.",
        order: newOrder,
    });
});

// Retrieve all orders, optionally filtered by status
const getAllOrders = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const orders = await Order.find(filter).populate("products.productId");

    res.status(200).json({
        message: "Orders retrieved successfully.",
        orders,
    });
});

// Retrieve the signed-in shopper's own orders - filtered strictly by the
// verified token's user id, never a client-supplied one, so one shopper
// can't read another's orders by editing a query param. These are the
// orders the Stripe webhook created, so there is no admin-created,
// customer-referenced order in this list.
const getMyOrders = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    const orders = await Order.find({ clerkUserId: userId })
        .populate("products.productId")
        .sort({ createdAt: -1 });

    res.status(200).json({
        message: "Orders retrieved successfully.",
        orders,
    });
});

// Retrieve a single order by ID
const getOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("products.productId");

    if (!order) {
        throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
    }

    res.status(200).json({
        message: "Order retrieved successfully.",
        order,
    });
});

// Update an order's status by ID
const updateOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

    if (!updatedOrder) {
        throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
    }

    res.status(200).json({
        message: "Order updated successfully.",
        order: updatedOrder,
    });
});

// Delete an order by ID
const deleteOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
        throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
    }

    res.status(200).json({
        message: "Order deleted successfully.",
        order: deletedOrder,
    });
});

module.exports = { createOrderFromCart, getAllOrders, getMyOrders, getOrderById, updateOrderById, deleteOrderById };

//TODO: Implement the orders router for handling order-related API endpoints.

// Import the Express router and the orders controller
const express = require("express");
const router = express.Router();
const {createOrderFromCart,getAllOrders,getMyOrders,getOrderById, updateOrderById,deleteOrderById  } = require("../controllers/ordersController");
const requireAuth = require("../middlewares/requireAuth");
const requireAdmin = require("../middlewares/requireAdmin");

// Every write is restricted to the single admin account; GET stays public.

//POST create a new order
//endpoint: POST /order/:customer
router.post("/:customer", requireAuth(), requireAdmin, createOrderFromCart);

//GET all orders & Filter by status
//endpoint: GET /order?status=pending
router.get("/", getAllOrders);

// GET the signed-in shopper's own orders. Registered ahead of /:orderId
// below - otherwise Express would match "me" as an :orderId value instead
// of reaching this route at all.
// endpoint: GET /api/orders/me
router.get("/me", requireAuth(), getMyOrders);

//GET a single order by ID
//endpoint: GET /order/:orderId
router.get("/:orderId", getOrderById);

//PUT update status of an order by ID
//endpoint: PUT /order/:orderId
router.put("/:orderId", requireAuth(), requireAdmin, updateOrderById);

//DELETE delete an order by ID
//endpoint: DELETE /order/:orderId
router.delete("/:orderId", requireAuth(), requireAdmin, deleteOrderById);


//Export the router for use in the main application
module.exports = router;
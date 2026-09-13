// Import the Express router and the orders controller
const express = require("express");
const router = express.Router();
const {createOrderFromCart,getAllOrders,getMyOrders,getOrderById, updateOrderById,deleteOrderById  } = require("../controllers/ordersController");
const requireAuth = require("../middlewares/requireAuth");
const requireAdmin = require("../middlewares/requireAdmin");
const {
  requireValidCustomerParam,
  requireValidOrderIdParam,
  validateUpdateOrderBody,
} = require("../middlewares/validateOrderRequests");

// Every write is restricted to the single admin account; GET stays public.
// Auth and admin checks run ahead of validation on every write, matching
// products/carts - a stranger should learn nothing about the shape of a
// valid request body.

//POST create a new order
//endpoint: POST /order/:customer
router.post("/:customer", requireAuth(), requireAdmin, requireValidCustomerParam, createOrderFromCart);

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
router.get("/:orderId", requireValidOrderIdParam, getOrderById);

//PUT update status of an order by ID
//endpoint: PUT /order/:orderId
router.put("/:orderId", requireAuth(), requireAdmin, requireValidOrderIdParam, validateUpdateOrderBody, updateOrderById);

//DELETE delete an order by ID
//endpoint: DELETE /order/:orderId
router.delete("/:orderId", requireAuth(), requireAdmin, requireValidOrderIdParam, deleteOrderById);


//Export the router for use in the main application
module.exports = router;

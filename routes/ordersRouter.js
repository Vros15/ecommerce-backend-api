//TODO: Implement the orders router for handling order-related API endpoints.

// Import the Express router and the orders controller
const express = require("express");
const router = express.Router();
const {createOrderFromCart,getAllOrders} = require("../controllers/ordersController");

//POST create a new order
//endpoint: POST /order/:customer
router.post("/:customer", createOrderFromCart);

//GET all orders & Filter by status
router.get("/", getAllOrders);

//GET a single order by ID

//PUT update status of an order by ID

//DELETE delete an order by ID

//Export the router for use in the main application
module.exports = router;
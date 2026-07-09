const express = require("express");
const router = express.Router();
const {createOneCart, getCart} = require("../controllers/cartsController");

// Route to create a new cart
//endpoint: POST /api/carts
router.post("/", createOneCart);

// Route to get a cart by customer
//endpoint: GET /api/carts/:customer
router.get("/:customer", getCart);

module.exports = router;
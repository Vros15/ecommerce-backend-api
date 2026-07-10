const express = require("express");
const router = express.Router();
const {createOneCart, getCart,addProductToCart} = require("../controllers/cartsController");

// Route to create a new cart
//endpoint: POST /api/carts
router.post("/", createOneCart);

// Route to get a cart by customer
//endpoint: GET /api/carts/:customer
router.get("/:customer", getCart);

// Route to add a product to a cart by customer
//endpoint: POST /api/carts/:customer/products
router.post("/:customer/products", addProductToCart);

module.exports = router;
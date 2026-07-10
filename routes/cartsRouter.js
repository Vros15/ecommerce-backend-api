const express = require("express");
const router = express.Router();
const {createOneCart, getCart,addProductToCart,removeProductFromCart, clearCart} = require("../controllers/cartsController");

// Route to create a new cart
//endpoint: POST /api/carts
router.post("/", createOneCart);

// Route to get a cart by customer
//endpoint: GET /api/carts/:customer
router.get("/:customer", getCart);

// Route to add a product to a cart by customer
//endpoint: POST /api/carts/:customer/products
router.post("/:customer/products", addProductToCart);

// Route to remove a product from a cart by customer
//endpoint: DELETE /api/carts/:customer/products
router.delete("/:customer/products", removeProductFromCart);

// Route to clear a cart by customer
//endpoint: DELETE /api/carts/:customer/clear
router.delete("/:customer/clear", clearCart);

module.exports = router;
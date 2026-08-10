const express = require("express");
const router = express.Router();
const {createOneCart, getCart,addProductToCart,removeProductFromCart, clearCart, updateQuantity} = require("../controllers/cartsController");
const {
	requireValidCustomerParam,
	validateCreateCartBody,
	validateAddProductBody,
	validateRemoveProductBody,
	validateUpdateQuantityBody,
} = require("../middlewares/validateCartRequests");
const requireAuth = require("../middlewares/requireAuth");
const requireAdmin = require("../middlewares/requireAdmin");

// Every write is restricted to the single admin account; GET stays public.

// Route to create a new cart
//endpoint: POST /api/carts
router.post("/", requireAuth(), requireAdmin, validateCreateCartBody, createOneCart);

// Route to get a cart by customer
//endpoint: GET /api/carts/:customer
router.get("/:customer", requireValidCustomerParam, getCart);

// Route to add a product to a cart by customer
//endpoint: POST /api/carts/:customer/products
router.post("/:customer/products", requireAuth(), requireAdmin, requireValidCustomerParam, validateAddProductBody, addProductToCart);

// Route to remove a product from a cart by customer
//endpoint: DELETE /api/carts/:customer/products
router.delete("/:customer/products", requireAuth(), requireAdmin, requireValidCustomerParam, validateRemoveProductBody, removeProductFromCart);

// Route to clear a cart by customer
//endpoint: DELETE /api/carts/:customer/clear
router.delete("/:customer/clear", requireAuth(), requireAdmin, requireValidCustomerParam, clearCart);

// Route to update the quantity of a product in a cart by customer
//endpoint: PUT /api/carts/:customer/products
router.put("/:customer/products", requireAuth(), requireAdmin, requireValidCustomerParam, validateUpdateQuantityBody, updateQuantity);

module.exports = router;
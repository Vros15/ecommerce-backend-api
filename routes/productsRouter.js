const express = require('express');
const router = express.Router();
const { createProduct,getAllProducts, getProductById, updateProductById,deleteProductById } = require('../controllers/productsController');
const { requireValidProductIdParam, validateProductQuery, validateCreateProductBody, validateUpdateProductBody } = require('../middlewares/validateProductRequests');
const requireAuth = require('../middlewares/requireAuth');
const requireAdmin = require('../middlewares/requireAdmin');

// Every write is restricted to the single admin account; GET stays public so
// the storefront can be browsed without signing in.

// Route to create a new product
//endpoint: POST /api/products
router.post("/", requireAuth(), requireAdmin, validateCreateProductBody, createProduct);

// Route to get all products
//endpoint: GET /api/products?category=&search=&minPrice=&maxPrice=&inStock=&sortBy=&sortOrder=&page=&limit=
router.get("/", validateProductQuery, getAllProducts);

// Route to get a product by ID
//endpoint: GET /api/products/:id
router.get("/:id", requireValidProductIdParam, getProductById);

// Route to update a product by ID
//endpoint: PUT /api/products/:id
router.put("/:id", requireAuth(), requireAdmin, requireValidProductIdParam, validateUpdateProductBody, updateProductById);

// Route to delete a product by ID
//endpoint: DELETE /api/products/:id
router.delete("/:id", requireAuth(), requireAdmin, requireValidProductIdParam, deleteProductById);

module.exports = router;

const express = require('express');
const router = express.Router();
const { createProduct,getAllProducts, getProductById, updateProductById,deleteProductById } = require('../controllers/productsController');
const { requireValidProductIdParam, validateCreateProductBody, validateUpdateProductBody } = require('../middlewares/validateProductRequests');

// Route to create a new product
//endpoint: POST /api/products
router.post("/", validateCreateProductBody, createProduct);

// Route to get all products
//endpoint: GET /api/products
router.get("/", getAllProducts);

// Route to get a product by ID
//endpoint: GET /api/products/:id
router.get("/:id", requireValidProductIdParam, getProductById);

// Route to update a product by ID
//endpoint: PUT /api/products/:id
router.put("/:id", requireValidProductIdParam, validateUpdateProductBody, updateProductById);

// Route to delete a product by ID
//endpoint: DELETE /api/products/:id
router.delete("/:id", requireValidProductIdParam, deleteProductById);

module.exports = router;

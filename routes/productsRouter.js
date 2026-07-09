const express = require('express');
const router = express.Router();
const { createProduct,getAllProducts } = require('../controllers/productsController');

// Route to create a new product
//endpoint: POST /api/products
router.post("/", createProduct);
// Route to get all products
//endpoint: GET /api/products
router.get("/", getAllProducts);

module.exports = router;

const express = require("express");
const router = express.Router();
const {createOneCart} = require("../controllers/cartsController");

// Route to create a new cart
//endpoint: POST /api/carts
router.post("/", createOneCart);

module.exports = router;
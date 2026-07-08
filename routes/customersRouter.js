const express = require("express");
const router = express.Router();
const {createCustomer} = require("../controllers/customerController");

// Route to create a new customer
router.post("/", createCustomer);


module.exports = router;


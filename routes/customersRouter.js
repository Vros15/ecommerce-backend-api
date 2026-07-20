const express = require("express");
const router = express.Router();
const {createCustomer, getAllCustomers,getCustomerById,updateCustomer,deleteCustomer} = require("../controllers/customerController");
const { requireValidIdParam, validateCreateCustomerBody, validateUpdateCustomerBody } = require("../middlewares/validateCustomerRequests");

// Route to create a new customer
//endpoint: POST /api/customers
router.post("/", validateCreateCustomerBody, createCustomer);

// Route to get all customers
//endpoint: GET /api/customers
router.get("/", getAllCustomers);

// Route to get a customer by ID
//endpoint: GET /api/customers/:id
router.get("/:id", requireValidIdParam, getCustomerById);

// Route to update a customer by ID
//endpoint: PUT /api/customers/:id
router.put("/:id", requireValidIdParam, validateUpdateCustomerBody, updateCustomer);

// Route to delete a customer by ID
//endpoint: DELETE /api/customers/:id
router.delete("/:id", requireValidIdParam, deleteCustomer);

module.exports = router;


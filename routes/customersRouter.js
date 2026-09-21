const express = require("express");
const router = express.Router();
const {createCustomer, getAllCustomers,getCustomerById,updateCustomer,deleteCustomer} = require("../controllers/customerController");
const { requireValidIdParam, validateCreateCustomerBody, validateUpdateCustomerBody } = require("../middlewares/validateCustomerRequests");
const requireAuth = require("../middlewares/requireAuth");
const requireAdmin = require("../middlewares/requireAdmin");

// Every route is admin-only, reads included: customer records hold names,
// emails, addresses, and phone numbers, and nothing in the storefront reads them.

// Route to create a new customer
//endpoint: POST /api/customers
router.post("/", requireAuth(), requireAdmin, validateCreateCustomerBody, createCustomer);

// Route to get all customers
//endpoint: GET /api/customers
router.get("/", requireAuth(), requireAdmin, getAllCustomers);

// Route to get a customer by ID
//endpoint: GET /api/customers/:id
router.get("/:id", requireAuth(), requireAdmin, requireValidIdParam, getCustomerById);

// Route to update a customer by ID
//endpoint: PUT /api/customers/:id
router.put("/:id", requireAuth(), requireAdmin, requireValidIdParam, validateUpdateCustomerBody, updateCustomer);

// Route to delete a customer by ID
//endpoint: DELETE /api/customers/:id
router.delete("/:id", requireAuth(), requireAdmin, requireValidIdParam, deleteCustomer);

module.exports = router;


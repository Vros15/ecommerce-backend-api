// controllers/customerController.js
const Customer = require("../models/Customer");

const createCustomer = async (req, res) => {
    try {
        const { name, email, address, phone } = req.body;
        const newCustomer = await Customer.create({ name, email, address, phone });
        res.status(201).json({ message: "Customer created successfully", customer: newCustomer });
    } catch (error) {
        res.status(500).json({ message: "Error creating customer", error });
    }
};

const getAllCustomers = async (req, res) => {
    try {
        
        const customers = await Customer.find();
        res.status(200).json({ customers });
    } catch (error) {
        res.status(500).json({ message: "Error fetching customers", error });
    }
};

const getCustomerById = async (req, res) => {
    try {
        const customerId = req.params.id;
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.status(200).json({ message: "Customer by ID fetched successfully", customer });
    } catch (error) {
        res.status(500).json({ message: "Error fetching customer", error });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const customerId = req.params.id;   
        const { name, email, address, phone } = req.body;
        const updatedCustomer = await Customer.findByIdAndUpdate(
            customerId,
            { name, email, address, phone },
            { new: true }
        );
        if (!updatedCustomer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.status(200).json({ message: "Customer updated successfully", customer: updatedCustomer });
    } catch (error) {
        res.status(500).json({ message: "Error updating customer", error });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const customerId = req.params.id;
        const deletedCustomer = await Customer.findByIdAndDelete(customerId);
        if (!deletedCustomer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.status(200).json({ message: "Customer deleted successfully", customer: deletedCustomer });
    } catch (error) {
        res.status(500).json({ message: "Error deleting customer", error });
    }
};

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
};
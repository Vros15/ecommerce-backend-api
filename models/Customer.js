//import mongoose
const mongoose = require("mongoose");

//create a schema for the customer
const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },

});

// Create a model based on the schema
const Customer = mongoose.model("Customer", customerSchema);

// Export the model
module.exports = Customer;
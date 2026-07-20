const AppError = require("../utils/AppError");
const mongoose = require("mongoose");

// Validates :id param is a valid MongoDB ObjectId
const requireValidIdParam = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new AppError("Invalid customer ID.", 400, "INVALID_ID"));
    }
    next();
};

// Validates required fields for creating a customer
const validateCreateCustomerBody = (req, res, next) => {
    const { name, email, address, phone } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
        return next(new AppError("name is required.", 400, "INVALID_CUSTOMER_INPUT"));
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
        return next(new AppError("A valid email is required.", 400, "INVALID_CUSTOMER_INPUT"));
    }
    if (!address || typeof address !== "string" || address.trim() === "") {
        return next(new AppError("address is required.", 400, "INVALID_CUSTOMER_INPUT"));
    }
    if (!phone || typeof phone !== "string" || phone.trim() === "") {
        return next(new AppError("phone is required.", 400, "INVALID_CUSTOMER_INPUT"));
    }

    next();
};

// Validates fields for updating a customer (at least one field required)
const validateUpdateCustomerBody = (req, res, next) => {
    const { name, email, address, phone } = req.body;

    if (!name && !email && !address && !phone) {
        return next(new AppError("At least one field (name, email, address, phone) is required to update.", 400, "INVALID_CUSTOMER_INPUT"));
    }
    if (email && !email.includes("@")) {
        return next(new AppError("A valid email is required.", 400, "INVALID_CUSTOMER_INPUT"));
    }

    next();
};

module.exports = {
    requireValidIdParam,
    validateCreateCustomerBody,
    validateUpdateCustomerBody,
};

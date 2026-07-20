const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const requireValidCustomerParam = (req, res, next) => {
  const { customer } = req.params;

  if (!isValidObjectId(customer)) {
    return next(new AppError("Invalid customer id.", 400, "INVALID_CUSTOMER_ID"));
  }

  next();
};

const validateCreateCartBody = (req, res, next) => {
  const { customer } = req.body;

  if (!isValidObjectId(customer)) {
    return next(new AppError("A valid customer id is required.", 400, "INVALID_CUSTOMER_ID"));
  }

  next();
};

const validateAddProductBody = (req, res, next) => {
  const { productId, quantity } = req.body;

  if (!isValidObjectId(productId)) {
    return next(new AppError("A valid product id is required.", 400, "INVALID_PRODUCT_ID"));
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return next(new AppError("Quantity must be a positive integer.", 400, "INVALID_QUANTITY"));
  }

  next();
};

const validateRemoveProductBody = (req, res, next) => {
  const { productId } = req.body;

  if (!isValidObjectId(productId)) {
    return next(new AppError("A valid product id is required.", 400, "INVALID_PRODUCT_ID"));
  }

  next();
};

const validateUpdateQuantityBody = (req, res, next) => {
  const { productId, quantity } = req.body;

  if (!isValidObjectId(productId)) {
    return next(new AppError("A valid product id is required.", 400, "INVALID_PRODUCT_ID"));
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return next(new AppError("Quantity must be a positive integer.", 400, "INVALID_QUANTITY"));
  }

  next();
};

module.exports = {
  requireValidCustomerParam,
  validateCreateCartBody,
  validateAddProductBody,
  validateRemoveProductBody,
  validateUpdateQuantityBody,
};
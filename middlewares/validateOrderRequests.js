const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const ALLOWED_STATUSES = ["pending", "shipped", "delivered", "cancelled"];

const requireValidCustomerParam = (req, res, next) => {
  const { customer } = req.params;

  if (!isValidObjectId(customer)) {
    return next(new AppError("Invalid customer id.", 400, "INVALID_CUSTOMER_ID"));
  }

  next();
};

const requireValidOrderIdParam = (req, res, next) => {
  const { orderId } = req.params;

  if (!isValidObjectId(orderId)) {
    return next(new AppError("Invalid order id.", 400, "INVALID_ORDER_ID"));
  }

  next();
};

const validateUpdateOrderBody = (req, res, next) => {
  const { status } = req.body;

  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return next(new AppError(`status must be one of: ${ALLOWED_STATUSES.join(", ")}.`, 400, "INVALID_ORDER_STATUS"));
  }

  next();
};

module.exports = {
  requireValidCustomerParam,
  requireValidOrderIdParam,
  validateUpdateOrderBody,
};

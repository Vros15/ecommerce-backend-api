const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// Only productId and quantity - price is never accepted from the client.
// checkoutController re-fetches each Product for its real price, so editing
// this request body can't change what actually gets charged.
const validateCheckoutBody = (req, res, next) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return next(new AppError("At least one item is required.", 400, "INVALID_CHECKOUT_ITEMS"));
  }

  for (const item of items) {
    if (!isValidObjectId(item?.productId)) {
      return next(new AppError("Each item needs a valid productId.", 400, "INVALID_PRODUCT_ID"));
    }

    if (!Number.isInteger(item?.quantity) || item.quantity <= 0) {
      return next(new AppError("Each item needs a positive integer quantity.", 400, "INVALID_QUANTITY"));
    }
  }

  next();
};

module.exports = { validateCheckoutBody };

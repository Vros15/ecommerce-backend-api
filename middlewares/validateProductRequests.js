const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const requireValidProductIdParam = (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return next(new AppError("Invalid product ID.", 400, "INVALID_PRODUCT_ID"));
  }

  next();
};

const validateCreateProductBody = (req, res, next) => {
  const { name, description, price, category, stock } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return next(new AppError("name is required.", 400, "INVALID_PRODUCT_INPUT"));
  }
  if (!description || typeof description !== "string" || description.trim() === "") {
    return next(new AppError("description is required.", 400, "INVALID_PRODUCT_INPUT"));
  }
  if (typeof price !== "number" || Number.isNaN(price) || price < 0) {
    return next(new AppError("price must be a number greater than or equal to 0.", 400, "INVALID_PRODUCT_INPUT"));
  }
  if (!category || typeof category !== "string" || category.trim() === "") {
    return next(new AppError("category is required.", 400, "INVALID_PRODUCT_INPUT"));
  }
  if (!Number.isInteger(stock) || stock < 0) {
    return next(new AppError("stock must be an integer greater than or equal to 0.", 400, "INVALID_PRODUCT_INPUT"));
  }

  next();
};

const validateUpdateProductBody = (req, res, next) => {
  const { name, description, price, category, stock, image } = req.body;

  if (name === undefined && description === undefined && price === undefined && category === undefined && stock === undefined && image === undefined) {
    return next(new AppError("At least one product field is required to update.", 400, "INVALID_PRODUCT_INPUT"));
  }
  if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
    return next(new AppError("name must be a non-empty string.", 400, "INVALID_PRODUCT_INPUT"));
  }
  if (description !== undefined && (typeof description !== "string" || description.trim() === "")) {
    return next(new AppError("description must be a non-empty string.", 400, "INVALID_PRODUCT_INPUT"));
  }
  if (price !== undefined && (typeof price !== "number" || Number.isNaN(price) || price < 0)) {
    return next(new AppError("price must be a number greater than or equal to 0.", 400, "INVALID_PRODUCT_INPUT"));
  }
  if (category !== undefined && (typeof category !== "string" || category.trim() === "")) {
    return next(new AppError("category must be a non-empty string.", 400, "INVALID_PRODUCT_INPUT"));
  }
  if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
    return next(new AppError("stock must be an integer greater than or equal to 0.", 400, "INVALID_PRODUCT_INPUT"));
  }
  if (image !== undefined && typeof image !== "string") {
    return next(new AppError("image must be a string.", 400, "INVALID_PRODUCT_INPUT"));
  }

  next();
};

module.exports = {
  requireValidProductIdParam,
  validateCreateProductBody,
  validateUpdateProductBody,
};
const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const { MAX_LIMIT } = require("../utils/pagination");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const ALLOWED_SORT_FIELDS = ["price", "name"];
const ALLOWED_SORT_ORDERS = ["asc", "desc"];
const ALLOWED_QUERY_PARAMS = ["category", "search", "minPrice", "maxPrice", "inStock", "sortBy", "sortOrder", "page", "limit"];

const validateProductQuery = (req, res, next) => {
  const { category, search, minPrice, maxPrice, inStock, sortBy, sortOrder, page, limit } = req.query;

  // Rejecting unknown parameters turns a typo into a clear error instead of a
  // 200 that quietly ignored the filter the caller thought they applied.
  const unknownParams = Object.keys(req.query).filter((key) => !ALLOWED_QUERY_PARAMS.includes(key));

  if (unknownParams.length > 0) {
    return next(
      new AppError(
        `Unknown query parameter(s): ${unknownParams.join(", ")}. Supported: ${ALLOWED_QUERY_PARAMS.join(", ")}.`,
        400,
        "INVALID_PRODUCT_QUERY"
      )
    );
  }

  // A repeated parameter such as ?category=a&category=b arrives as an array,
  // which would reach the query builder as an unexpected type.
  const singleValueParams = { category, search, minPrice, maxPrice, inStock, sortBy, sortOrder, page, limit };

  for (const [key, value] of Object.entries(singleValueParams)) {
    if (value !== undefined && typeof value !== "string") {
      return next(new AppError(`${key} may only be provided once.`, 400, "INVALID_PRODUCT_QUERY"));
    }
  }

  if (category !== undefined && category.trim() === "") {
    return next(new AppError("category must be a non-empty string.", 400, "INVALID_PRODUCT_QUERY"));
  }
  if (search !== undefined && search.trim() === "") {
    return next(new AppError("search must be a non-empty string.", 400, "INVALID_PRODUCT_QUERY"));
  }

  const parsedPrices = {};

  for (const key of ["minPrice", "maxPrice"]) {
    const raw = singleValueParams[key];

    if (raw === undefined) {
      continue;
    }

    // Number("") and Number(" ") both coerce to 0, which would silently become
    // a real filter rather than an obvious mistake.
    if (raw.trim() === "") {
      return next(new AppError(`${key} must be a number greater than or equal to 0.`, 400, "INVALID_PRODUCT_QUERY"));
    }

    const parsed = Number(raw);

    if (!Number.isFinite(parsed) || parsed < 0) {
      return next(new AppError(`${key} must be a number greater than or equal to 0.`, 400, "INVALID_PRODUCT_QUERY"));
    }

    parsedPrices[key] = parsed;
  }

  if (parsedPrices.minPrice !== undefined && parsedPrices.maxPrice !== undefined && parsedPrices.minPrice > parsedPrices.maxPrice) {
    return next(new AppError("minPrice must be less than or equal to maxPrice.", 400, "INVALID_PRODUCT_QUERY"));
  }

  if (inStock !== undefined && inStock !== "true" && inStock !== "false") {
    return next(new AppError('inStock must be "true" or "false".', 400, "INVALID_PRODUCT_QUERY"));
  }

  if (sortBy !== undefined && !ALLOWED_SORT_FIELDS.includes(sortBy)) {
    return next(new AppError(`sortBy must be one of: ${ALLOWED_SORT_FIELDS.join(", ")}.`, 400, "INVALID_PRODUCT_QUERY"));
  }

  if (sortOrder !== undefined && !ALLOWED_SORT_ORDERS.includes(sortOrder)) {
    return next(new AppError(`sortOrder must be one of: ${ALLOWED_SORT_ORDERS.join(", ")}.`, 400, "INVALID_PRODUCT_QUERY"));
  }

  for (const key of ["page", "limit"]) {
    const raw = singleValueParams[key];

    if (raw === undefined) {
      continue;
    }

    if (raw.trim() === "") {
      return next(new AppError(`${key} must be an integer greater than or equal to 1.`, 400, "INVALID_PRODUCT_QUERY"));
    }

    const parsed = Number(raw);

    if (!Number.isInteger(parsed) || parsed < 1) {
      return next(new AppError(`${key} must be an integer greater than or equal to 1.`, 400, "INVALID_PRODUCT_QUERY"));
    }

    if (key === "limit" && parsed > MAX_LIMIT) {
      return next(new AppError(`limit must not exceed ${MAX_LIMIT}.`, 400, "INVALID_PRODUCT_QUERY"));
    }
  }

  next();
};

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
  validateProductQuery,
  validateCreateProductBody,
  validateUpdateProductBody,
};
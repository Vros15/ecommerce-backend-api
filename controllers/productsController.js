const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const escapeRegex = require('../utils/escapeRegex');
const { DEFAULT_PAGE, DEFAULT_LIMIT } = require('../utils/pagination');

//POST create a new product
const createProduct = asyncHandler(async (req, res) => {
    //destructuring the product details from the request body
    const { name, description, price, category, stock, image } = req.body;
    //creating a new product
    const newProduct = await Product.create({ name, description, price, category, stock, image });
    res.status(201).json({ message: "Product created successfully", product: newProduct });
});

//GET all products, optionally filtered and sorted
//Query params are validated upstream by validateProductQuery
const getAllProducts = asyncHandler(async (req, res) => {
    const { category, search, minPrice, maxPrice, inStock, sortBy, sortOrder, page, limit } = req.query;

    const filter = {};

    //anchored and case insensitive so "electronics" matches "Electronics"
    if (category !== undefined) {
        filter.category = new RegExp(`^${escapeRegex(category.trim())}$`, "i");
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};

        if (minPrice !== undefined) {
            filter.price.$gte = Number(minPrice);
        }
        if (maxPrice !== undefined) {
            filter.price.$lte = Number(maxPrice);
        }
    }

    //"false" means out of stock only, not "ignore this filter"
    if (inStock !== undefined) {
        filter.stock = inStock === "true" ? { $gt: 0 } : 0;
    }

    if (search !== undefined) {
        const pattern = new RegExp(escapeRegex(search.trim()), "i");
        filter.$or = [{ name: pattern }, { description: pattern }];
    }

    const query = Product.find(filter);

    //sortOrder alone has no effect; it only qualifies an explicit sortBy field
    if (sortBy !== undefined) {
        query.sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 });

        //MongoDB compares strings by byte value by default, which sorts every
        //capital letter ahead of every lowercase one and puts "LED" before
        //"Laptop". Collation gives the case-insensitive order shoppers expect.
        query.collation({ locale: "en", strength: 2 });
    }

    const currentPage = page !== undefined ? Number(page) : DEFAULT_PAGE;
    const perPage = limit !== undefined ? Number(limit) : DEFAULT_LIMIT;

    query.skip((currentPage - 1) * perPage).limit(perPage);

    //the count reflects the filter rather than the page, so the client can tell
    //how many results exist beyond the slice it received
    const [products, total] = await Promise.all([
        query,
        Product.countDocuments(filter),
    ]);

    res.status(200).json({
        message: "Products retrieved successfully",
        products,
        meta: {
            total,
            page: currentPage,
            limit: perPage,
            totalPages: Math.ceil(total / perPage),
            hasNextPage: currentPage * perPage < total,
            hasPreviousPage: currentPage > 1,
        },
    });
});

//GET product by ID
const getProductById = asyncHandler(async (req, res) => {
    //destructuring the product id from the request parameters
    const { id } = req.params;
    //finding the product by its id in the database
    const product = await Product.findById(id);
    if (!product) {
        throw new AppError("Product not found.", 404, "PRODUCT_NOT_FOUND");
    }
    res.status(200).json({ message: "Product retrieved successfully", product });
});

//PUT update a product by ID
const updateProductById = asyncHandler(async (req, res) => { 
    //destructuring the product id
    const { id } = req.params;
    //destructuring the updated product details from the request body
    const { name, description, price, category, stock, image } = req.body;
    //finding the product by its id and updating it with the new details
    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { name, description, price, category, stock, image },
        { new: true }
    );
    if (!updatedProduct) {
        throw new AppError("Product not found.", 404, "PRODUCT_NOT_FOUND");
    }
    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
});

//DELETE a product by ID
const deleteProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
        throw new AppError("Product not found.", 404, "PRODUCT_NOT_FOUND");
    }
    res.status(200).json({ message: "Product deleted successfully", product: deletedProduct });
});

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProductById,
    deleteProductById
};
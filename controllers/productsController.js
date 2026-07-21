const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

//POST create a new product
const createProduct = asyncHandler(async (req, res) => {
    //destructuring the product details from the request body
    const { name, description, price, category, stock, image } = req.body;
    //creating a new product
    const newProduct = await Product.create({ name, description, price, category, stock, image });
    res.status(201).json({ message: "Product created successfully", product: newProduct });
});

//GET all products
const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find();
    res.status(200).json({ message: "Products retrieved successfully", products });
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
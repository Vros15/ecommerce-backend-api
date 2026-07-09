const Product = require('../models/Product');

//POST create a new product
const createProduct = async (req, res) => {
    try {
        //destructuring the product details from the request body
        const { name, description, price, category, stock, image } = req.body;
        //creating a new product
        const newProduct = await Product.create({ name, description, price, category, stock, image });
        res.status(201).json({ message: "Product created successfully", product: newProduct });
    }catch (error) {
        res.status(500).json({ message: "Error creating product", error });
    }
}

//GET all products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ message: "Products retrieved successfully", products });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving products", error });
    }
}

//GET product by ID
const getProductById = async (req, res) => {
    try {
        //destructuring the product id from the request parameters
        const { id } = req.params;
        //finding the product by its id in the database
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product retrieved successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving product", error });
    }
}

//PUT update a product by ID
const updateProductById = async (req, res) => { 
    try {
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
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error });
    }
}

//DELETE a product by ID
const deleteProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully", product: deletedProduct });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error });
    }
}

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProductById,
    deleteProductById
};
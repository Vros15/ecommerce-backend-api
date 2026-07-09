const Product = require('../models/Product');

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

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ message: "Products retrieved successfully", products });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving products", error });
    }
}

module.exports = {
    createProduct,
    getAllProducts,
};
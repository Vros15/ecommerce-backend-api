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

module.exports = {
    createProduct,
};
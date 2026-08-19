import * as productService from '../services/productService.js'

export const getProducts = async (req, res, next) => {
    try {
        const { search, category } = req.query;
        const products = await productService.getAllProducts(search, category);
        res.json(products);
    } catch (error) {
        next(error);
    }
};

export const getCategories = async (req, res, next) => {
    try {
        const categories = await productService.getCategories();
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

export const getProduct = async (req, res, next) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.json(product);
    } catch (error) {
        next(error)
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const { name, sku, category, price, quantity } = req.body;

        if (!name || !sku || !category) {
            return res.status(400).json({ error: "Name, SKU and category are required" });
        }

        if (price <= 0 || quantity < 0) {
            return res.status(400).json({ error: "price must be greater than 0 and quantity must be at least 0" });
        }

        const newId = await productService.createProduct(req.body);
        res.status(201).json({ id: newId, message: "Product created successfully" });
    } catch (error) {
        if (error.message.includes('SKU')) {
            return res.status(400).json({ error: error.message });
        }
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const { name, category, price, quantity } = req.body;

        if (!name || !category) {
            return res.status(400).json({ error: 'Name and Category are required.' });
        }
        if (price <= 0 || quantity < 0) {
            return res.status(400).json({ error: "Price must be greater than 0 and quantity must be atleast 0." });
        }

        const updated = await productService.updateProduct(req.params.id, req.body);
        if (!updated) return res.status(404).json({ error: "Product not found." });
        res.json({ message: "Product updated successfully." });
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const deleted = await productService.deleteProduct(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Product not found." });
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        next(error);
    }
};

export const stockIn = async (req, res, next) => {
    try {
        const { quantity, note } = req.body;
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ error: "Quantity must be greater than zero." });
        }

        const newQuantity = await productService.adjustStock(req.params.id, quantity, 'IN', note);
        res.json({ message: "Stock added successfully", newQuantity });
    } catch (error) {
        if (error.message === "Product not found") {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
}

export const stockOut = async (req, res, next) => {
    try {
        const { quantity, note } = req.body;
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ error: "Quantity must be greater than zero" });
        }
        const newQuantity = await productService.adjustStock(req.params.id, quantity, 'OUT', note);
        res.json({ message: "Stock removed successfully", newQuantity });
    } catch (error) {
        if (error.message === "Product not found") {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("exceeds available stock")) {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
};

export const getTransactions = async (req, res, next) => {
    try {
        const transactions = await productService.getTransactions(req.params.id);
        res.json(transactions);
    } catch (error) {
        next(error);
    }
};
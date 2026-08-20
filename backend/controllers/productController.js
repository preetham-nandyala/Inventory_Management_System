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
        const { name, sku, category, price, quantity, low_stock_threshold } = req.body;

        if (!name || !String(name).trim() || !sku || !String(sku).trim() || !category || !String(category).trim()) {
            return res.status(400).json({ error: "Name, SKU and Category are required and must not be empty." });
        }

        const parsedPrice = Number(price);
        const parsedQuantity = Number(quantity);

        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            return res.status(400).json({ error: "Price must be a positive number." });
        }

        if (isNaN(parsedQuantity) || parsedQuantity < 0 || !Number.isInteger(parsedQuantity)) {
            return res.status(400).json({ error: "Quantity must be a non-negative integer." });
        }

        if (low_stock_threshold !== undefined && low_stock_threshold !== null) {
            const parsedThreshold = Number(low_stock_threshold);
            if (isNaN(parsedThreshold) || parsedThreshold < 0 || !Number.isInteger(parsedThreshold)) {
                return res.status(400).json({ error: "Low stock threshold must be a non-negative integer." });
            }
        }

        const newId = await productService.createProduct(req.body);
        res.status(201).json({ id: newId, message: "Product created successfully" });
    } catch (error) {
        if (error.message.includes('SKU')) {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const { name, category, price, low_stock_threshold } = req.body;

        if (!name || !String(name).trim() || !category || !String(category).trim()) {
            return res.status(400).json({ error: 'Name and Category are required and must not be empty.' });
        }

        const parsedPrice = Number(price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            return res.status(400).json({ error: "Price must be a positive number." });
        }

        if (low_stock_threshold !== undefined && low_stock_threshold !== null) {
            const parsedThreshold = Number(low_stock_threshold);
            if (isNaN(parsedThreshold) || parsedThreshold < 0 || !Number.isInteger(parsedThreshold)) {
                return res.status(400).json({ error: "Low stock threshold must be a non-negative integer." });
            }
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
        const parsedQuantity = Number(quantity);

        if (isNaN(parsedQuantity) || parsedQuantity <= 0 || !Number.isInteger(parsedQuantity)) {
            return res.status(400).json({ error: "Quantity must be a positive integer." });
        }

        const newQuantity = await productService.adjustStock(req.params.id, parsedQuantity, 'IN', note);
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
        const parsedQuantity = Number(quantity);

        if (isNaN(parsedQuantity) || parsedQuantity <= 0 || !Number.isInteger(parsedQuantity)) {
            return res.status(400).json({ error: "Quantity must be a positive integer." });
        }

        const newQuantity = await productService.adjustStock(req.params.id, parsedQuantity, 'OUT', note);
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
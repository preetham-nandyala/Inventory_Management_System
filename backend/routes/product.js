import express from 'express';
import * as productController from '../controllers/productController.js';

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);

router.get('/:id', productController.getProduct);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

router.post('/:id/stock-in', productController.stockIn);
router.post('/:id/stock-out', productController.stockOut);
router.get('/:id/transactions', productController.getTransactions);

export default router;
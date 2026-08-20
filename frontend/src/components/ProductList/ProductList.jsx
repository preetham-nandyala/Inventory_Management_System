import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, ArrowDownCircle, ArrowUpCircle, X } from 'lucide-react';
import api from '../../api';
import ProductFormModal from '../ProductFormModal/ProductFormModal';
import StockModal from '../StockModel/StockModal';
import './ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);

    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [stockActionType, setStockActionType] = useState('IN'); // 'IN' or 'OUT'
    const [stockProduct, setStockProduct] = useState(null);

    const [productToDelete, setProductToDelete] = useState(null);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await api.get('/products/categories');
            setCategories(res.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const res = await api.get('/products', {
                params: { search, category }
            });
            setProducts(res.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }, [search, category]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]);

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
    };

    const confirmDelete = async () => {
        if (productToDelete) {
            try {
                await api.delete(`/products/${productToDelete.id}`);
                fetchProducts();
                fetchCategories();
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product.');
            }
            setProductToDelete(null);
        }
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setIsProductModalOpen(true);
    };

    const openStockModal = (product, type) => {
        setStockProduct(product);
        setStockActionType(type);
        setIsStockModalOpen(true);
    };

    const handleProductSuccess = () => {
        fetchProducts();
        fetchCategories();
    };

    return (
        <div className="product-list-container">
            <div className="toolbar">
                <div className="filters">
                    <div className="search-box">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <button className="primary" onClick={openAddModal}>
                    <Plus size={20} /> Add Product
                </button>
            </div>

            <div className="table-wrapper">
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>SKU</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="empty-state">No products found.</td>
                            </tr>
                        ) : (
                            products.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <Link to={`/product/${product.id}/transactions`} className="product-name-link">
                                            {product.name}
                                        </Link>
                                    </td>
                                    <td><span className="badge sku-badge">{product.sku}</span></td>
                                    <td>{product.category}</td>
                                    <td>${Number(product.price).toFixed(2)}</td>
                                    <td className={product.quantity < product.low_stock_threshold ? 'low-quantity' : ''}>
                                        {product.quantity}
                                    </td>
                                    <td>
                                        {product.quantity < product.low_stock_threshold ? (
                                            <span className="badge status-low">Low Stock</span>
                                        ) : (
                                            <span className="badge status-in">In Stock</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="icon-btn tooltip" data-tip="Stock In" onClick={() => openStockModal(product, 'IN')}>
                                                <ArrowDownCircle size={18} className="text-success" />
                                            </button>
                                            <button className="icon-btn tooltip" data-tip="Stock Out" onClick={() => openStockModal(product, 'OUT')}>
                                                <ArrowUpCircle size={18} className="text-danger" />
                                            </button>
                                            <button className="icon-btn tooltip" data-tip="Edit" onClick={() => openEditModal(product)}>
                                                <Edit2 size={18} className="text-primary" />
                                            </button>
                                            <button className="icon-btn tooltip" data-tip="Delete" onClick={() => handleDeleteClick(product)}>
                                                <Trash2 size={18} className="text-danger" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isProductModalOpen && (
                <ProductFormModal
                    isOpen={isProductModalOpen}
                    onClose={() => setIsProductModalOpen(false)}
                    product={editingProduct}
                    onSuccess={handleProductSuccess}
                />
            )}

            {isStockModalOpen && (
                <StockModal
                    isOpen={isStockModalOpen}
                    onClose={() => setIsStockModalOpen(false)}
                    product={stockProduct}
                    type={stockActionType}
                    onSuccess={handleProductSuccess}
                />
            )}

            {productToDelete && (
                <div className="modal-overlay" onClick={() => setProductToDelete(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>Confirm Delete</h2>
                            <button className="modal-close" onClick={() => setProductToDelete(null)}><X size={24} /></button>
                        </div>
                        <div style={{ padding: '20px 0' }}>
                            Are you sure you want to delete the product <strong>{productToDelete.name}</strong>? This action cannot be undone.
                        </div>
                        <div className="form-actions">
                            <button className="secondary" onClick={() => setProductToDelete(null)}>Cancel</button>
                            <button className="primary" style={{ backgroundColor: 'var(--danger-color)', color: 'white' }} onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;

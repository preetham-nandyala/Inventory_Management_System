import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../api';
import './ProductFormModal.css';

const ProductFormModal = ({ isOpen, onClose, product, onSuccess }) => {
    const isEdit = !!product;

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        price: '',
        quantity: '',
        low_stock_threshold: '10'
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [isNewCategory, setIsNewCategory] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchCategories = async () => {
                try {
                    const res = await api.get('/products/categories');
                    setCategories(res.data);
                } catch (err) {
                    console.error("Failed to fetch categories", err);
                }
            };
            fetchCategories();
        }
    }, [isOpen]);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                sku: product.sku,
                category: product.category,
                price: product.price,
                quantity: product.quantity,
                low_stock_threshold: product.low_stock_threshold
            });
            setIsNewCategory(false);
        } else {
            setFormData({
                name: '',
                sku: '',
                category: '',
                price: '',
                quantity: '',
                low_stock_threshold: '10'
            });
            setIsNewCategory(false);
        }
    }, [product, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validations
        if (!formData.name.trim() || !formData.sku.trim() || !formData.category.trim()) {
            return setError('Name, SKU, and Category are required.');
        }

        const parsedPrice = Number(formData.price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            return setError('Price must be a positive number.');
        }

        if (!isEdit) {
            const parsedQuantity = Number(formData.quantity);
            if (isNaN(parsedQuantity) || parsedQuantity < 0 || !Number.isInteger(parsedQuantity)) {
                return setError('Quantity must be a non-negative integer.');
            }
        }

        const parsedThreshold = Number(formData.low_stock_threshold);
        if (isNaN(parsedThreshold) || parsedThreshold < 0 || !Number.isInteger(parsedThreshold)) {
            return setError('Low stock threshold must be a non-negative integer.');
        }

        setIsSubmitting(true);
        try {
            if (isEdit) {
                // Only send fields that can be edited (not quantity or sku)
                await api.put(`/products/${product.id}`, {
                    name: formData.name,
                    category: formData.category,
                    price: parsedPrice,
                    low_stock_threshold: parsedThreshold
                });
            } else {
                await api.post('/products', {
                    ...formData,
                    price: parsedPrice,
                    quantity: Number(formData.quantity),
                    low_stock_threshold: parsedThreshold
                });
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred during submission.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
                    <button className="modal-close" onClick={onClose}><X size={24} /></button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-group">
                        <label>Product Name <span className="required">*</span></label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>SKU <span className="required">*</span></label>
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                required
                                readOnly={isEdit}
                                className={isEdit ? 'readonly-input' : ''}
                            />
                        </div>
                        <div className="form-group">
                            <label>Price ($) <span className="required">*</span></label>
                            <input type="number" step="0.01" min="0.01" name="price" value={formData.price} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Category <span className="required">*</span></label>
                        {isNewCategory ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter new category"
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => { setIsNewCategory(false); setFormData({ ...formData, category: '' }); }}
                                    className="secondary"
                                    style={{ padding: '0 12px' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <select
                                name="category"
                                value={formData.category}
                                onChange={(e) => {
                                    if (e.target.value === '__NEW__') {
                                        setIsNewCategory(true);
                                        setFormData({ ...formData, category: '' });
                                    } else {
                                        handleChange(e);
                                    }
                                }}
                                required
                            >
                                <option value="">Select Category...</option>
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                                <option value="__NEW__">+ Add New Category</option>
                            </select>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>{isEdit ? 'Current Quantity' : 'Initial Quantity'} <span className="required">*</span></label>
                            <input
                                type="number"
                                min="0"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                required={!isEdit}
                                readOnly={isEdit}
                                className={isEdit ? 'readonly-input' : ''}
                            />
                            {isEdit && (
                                <span className="field-hint">Use Stock In / Stock Out to change quantity</span>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Low Stock Threshold <span className="required">*</span></label>
                            <input type="number" min="0" name="low_stock_threshold" value={formData.low_stock_threshold} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;

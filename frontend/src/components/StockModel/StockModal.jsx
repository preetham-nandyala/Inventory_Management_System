import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../api';
import './StockModal.css';

const StockModal = ({ isOpen, onClose, product, type, onSuccess }) => {
    const isStockIn = type === 'IN';

    const [quantity, setQuantity] = useState('');
    const [note, setNote] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (Number(quantity) <= 0) {
            return setError('Quantity must be greater than zero.');
        }

        setIsSubmitting(true);
        try {
            const endpoint = isStockIn ? `/products/${product.id}/stock-in` : `/products/${product.id}/stock-out`;
            await api.post(endpoint, { quantity: Number(quantity), note });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred processing the stock.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !product) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content stock-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isStockIn ? 'Stock In' : 'Stock Out'} - {product.name}</h2>
                    <button className="modal-close" onClick={onClose}><X size={24} /></button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="stock-form">
                    <div className="stock-info">
                        <p>Current Available Stock: <strong>{product.quantity}</strong></p>
                    </div>

                    <div className="form-group">
                        <label>Quantity to {isStockIn ? 'Add' : 'Remove'} <span className="required">*</span></label>
                        <input
                            type="number"
                            min="1"
                            name="quantity"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Note (Optional)</label>
                        <textarea
                            name="note"
                            rows="3"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="E.g., new shipment arrived..."
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className={isStockIn ? 'success' : 'danger'} disabled={isSubmitting}>
                            {isSubmitting ? 'Processing...' : (isStockIn ? 'Add Stock' : 'Remove Stock')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockModal;

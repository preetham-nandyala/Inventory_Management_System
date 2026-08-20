import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../api';
import './TransactionHistory.css';

const TransactionHistory = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, transRes] = await Promise.all([
                    api.get(`/products/${id}`),
                    api.get(`/products/${id}/transactions`)
                ]);
                setProduct(productRes.data);
                setTransactions(transRes.data);
            } catch (err) {
                setError('Failed to load transaction history.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="loading-state">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!product) return <div className="error-message">Product not found.</div>;

    return (
        <div className="transaction-history-container">
            <div className="header-actions">
                <Link to="/" className="back-link">
                    <ArrowLeft size={20} /> Back to Products
                </Link>
            </div>

            <div className="product-summary">
                <h2>{product.name}</h2>
                <div className="summary-details">
                    <div className="detail-item">
                        <span className="label">SKU:</span>
                        <span className="value">{product.sku}</span>
                    </div>
                    <div className="detail-item">
                        <span className="label">Category:</span>
                        <span className="value">{product.category}</span>
                    </div>
                    <div className="detail-item">
                        <span className="label">Current Stock:</span>
                        <span className={`value ${product.quantity < product.low_stock_threshold ? 'low-stock-text' : ''}`}>
                            {product.quantity}
                        </span>
                    </div>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="transaction-table">
                    <thead>
                        <tr>
                            <th>Date & Time</th>
                            <th>Type</th>
                            <th>Quantity</th>
                            <th>Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="empty-state">No transactions found for this product.</td>
                            </tr>
                        ) : (
                            transactions.map(txn => (
                                <tr key={txn.id}>
                                    <td>{new Date(txn.timestamp).toLocaleString()}</td>
                                    <td>
                                        <span className={`type-badge ${txn.type === 'IN' ? 'type-in' : 'type-out'}`}>
                                            {txn.type}
                                        </span>
                                    </td>
                                    <td>{txn.quantity}</td>
                                    <td className="note-col">{txn.note || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionHistory;

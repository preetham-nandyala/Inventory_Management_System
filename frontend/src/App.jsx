import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductList from './components/ProductList/ProductList';
import TransactionHistory from './components/TransactionsHistory/TransactionHistory';

function App() {
  return (
    <Router>
      <div className="container">
        <h1>Inventory Management System</h1>
        {/* Components will be added here step by step */}
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:id/transactions" element={<TransactionHistory />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

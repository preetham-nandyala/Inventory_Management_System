CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(250) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    low_stock_threshold INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    type ENUM('IN','OUT') NOT NULL,
    quantity INT NOT NULL,
    note TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);


INSERT INTO products (name, sku, category, price, quantity, low_stock_threshold) VALUES
('Wireless Mouse', 'WM-001', 'Electronics', 25.99, 150, 20),
('Mechanical Keyboard', 'MK-002', 'Electronics', 89.50, 45, 10),
('USB-C Hub', 'UH-003', 'Accessories', 35.00, 200, 30),
('Ergonomic Office Chair', 'EC-004', 'Furniture', 199.99, 8, 10),
('Standing Desk', 'SD-005', 'Furniture', 450.00, 5, 5),
('Noise Cancelling Headphones', 'NH-006', 'Electronics', 150.00, 30, 15),
('Smartphone Stand', 'SS-007', 'Accessories', 12.99, 500, 50),
('1080p Webcam', 'WC-008', 'Electronics', 45.99, 85, 20),
('Desk Lamp', 'DL-009', 'Furniture', 22.50, 120, 25),
('Bluetooth Speaker', 'BS-010', 'Electronics', 55.00, 60, 15);

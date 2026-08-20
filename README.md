# Product Inventory Management System

A full stack product inventory management system built for a small store. The store manager can manage products, track stock levels, receive low stock alerts, and perform stock adjustments through a clean interface.

## Tech Stack
Backend: Node.js, Express.js
Frontend: React.js, Vite
Database: MySQL

## Prerequisites
Node.js v18 or higher
MySQL v8.0 or higher

## Project Structure
The project folder contains two main folders:
1. backend: Contains the Express API, controllers, services, database setup, and routing.
2. frontend: Contains the React application, UI components, and styles.
The database SQL script and Postman collection are in the root folder.

## Database Setup

Option 1: Automated Setup
Navigate to the backend directory.
Install dependencies by typing npm install.
Copy .env.example to .env and add your MySQL database credentials.
Run the setup script by typing npm run db:setup. This creates the database, tables, and inserts 10 sample products.

Option 2: Manual Setup
Open your MySQL client and run the database.sql file located in the root folder.

## How to Run the Project

Backend API Server:
Navigate to the backend directory.
Type npm install to install dependencies.
Type npm run dev to start the server on port 5000.

Frontend React App:
Navigate to the frontend directory.
Type npm install to install dependencies.
Type npm run dev to start the app on port 5173.

## API Endpoints

Product Operations:
POST /api/products : Create a new product
GET /api/products : Get all products (supports search and category filters)
GET /api/products/:id : Get a single product by ID
PUT /api/products/:id : Update product details
DELETE /api/products/:id : Delete a product
GET /api/products/categories : Get all unique categories

Stock Management:
POST /api/products/:id/stock-in : Add stock to a product
POST /api/products/:id/stock-out : Remove stock from a product
GET /api/products/:id/transactions : Get stock movement history

## Validation Rules
Name, SKU, Category are required fields and must not be empty.
SKU must be unique across all products and cannot be changed after creation.
Price must be a positive number.
Quantity must be a non negative integer. It is set at creation and modified only via Stock In or Stock Out.
Low Stock Threshold must be a non negative integer and defaults to 10.
Stock In and Stock Out Quantity must be a positive integer.
Stock Out is rejected if requested quantity exceeds current available stock.

## Assumptions
Quantity changes happen via Stock In or Out only.
SKU cannot be changed after creation.
Low Stock Threshold defaults to 10.
MySQL is required.
Cascade delete removes all transaction records when a product is deleted.
CORS is enabled for local development.

## Testing the API
A Postman collection named postman_collection.json is included in the root directory. Import it into Postman to test all API endpoints with pre configured requests.

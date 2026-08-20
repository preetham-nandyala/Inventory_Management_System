import pool from '../db.js';

export const getAllProducts = async(search, category)=>{
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if(search){
        query += ' AND (name LIKE ? or sku LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    if(category){
        query += ' AND category = ?';
        params.push(category);
    }

    query += ' ORDER BY id DESC';
    const [rows] = await pool.execute(query, params);
    return rows;
};

export const getCategories = async()=>{
    const [rows] = await pool.execute('SELECT DISTINCT category FROM products ORDER BY category ASC');
    return rows.map(row=>row.category);
};

export const getProductById = async(id)=>{
    const [rows] = await pool.execute('SELECT * FROM products where id = ?', [id]);
    if(rows.length === 0) return null;
    return rows[0];
};

export const createProduct = async(productData)=>{
    const {name, sku, category, price, quantity, low_stock_threshold} = productData;
    const threshold = low_stock_threshold || 10;

    const [existing] = await pool.execute('SELECT * FROM products WHERE sku = ?',[sku]);
    if(existing.length > 0){
        throw new Error("A product with this SKU is already exists.");
    }
    const [result] = await pool.execute(
        'INSERT INTO products (name, sku, category, price, quantity, low_stock_threshold, created_at, updated_at) VALUES (?,?,?,?,?,?, NOW(), NOW())',
        [name,sku,category,price,quantity,threshold]
    );

    return result.insertId;
};

export const updateProduct = async(id, productData)=>{
    const {name, category, price, quantity, low_stock_threshold} = productData;
    const [result] = await pool.execute("UPDATE products SET name = ?, category = ?, price = ?, quantity = ?, low_stock_threshold = ?, updated_at = NOW() WHERE id = ?",
        [name, category, price, quantity, low_stock_threshold,id]
    )
    return result.affectedRows > 0;
};

export const deleteProduct = async(id)=>{
    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

export const adjustStock = async(id, quantity, type, note)=>{
    const connection = await pool.getConnection();
    try{
        await connection.beginTransaction();
        const [product] = await connection.execute(
            'SELECT quantity FROM products WHERE id = ? FOR UPDATE',
            [id]
        )
        if(product.length === 0){
            throw new Error("Product not found");
        }
        const currentQuantity = product[0].quantity;
        let newQuantity;
        if(type === 'IN'){
            newQuantity = currentQuantity + quantity
        }else{
            if(currentQuantity < quantity){
                throw new Error('Requested quantity exceeds available stock.');
            }
            newQuantity = currentQuantity-quantity;
        }

        await connection.execute(
            'UPDATE products SET quantity = ? WHERE id = ?',
            [newQuantity,id]
        );

        await connection.execute(
            'INSERT INTO transactions (product_id, type, quantity, note, timestamp) VALUES (?,?,?,?, NOW())',
            [id, type,quantity,note || null]
        )
        await connection.commit();
        return newQuantity;
    }catch(error){
        await connection.rollback();
        throw error;
    }finally{
        connection.release();
    }
};

export const getTransactions = async(id)=>{
    const [rows] = await pool.execute(
        'SELECT * FROM transactions WHERE product_id = ? ORDER BY timestamp DESC',
        [id]
    );
    return rows;
};
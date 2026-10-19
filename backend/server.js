const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { getPool } = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const userRoutes = require('./routes/user.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
// Admin product images are sent as data URLs, so allow payloads larger than Express's 100 KB default.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Phục vụ giao diện Frontend tĩnh trực tiếp từ thư mục gốc
app.use(express.static(path.join(__dirname, '..')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running!', timestamp: new Date() });
});

// Khởi chạy server
app.listen(PORT, async () => {
    console.log(`===============================================`);
    console.log(`🚀 Backend đang chạy tại: http://localhost:${PORT}`);
    console.log(`🌐 API Health Check: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
    
    // Thử kết nối cơ sở dữ liệu khi khởi động
    try {
        await getPool();
    } catch (err) {
        console.warn(`⚠️ Chưa thể kết nối SQL Server lúc này (${err.message}).`);
        console.warn(`👉 Hãy đảm bảo bạn đã chạy script setup_database.sql trên SSMS và dịch vụ SQL Server đang bật!`);
    }
});

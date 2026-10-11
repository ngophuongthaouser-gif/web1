const sql = require('mssql');
require('dotenv').config();

async function testConnection(config, label) {
    console.log(`\n--- Đang kiểm tra cấu hình: ${label} ---`);
    console.log(`Server: ${config.server}, Instance: ${config.options?.instanceName || 'Mặc định (1433)'}, User: ${config.user}, DB: ${config.database}`);
    try {
        const pool = await new sql.ConnectionPool(config).connect();
        console.log(`✅ Kết nối thành công!`);
        
        // Kiểm tra xem database WebDienThoaiDB đã có bảng chưa
        const result = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
        const tables = result.recordset.map(r => r.TABLE_NAME);
        console.log(`📊 Các bảng tìm thấy trong database:`, tables.length > 0 ? tables.join(', ') : 'Chưa có bảng nào (hãy chạy file setup_database.sql trên SSMS)');
        
        await pool.close();
        return true;
    } catch (err) {
        console.log(`❌ Thất bại: ${err.message}`);
        return false;
    }
}

async function run() {
    // Thử cấu hình 1: Port 1433 (MSSQLSERVER)
    const config1 = {
        user: process.env.DB_USER || 'sa',
        password: process.env.DB_PASSWORD || '123123',
        server: 'localhost',
        database: process.env.DB_NAME || 'WebDienThoaiDB',
        port: 1433,
        options: { encrypt: false, trustServerCertificate: true }
    };
    const ok1 = await testConnection(config1, 'Cổng mặc định 1433 (MSSQLSERVER)');
    if (ok1) return;

    // Thử cấu hình 2: Named instance SQLEXPRESS
    const config2 = {
        user: process.env.DB_USER || 'sa',
        password: process.env.DB_PASSWORD || '123123',
        server: 'localhost',
        database: process.env.DB_NAME || 'WebDienThoaiDB',
        options: { instanceName: 'SQLEXPRESS', encrypt: false, trustServerCertificate: true }
    };
    await testConnection(config2, 'Named instance (localhost\\SQLEXPRESS)');
}

run();

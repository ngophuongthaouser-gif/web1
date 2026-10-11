const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123123',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'WebDienThoaiDB',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Nếu dùng Named Instance (như SQLEXPRESS) thì dùng instanceName, không gán cố định port
if (process.env.DB_INSTANCE) {
    config.options.instanceName = process.env.DB_INSTANCE;
} else if (process.env.DB_PORT) {
    config.port = parseInt(process.env.DB_PORT, 10);
}

let poolPromise = null;

async function getPool() {
    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool(config)
            .connect()
            .then(pool => {
                console.log('✅ [Database] Kết nối SQL Server thành công!');
                return pool;
            })
            .catch(err => {
                console.error('❌ [Database] Lỗi kết nối SQL Server:', err.message);
                poolPromise = null;
                throw err;
            });
    }
    return poolPromise;
}

module.exports = {
    sql,
    getPool
};

const { getPool } = require('./config/db');

async function run() {
    try {
        const pool = await getPool();
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Orders') AND name = N'DiaChi')
                ALTER TABLE Orders ADD DiaChi NVARCHAR(500) NULL;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Orders') AND name = N'SDT')
                ALTER TABLE Orders ADD SDT NVARCHAR(20) NULL;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Orders') AND name = N'HoTenNguoiNhan')
                ALTER TABLE Orders ADD HoTenNguoiNhan NVARCHAR(200) NULL;
        `);
        console.log('Migration successful: Columns added/verified in Orders.');

        // Update existing orders with realistic shipping info
        await pool.request().query(`
            UPDATE Orders 
            SET DiaChi = N'280 An Dương Vương, Phường 4, Quận 5, TP. Hồ Chí Minh',
                SDT = '0988123456',
                HoTenNguoiNhan = COALESCE(NULLIF(HoTenNguoiNhan, ''), Username)
            WHERE DiaChi IS NULL OR DiaChi = '';
        `);
        console.log('Updated existing orders with sample address/phone.');
        process.exit(0);
    } catch (e) {
        console.error('Migration error:', e.message);
        process.exit(1);
    }
}

run();

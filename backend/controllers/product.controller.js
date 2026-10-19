const { sql, getPool } = require('../config/db');

// Chuyển bản ghi DB thành định dạng tương thích với Frontend
function formatProduct(row) {
    return {
        masp: row.MaSP,
        name: row.Name,
        company: row.Company,
        img: row.Img,
        price: row.Price,
        star: row.Star,
        rateCount: row.RateCount,
        promo: {
            name: row.PromoName || '',
            value: row.PromoValue || ''
        },
        detail: {
            screen: row.Screen || '',
            os: row.OS || '',
            camara: row.Camara || '',
            camaraFront: row.CamaraFront || '',
            cpu: row.CPU || '',
            ram: row.RAM || '',
            rom: row.ROM || '',
            microUSB: row.MicroUSB || '',
            battery: row.Battery || ''
        }
    };
}

function validPrice(value) {
    const price = String(value || '').trim();
    return /^\d+(?:[.,]\d+)*$/.test(price) && Number(price.replace(/[.,]/g, '')) > 0;
}

// Lấy tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM Products ORDER BY MaSP ASC');
        const list = result.recordset.map(formatProduct);
        return res.json({ success: true, data: list });
    } catch (err) {
        console.error('Lỗi getAllProducts:', err);
        return res.status(500).json({ success: false, message: 'Lỗi lấy danh sách sản phẩm: ' + err.message });
    }
};

// Lấy 1 sản phẩm theo mã
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getPool();
        const result = await pool.request()
            .input('masp', sql.NVarChar, id)
            .query('SELECT * FROM Products WHERE MaSP = @masp');

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm!' });
        }

        return res.json({ success: true, data: formatProduct(result.recordset[0]) });
    } catch (err) {
        console.error('Lỗi getProductById:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
    }
};

// Thêm sản phẩm mới (Admin)
exports.createProduct = async (req, res) => {
    try {
        const p = req.body;
        if (!p.masp || !String(p.name || '').trim() || !validPrice(p.price)) {
            return res.status(400).json({ success: false, message: 'Mã, tên và giá sản phẩm là bắt buộc!' });
        }

        const pool = await getPool();

        // Kiểm tra trùng mã
        const check = await pool.request()
            .input('masp', sql.NVarChar, p.masp)
            .query('SELECT MaSP FROM Products WHERE MaSP = @masp');

        if (check.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'Mã sản phẩm đã tồn tại!' });
        }

        const detail = p.detail || {};
        const promo = p.promo || {};

        await pool.request()
            .input('masp', sql.NVarChar, p.masp)
            .input('name', sql.NVarChar, p.name)
            .input('company', sql.NVarChar, p.company || '')
            .input('img', sql.NVarChar(sql.MAX), p.img || '')
            .input('price', sql.NVarChar, p.price)
            .input('star', sql.Int, p.star || 0)
            .input('rateCount', sql.Int, p.rateCount || 0)
            .input('promoName', sql.NVarChar, promo.name || '')
            .input('promoValue', sql.NVarChar, promo.value || '')
            .input('screen', sql.NVarChar, detail.screen || '')
            .input('os', sql.NVarChar, detail.os || '')
            .input('camara', sql.NVarChar, detail.camara || '')
            .input('camaraFront', sql.NVarChar, detail.camaraFront || '')
            .input('cpu', sql.NVarChar, detail.cpu || '')
            .input('ram', sql.NVarChar, detail.ram || '')
            .input('rom', sql.NVarChar, detail.rom || '')
            .input('microUSB', sql.NVarChar, detail.microUSB || '')
            .input('battery', sql.NVarChar, detail.battery || '')
            .query(`INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
                    VALUES (@masp, @name, @company, @img, @price, @star, @rateCount, @promoName, @promoValue, @screen, @os, @camara, @camaraFront, @cpu, @ram, @rom, @microUSB, @battery)`);

        return res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công!' });
    } catch (err) {
        console.error('Lỗi createProduct:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
    }
};

// Cập nhật sản phẩm (Admin)
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const p = req.body;
        if (!String(p.name || '').trim() || !validPrice(p.price)) {
            return res.status(400).json({ success: false, message: 'Tên và giá sản phẩm là bắt buộc, giá phải là số!' });
        }
        const pool = await getPool();

        const detail = p.detail || {};
        const promo = p.promo || {};

        const exists = await pool.request()
            .input('masp', sql.NVarChar, id)
            .query('SELECT MaSP FROM Products WHERE MaSP = @masp');
        if (exists.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm!' });
        }

        await pool.request()
            .input('masp', sql.NVarChar, id)
            .input('name', sql.NVarChar, p.name)
            .input('company', sql.NVarChar, p.company || '')
            .input('img', sql.NVarChar(sql.MAX), p.img || '')
            .input('price', sql.NVarChar, p.price)
            .input('star', sql.Int, p.star || 0)
            .input('rateCount', sql.Int, p.rateCount || 0)
            .input('promoName', sql.NVarChar, promo.name || '')
            .input('promoValue', sql.NVarChar, promo.value || '')
            .input('screen', sql.NVarChar, detail.screen || '')
            .input('os', sql.NVarChar, detail.os || '')
            .input('camara', sql.NVarChar, detail.camara || '')
            .input('camaraFront', sql.NVarChar, detail.camaraFront || '')
            .input('cpu', sql.NVarChar, detail.cpu || '')
            .input('ram', sql.NVarChar, detail.ram || '')
            .input('rom', sql.NVarChar, detail.rom || '')
            .input('microUSB', sql.NVarChar, detail.microUSB || '')
            .input('battery', sql.NVarChar, detail.battery || '')
            .query(`UPDATE Products 
                    SET Name = @name, Company = @company, Img = @img, Price = @price,
                        Star = @star, RateCount = @rateCount, PromoName = @promoName, PromoValue = @promoValue,
                        Screen = @screen, OS = @os, Camara = @camara, CamaraFront = @camaraFront,
                        CPU = @cpu, RAM = @ram, ROM = @rom, MicroUSB = @microUSB, Battery = @battery
                    WHERE MaSP = @masp`);

        return res.json({ success: true, message: 'Cập nhật sản phẩm thành công!' });
    } catch (err) {
        console.error('Lỗi updateProduct:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
    }
};

// Xoá sản phẩm (Admin)
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getPool();

        const result = await pool.request()
            .input('masp', sql.NVarChar, id)
            .query(`DELETE FROM Products
                    WHERE MaSP = @masp
                      AND NOT EXISTS (SELECT 1 FROM OrderDetails WHERE MaSP = @masp)`);

        if (result.rowsAffected[0] === 0) {
            const exists = await pool.request()
                .input('masp', sql.NVarChar, id)
                .query('SELECT MaSP FROM Products WHERE MaSP = @masp');
            if (exists.recordset.length === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm!' });
            }
            return res.status(409).json({
                success: false,
                message: 'Sản phẩm đã có trong đơn hàng nên không thể xóa để bảo toàn lịch sử mua hàng.'
            });
        }

        return res.json({ success: true, message: 'Xoá sản phẩm thành công!' });
    } catch (err) {
        console.error('Lỗi deleteProduct:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
    }
};

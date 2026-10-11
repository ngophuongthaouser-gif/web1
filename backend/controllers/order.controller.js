const { sql, getPool } = require('../config/db');

// Lấy tất cả đơn hàng (cho Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const pool = await getPool();
        const ordersResult = await pool.request().query('SELECT * FROM Orders ORDER BY NgayMua DESC');
        const detailsResult = await pool.request().query(`
            SELECT od.Id, od.MaDon, od.MaSP, od.SoLuong, od.DonGia, p.Name, p.Img
            FROM OrderDetails od
            LEFT JOIN Products p ON od.MaSP = p.MaSP
        `);

        const detailsByOrder = {};
        for (const item of detailsResult.recordset) {
            if (!detailsByOrder[item.MaDon]) detailsByOrder[item.MaDon] = [];
            detailsByOrder[item.MaDon].push({
                ma: item.MaSP,
                name: item.Name,
                soluong: item.SoLuong,
                dongia: item.DonGia,
                img: item.Img
            });
        }

        const orders = ordersResult.recordset.map(o => ({
            ma: o.MaDon,
            khach: o.Username,
            ngaygio: o.NgayMua ? new Date(o.NgayMua).toLocaleString('vi-VN') : '',
            ngaymua: o.NgayMua,
            tongtien: o.TongTien,
            tinhTrang: o.TinhTrang,
            sp: detailsByOrder[o.MaDon] || []
        }));

        return res.json({ success: true, data: orders });
    } catch (err) {
        console.error('Lỗi getAllOrders:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
    }
};

// Lấy đơn hàng theo user
exports.getOrdersByUser = async (req, res) => {
    try {
        const { username } = req.params;
        const pool = await getPool();

        const ordersResult = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Orders WHERE Username = @username ORDER BY NgayMua DESC');

        const detailsResult = await pool.request().query(`
            SELECT od.Id, od.MaDon, od.MaSP, od.SoLuong, od.DonGia, p.Name, p.Img
            FROM OrderDetails od
            LEFT JOIN Products p ON od.MaSP = p.MaSP
        `);

        const detailsByOrder = {};
        for (const item of detailsResult.recordset) {
            if (!detailsByOrder[item.MaDon]) detailsByOrder[item.MaDon] = [];
            detailsByOrder[item.MaDon].push({
                ma: item.MaSP,
                name: item.Name,
                soluong: item.SoLuong,
                dongia: item.DonGia,
                img: item.Img
            });
        }

        const orders = ordersResult.recordset.map(o => ({
            ma: o.MaDon,
            khach: o.Username,
            ngaygio: o.NgayMua ? new Date(o.NgayMua).toLocaleString('vi-VN') : '',
            ngaymua: o.NgayMua,
            tongtien: o.TongTien,
            tinhTrang: o.TinhTrang,
            sp: detailsByOrder[o.MaDon] || []
        }));

        return res.json({ success: true, data: orders });
    } catch (err) {
        console.error('Lỗi getOrdersByUser:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
    }
};

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
    try {
        const { username, sp, tongtien } = req.body;
        if (!username || !sp || !Array.isArray(sp) || sp.length === 0) {
            return res.status(400).json({ success: false, message: 'Thông tin đơn hàng không hợp lệ!' });
        }

        const pool = await getPool();
        const maDon = 'DH_' + Date.now();

        // Thêm vào Orders
        await pool.request()
            .input('madon', sql.NVarChar, maDon)
            .input('username', sql.NVarChar, username)
            .input('tongtien', sql.NVarChar, tongtien || '0')
            .input('tinhtrang', sql.NVarChar, 'Đang chờ xử lý')
            .query(`INSERT INTO Orders (MaDon, Username, NgayMua, TongTien, TinhTrang) 
                    VALUES (@madon, @username, GETDATE(), @tongtien, @tinhtrang)`);

        // Thêm các OrderDetails
        for (const item of sp) {
            await pool.request()
                .input('madon', sql.NVarChar, maDon)
                .input('masp', sql.NVarChar, item.ma)
                .input('soluong', sql.Int, item.soluong || 1)
                .input('dongia', sql.NVarChar, item.dongia || '')
                .query(`INSERT INTO OrderDetails (MaDon, MaSP, SoLuong, DonGia) 
                        VALUES (@madon, @masp, @soluong, @dongia)`);
        }

        return res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công!',
            maDon: maDon
        });
    } catch (err) {
        console.error('Lỗi createOrder:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
    }
};

// Cập nhật trạng thái đơn hàng (Duyệt / Huỷ)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { tinhTrang } = req.body;

        if (!tinhTrang) {
            return res.status(400).json({ success: false, message: 'Trạng thái không được để trống!' });
        }

        const pool = await getPool();
        await pool.request()
            .input('madon', sql.NVarChar, id)
            .input('tinhtrang', sql.NVarChar, tinhTrang)
            .query('UPDATE Orders SET TinhTrang = @tinhtrang WHERE MaDon = @madon');

        return res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công!' });
    } catch (err) {
        console.error('Lỗi updateOrderStatus:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
    }
};

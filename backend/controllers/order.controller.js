const { sql, getPool } = require('../config/db');

// Lấy tất cả đơn hàng (cho Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const pool = await getPool();
        const ordersResult = await pool.request().query('SELECT * FROM Orders ORDER BY NgayMua DESC');
        const detailsResult = await pool.request().query(`
            SELECT od.Id, od.MaDon, od.MaSP, od.SoLuong, od.DonGia, p.Name, p.Company, p.Price, p.Img
            FROM OrderDetails od
            LEFT JOIN Products p ON od.MaSP = p.MaSP
        `);

        const detailsByOrder = {};
        for (const item of detailsResult.recordset) {
            if (!detailsByOrder[item.MaDon]) detailsByOrder[item.MaDon] = [];
            detailsByOrder[item.MaDon].push({
                ma: item.MaSP,
                name: item.Name,
                company: item.Company || '',
                soluong: item.SoLuong,
                dongia: item.DonGia || item.Price || '',
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
            SELECT od.Id, od.MaDon, od.MaSP, od.SoLuong, od.DonGia, p.Name, p.Company, p.Price, p.Img
            FROM OrderDetails od
            LEFT JOIN Products p ON od.MaSP = p.MaSP
        `);

        const detailsByOrder = {};
        for (const item of detailsResult.recordset) {
            if (!detailsByOrder[item.MaDon]) detailsByOrder[item.MaDon] = [];
            detailsByOrder[item.MaDon].push({
                ma: item.MaSP,
                name: item.Name,
                company: item.Company || '',
                soluong: item.SoLuong,
                dongia: item.DonGia || item.Price || '',
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
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            await new sql.Request(transaction)
                .input('madon', sql.NVarChar, maDon)
                .input('username', sql.NVarChar, username)
                .input('tongtien', sql.NVarChar, tongtien || '0')
                .input('tinhtrang', sql.NVarChar, 'Đang chờ xử lý')
                .query(`INSERT INTO Orders (MaDon, Username, NgayMua, TongTien, TinhTrang)
                        VALUES (@madon, @username, GETDATE(), @tongtien, @tinhtrang)`);

            for (const item of sp) {
                const quantity = Number(item.soluong) || 1;
                if (!item.ma || quantity < 1) throw new Error('Sản phẩm trong đơn hàng không hợp lệ.');
                await new sql.Request(transaction)
                    .input('madon', sql.NVarChar, maDon)
                    .input('masp', sql.NVarChar, item.ma)
                    .input('soluong', sql.Int, quantity)
                    .input('dongia', sql.NVarChar, item.dongia || '')
                    .query(`INSERT INTO OrderDetails (MaDon, MaSP, SoLuong, DonGia)
                            VALUES (@madon, @masp, @soluong, @dongia)`);
            }
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
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
        const { tinhTrang, username } = req.body;

        if (!['Đã giao hàng', 'Đã hủy'].includes(tinhTrang)) {
            return res.status(400).json({ success: false, message: 'Trạng thái đơn hàng không hợp lệ!' });
        }
        if (username && tinhTrang !== 'Đã hủy') {
            return res.status(403).json({ success: false, message: 'Khách hàng chỉ có thể hủy đơn của mình.' });
        }

        const pool = await getPool();
        const result = await pool.request()
            .input('madon', sql.NVarChar, id)
            .input('tinhtrang', sql.NVarChar, tinhTrang)
            .input('username', sql.NVarChar, username || null)
            .query(`UPDATE Orders SET TinhTrang = @tinhtrang
                    WHERE MaDon = @madon AND TinhTrang = N'Đang chờ xử lý'
                      AND (@username IS NULL OR Username = @username)`);

        if (result.rowsAffected[0] === 0) {
            const exists = await pool.request()
                .input('madon', sql.NVarChar, id)
                .input('username', sql.NVarChar, username || null)
                .query('SELECT TinhTrang FROM Orders WHERE MaDon = @madon AND (@username IS NULL OR Username = @username)');
            if (exists.recordset.length === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng phù hợp với tài khoản này!' });
            }
            return res.status(409).json({
                success: false,
                message: `Không thể cập nhật đơn hàng đang ở trạng thái "${exists.recordset[0].TinhTrang}".`
            });
        }

        return res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công!' });
    } catch (err) {
        console.error('Lỗi updateOrderStatus:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
    }
};

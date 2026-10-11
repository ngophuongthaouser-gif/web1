const { sql, getPool } = require('../config/db');

// Đăng nhập (hỗ trợ cả Admin và Khách hàng)
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu!' });
        }

        const pool = await getPool();

        // 1. Kiểm tra bảng Admin
        const adminResult = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password)
            .query('SELECT Username FROM Admins WHERE Username = @username AND Password = @password');

        if (adminResult.recordset.length > 0) {
            return res.json({
                success: true,
                role: 'admin',
                message: 'Đăng nhập Admin thành công!',
                user: {
                    username: adminResult.recordset[0].Username,
                    isAdmin: true
                }
            });
        }

        // 2. Kiểm tra bảng Users
        const userResult = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password)
            .query('SELECT Id, Username, Ho, Ten, Email, IsLocked FROM Users WHERE Username = @username AND Password = @password');

        if (userResult.recordset.length > 0) {
            const user = userResult.recordset[0];
            if (user.IsLocked) {
                return res.status(403).json({ success: false, message: 'Tài khoản này đang bị khoá. Không thể đăng nhập.' });
            }

            return res.json({
                success: true,
                role: 'user',
                message: 'Đăng nhập thành công!',
                user: {
                    id: user.Id,
                    username: user.Username,
                    ho: user.Ho,
                    ten: user.Ten,
                    email: user.Email,
                    isAdmin: false
                }
            });
        }

        return res.status(401).json({ success: false, message: 'Nhập sai tên hoặc mật khẩu!' });
    } catch (err) {
        console.error('Lỗi login:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
    }
};

// Đăng ký khách hàng mới
exports.register = async (req, res) => {
    try {
        const { username, password, ho, ten, email } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Tên đăng nhập và mật khẩu là bắt buộc!' });
        }

        const pool = await getPool();

        // Kiểm tra xem trùng Admin không
        const adminCheck = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT Username FROM Admins WHERE Username = @username');

        if (adminCheck.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'Tên đăng nhập đã có người sử dụng!' });
        }

        // Kiểm tra xem trùng User khác không
        const userCheck = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT Username FROM Users WHERE Username = @username');

        if (userCheck.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'Tên đăng nhập đã có người sử dụng!' });
        }

        // Tạo user mới
        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password)
            .input('ho', sql.NVarChar, ho || '')
            .input('ten', sql.NVarChar, ten || '')
            .input('email', sql.NVarChar, email || '')
            .query(`INSERT INTO Users (Username, Password, Ho, Ten, Email, IsLocked) 
                    VALUES (@username, @password, @ho, @ten, @email, 0)`);

        return res.status(201).json({
            success: true,
            message: 'Đăng ký tài khoản thành công!'
        });
    } catch (err) {
        console.error('Lỗi register:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
    }
};

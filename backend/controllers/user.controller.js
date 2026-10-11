const { sql, getPool } = require('../config/db');

// Lấy danh sách người dùng (dành cho Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT Id, Username, Password, Ho, Ten, Email, IsLocked, CreatedAt FROM Users ORDER BY Id DESC');
        
        // Định dạng trả về giống Frontend: username, pass, ho, ten, email, off (IsLocked)
        const users = result.recordset.map(u => ({
            id: u.Id,
            username: u.Username,
            pass: u.Password,
            ho: u.Ho || '',
            ten: u.Ten || '',
            email: u.Email || '',
            off: !!u.IsLocked,
            createdAt: u.CreatedAt
        }));

        return res.json({ success: true, data: users });
    } catch (err) {
        console.error('Lỗi getAllUsers:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
    }
};

// Khoá hoặc Mở khoá tài khoản người dùng
exports.toggleLockUser = async (req, res) => {
    try {
        const { username } = req.params;
        const pool = await getPool();

        // Lấy trạng thái hiện tại
        const userCheck = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT IsLocked FROM Users WHERE Username = @username');

        if (userCheck.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
        }

        const currentLocked = userCheck.recordset[0].IsLocked;
        const newStatus = currentLocked ? 0 : 1;

        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('isLocked', sql.Bit, newStatus)
            .query('UPDATE Users SET IsLocked = @isLocked WHERE Username = @username');

        return res.json({ 
            success: true, 
            message: newStatus ? 'Đã khoá tài khoản thành công!' : 'Đã mở khoá tài khoản!',
            isLocked: !!newStatus
        });
    } catch (err) {
        console.error('Lỗi toggleLockUser:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
    }
};

// Thêm người dùng mới bởi Admin
exports.createUser = async (req, res) => {
    try {
        const { username, pass, ho, ten, email } = req.body;
        if (!username || !pass) {
            return res.status(400).json({ success: false, message: 'Tên đăng nhập và mật khẩu là bắt buộc!' });
        }

        const pool = await getPool();

        // Kiểm tra tồn tại
        const check = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT Username FROM Users WHERE Username = @username');

        if (check.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'Tên người dùng đã tồn tại!' });
        }

        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, pass)
            .input('ho', sql.NVarChar, ho || '')
            .input('ten', sql.NVarChar, ten || '')
            .input('email', sql.NVarChar, email || '')
            .query(`INSERT INTO Users (Username, Password, Ho, Ten, Email, IsLocked) 
                    VALUES (@username, @password, @ho, @ten, @email, 0)`);

        return res.status(201).json({ success: true, message: 'Thêm người dùng thành công!' });
    } catch (err) {
        console.error('Lỗi createUser:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
    }
};

// Xoá người dùng
exports.deleteUser = async (req, res) => {
    try {
        const { username } = req.params;
        const pool = await getPool();

        await pool.request()
            .input('username', sql.NVarChar, username)
            .query('DELETE FROM Users WHERE Username = @username');

        return res.json({ success: true, message: 'Xoá người dùng thành công!' });
    } catch (err) {
        console.error('Lỗi deleteUser:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
    }
};

// Script tự động kiểm tra toàn bộ API Backend
const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        });
        const data = await res.json().catch(() => ({}));
        return { status: res.status, ok: res.ok, data };
    } catch (err) {
        return { ok: false, error: err.message };
    }
}

async function runTests() {
    console.log(`=======================================================`);
    console.log(`🧪 BẮT ĐẦU KIỂM TRA TOÀN BỘ API BACKEND`);
    console.log(`Target: ${BASE_URL}`);
    console.log(`=======================================================\n`);

    let passed = 0;
    let failed = 0;

    function assert(name, condition, details = '') {
        if (condition) {
            console.log(`  ✅ [PASS] ${name}`);
            passed++;
        } else {
            console.log(`  ❌ [FAIL] ${name} ${details ? '(' + details + ')' : ''}`);
            failed++;
        }
    }

    // 1. Health check
    console.log(`1️⃣  Kiểm tra trạng thái Server (Health Check)`);
    const health = await request('/health');
    assert('Server đang phản hồi', health.ok && health.data.status === 'ok', JSON.stringify(health));

    // 2. Đăng nhập Admin
    console.log(`\n2️⃣  Kiểm tra Đăng nhập Admin (admin / adadad)`);
    const loginAdmin = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'adadad' })
    });
    assert('Đăng nhập Admin thành công', loginAdmin.ok && loginAdmin.data.role === 'admin');

    // 3. Đăng nhập sai mật khẩu
    console.log(`\n3️⃣  Kiểm tra Đăng nhập sai mật khẩu (bảo mật)`);
    const loginWrong = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'wrongpassword' })
    });
    assert('Từ chối khi sai mật khẩu (HTTP 401)', loginWrong.status === 401);

    // 4. Lấy danh sách sản phẩm từ SQL Server
    console.log(`\n4️⃣  Lấy danh sách Sản phẩm từ Database (GET /api/products)`);
    const products = await request('/products');
    assert('Lấy danh sách sản phẩm thành công', products.ok && Array.isArray(products.data.data));
    const count = products.data.data ? products.data.data.length : 0;
    console.log(`      -> Tổng số sản phẩm trong Database: ${count}`);

    // 5. Đăng ký khách hàng mới
    const testUsername = 'testuser_' + Date.now().toString().slice(-4);
    console.log(`\n5️⃣  Đăng ký tài khoản mới (${testUsername})`);
    const register = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            username: testUsername,
            password: 'password123',
            ho: 'Nguyễn',
            ten: 'Kiểm Thử',
            email: `${testUsername}@gmail.com`
        })
    });
    assert('Đăng ký khách hàng thành công (HTTP 201)', register.status === 201);

    // 6. Đăng nhập với tài khoản vừa tạo
    console.log(`\n6️⃣  Đăng nhập với tài khoản vừa tạo`);
    const loginUser = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: testUsername, password: 'password123' })
    });
    assert('Đăng nhập khách hàng thành công (role: user)', loginUser.ok && loginUser.data.role === 'user');

    // 7. Thêm sản phẩm mới (Admin)
    const testMaSP = 'TEST_' + Date.now().toString().slice(-4);
    console.log(`\n7️⃣  Thêm sản phẩm mới vào Database (Mã: ${testMaSP})`);
    const createProduct = await request('/products', {
        method: 'POST',
        body: JSON.stringify({
            masp: testMaSP,
            name: 'Điện thoại Test API Pro',
            company: 'Apple',
            img: 'img/products/iphone-x-256gb-silver-400x400.jpg',
            price: '20.000.000',
            star: 5,
            rateCount: 10,
            promo: { name: 'giamgia', value: '1.000.000' },
            detail: { screen: 'OLED 6.7 inch', ram: '8 GB', rom: '256 GB', battery: '4500 mAh' }
        })
    });
    assert('Thêm sản phẩm thành công (HTTP 201)', createProduct.status === 201);

    // 8. Cập nhật sản phẩm
    console.log(`\n8️⃣  Cập nhật giá sản phẩm`);
    const updateProduct = await request(`/products/${testMaSP}`, {
        method: 'PUT',
        body: JSON.stringify({
            name: 'Điện thoại Test API Pro (Đã giảm giá)',
            company: 'Apple',
            price: '18.000.000'
        })
    });
    assert('Cập nhật sản phẩm thành công', updateProduct.ok);

    // 9. Tạo đơn hàng mới
    console.log(`\n9️⃣  Tạo đơn hàng mới cho khách hàng`);
    const createOrder = await request('/orders', {
        method: 'POST',
        body: JSON.stringify({
            username: testUsername,
            tongtien: '18.000.000',
            sp: [{ ma: testMaSP, soluong: 1, dongia: '18.000.000' }]
        })
    });
    assert('Tạo đơn hàng thành công (HTTP 201)', createOrder.status === 201);
    const maDon = createOrder.data?.maDon;

    // 10. Duyệt đơn hàng (Admin)
    if (maDon) {
        console.log(`\n🔟 Duyệt đơn hàng (${maDon})`);
        const updateOrderStatus = await request(`/orders/${maDon}/status`, {
            method: 'PUT',
            body: JSON.stringify({ tinhTrang: 'Đã giao hàng' })
        });
        assert('Cập nhật trạng thái đơn hàng thành công', updateOrderStatus.ok);
    }

    // 11. Khoá tài khoản người dùng
    console.log(`\n1️⃣1️⃣  Khoá tài khoản người dùng (${testUsername})`);
    const lockUser = await request(`/users/${testUsername}/toggle-lock`, { method: 'PUT' });
    assert('Khoá tài khoản thành công', lockUser.ok);

    // 12. Dọn dẹp dữ liệu test (Xoá sản phẩm và user test)
    console.log(`\n1️⃣2️⃣  Dọn dẹp dữ liệu test`);
    const delProduct = await request(`/products/${testMaSP}`, { method: 'DELETE' });
    const delUser = await request(`/users/${testUsername}`, { method: 'DELETE' });
    assert('Xoá sản phẩm test thành công', delProduct.ok);
    assert('Xoá người dùng test thành công', delUser.ok);

    // Tổng kết
    console.log(`\n=======================================================`);
    console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passed} PASS, ${failed} FAIL`);
    if (failed === 0) {
        console.log(`🎉 TẤT CẢ API ĐÃ HOẠT ĐỘNG HOÀN HẢO VỚI SQL SERVER!`);
    } else {
        console.log(`⚠️ Có một số bài kiểm tra chưa đạt.`);
    }
    console.log(`=======================================================`);
}

runTests();

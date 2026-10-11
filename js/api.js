// ========================================================
// API Client kết nối Frontend với Backend Node.js
// ========================================================

const API_BASE_URL = window.location.origin.includes(':5000') 
    ? `${window.location.origin}/api` 
    : 'http://localhost:5000/api';

const API = {
    // 1. Kiểm tra trạng thái Backend
    async checkHealth() {
        try {
            const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
            return res.ok;
        } catch (e) {
            return false;
        }
    },

    // 2. Auth: Đăng nhập (hỗ trợ cả Admin & Khách)
    async login(username, password) {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            return await res.json();
        } catch (e) {
            console.warn('Backend chưa bật, dùng LocalStorage:', e.message);
            return null;
        }
    },

    // 3. Auth: Đăng ký
    async register(data) {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (e) {
            return null;
        }
    },

    // 4. Products: Lấy danh sách sản phẩm từ SQL Server
    async getProducts() {
        try {
            const res = await fetch(`${API_BASE_URL}/products`);
            const data = await res.json();
            return data.success ? data.data : null;
        } catch (e) {
            return null;
        }
    },

    // 5. Products: Thêm sản phẩm
    async createProduct(product) {
        try {
            const res = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            return await res.json();
        } catch (e) {
            return null;
        }
    },

    // 6. Products: Sửa sản phẩm
    async updateProduct(id, product) {
        try {
            const res = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            return await res.json();
        } catch (e) {
            return null;
        }
    },

    // 7. Products: Xoá sản phẩm
    async deleteProduct(id) {
        try {
            const res = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE'
            });
            return await res.json();
        } catch (e) {
            return null;
        }
    },

    // 8. Users: Lấy danh sách khách hàng (cho Admin)
    async getUsers() {
        try {
            const res = await fetch(`${API_BASE_URL}/users`);
            const data = await res.json();
            return data.success ? data.data : null;
        } catch (e) {
            return null;
        }
    },

    // 9. Users: Khoá / Mở khoá
    async toggleLockUser(username) {
        try {
            const res = await fetch(`${API_BASE_URL}/users/${username}/toggle-lock`, {
                method: 'PUT'
            });
            return await res.json();
        } catch (e) {
            return null;
        }
    },

    // 10. Users: Xoá người dùng
    async deleteUser(username) {
        try {
            const res = await fetch(`${API_BASE_URL}/users/${username}`, {
                method: 'DELETE'
            });
            return await res.json();
        } catch (e) {
            return null;
        }
    },

    // 11. Orders: Lấy danh sách đơn hàng (cho Admin)
    async getOrders() {
        try {
            const res = await fetch(`${API_BASE_URL}/orders`);
            const data = await res.json();
            return data.success ? data.data : null;
        } catch (e) {
            return null;
        }
    },

    // 12. Orders: Lấy đơn hàng theo user
    async getOrdersByUser(username) {
        try {
            const res = await fetch(`${API_BASE_URL}/orders/user/${username}`);
            const data = await res.json();
            return data.success ? data.data : null;
        } catch (e) {
            return null;
        }
    },

    // 13. Orders: Tạo đơn hàng
    async createOrder(orderData) {
        try {
            const res = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            return await res.json();
        } catch (e) {
            return null;
        }
    },

    // 14. Orders: Cập nhật trạng thái đơn (Duyệt / Huỷ)
    async updateOrderStatus(id, tinhTrang) {
        try {
            const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tinhTrang })
            });
            return await res.json();
        } catch (e) {
            return null;
        }
    }
};

window.API = API;

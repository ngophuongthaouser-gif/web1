var TONGTIEN = 0;
var adminOrders = [];
var adminOrdersLoaded = false;
var adminUsers = [];
var adminUsersLoaded = false;
var adminCharts = {};

function cacheAdminProducts() {
    try {
        setListProducts(list_products);
    } catch (e) {
        console.warn('Không thể lưu bản sao sản phẩm vào localStorage:', e);
    }
}

window.onload = async function () {
    // Lấy data từ localstorage
    list_products = getListProducts() || list_products;
    adminInfo = getListAdmin() || adminInfo;

    // Đồng bộ từ Backend API nếu có
    if (window.API) {
        try {
            var [apiProducts, apiUsers, apiOrders] = await Promise.all([
                API.getProducts(),
                API.getUsers(),
                API.getOrders()
            ]);
            if (Array.isArray(apiProducts)) {
                list_products = apiProducts;
                cacheAdminProducts();
            }
            if (Array.isArray(apiUsers)) {
                adminUsers = apiUsers;
                adminUsersLoaded = true;
            }
            if (Array.isArray(apiOrders)) {
                adminOrders = apiOrders;
                adminOrdersLoaded = true;
            }
        } catch (e) {
            console.warn('Backend chưa sẵn sàng:', e);
        }
    }

    addEventChangeTab();

    if (window.localStorage.getItem('admin')) {
        addStatCards();
        addTableProducts();
        addTableDonHang();
        addTableKhachHang();
        addThongKe();

        openTab('Trang Chủ');
    } else {
        document.body.innerHTML = `<h1 style="color:red; width:100%; text-align:center; margin: 50px;"> Truy cập bị từ chối.. </h1>`;
    }
};

function logOutAdmin() {
    window.localStorage.removeItem('admin');
}

function getListRandomColor(length) {
    let result = [];
    for (let i = length; i--;) {
        result.push(getRandomColor());
    }
    return result;
}

function addChart(id, chartOption) {
    if (adminCharts[id]) adminCharts[id].destroy();
    var canvas = document.getElementById(id);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    adminCharts[id] = new Chart(ctx, chartOption);
}

function createChartConfig(
    title = 'Title',
    charType = 'bar', 
    labels = ['nothing'], 
    data = [2], 
    colors = ['#6366f1']
) {
    return {
        type: charType,
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                fontColor: '#0f172a',
                fontSize: 15,
                fontFamily: 'Inter',
                fontStyle: '600',
                display: true,
                text: title
            },
            legend: {
                display: charType === 'doughnut' || charType === 'pie',
                position: 'bottom',
                labels: {
                    fontColor: '#64748b',
                    fontFamily: 'Inter',
                    boxWidth: 12
                }
            },
            scales: charType === 'bar' || charType === 'line' ? {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontColor: '#64748b',
                        fontFamily: 'Inter'
                    },
                    gridLines: {
                        color: '#f1f5f9'
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontColor: '#64748b',
                        fontFamily: 'Inter'
                    },
                    gridLines: {
                        display: false
                    }
                }]
            } : {}
        }
    };
}

// ========== STAT CARDS (4 thẻ chỉ số KPI) ==========
function addStatCards() {
    var container = document.getElementById('statCards');
    if (!container) return;

    var listDH = getListDonHang();
    var totalOrders = listDH.length;
    var pending = listDH.filter(function(d) { return d.tinhTrang && d.tinhTrang.includes('chờ'); }).length;
    var done = listDH.filter(function(d) { return d.tinhTrang && d.tinhTrang.includes('Đã giao'); }).length;
    var totalRevenue = 0;
    listDH.forEach(function(d) {
        if (d.tinhTrang && !d.tinhTrang.includes('hủy') && !d.tinhTrang.includes('Hủy')) {
            totalRevenue += stringToNum(d.tongtien);
        }
    });

    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon" style="background:#eef2ff;color:#6366f1"><i class="fa fa-shopping-bag"></i></div>
            <div class="stat-info">
                <h3>${totalOrders}</h3>
                <p>Tổng đơn hàng</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background:#fef3c7;color:#f59e0b"><i class="fa fa-clock-o"></i></div>
            <div class="stat-info">
                <h3>${pending}</h3>
                <p>Chờ xử lý</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background:#d1fae5;color:#10b981"><i class="fa fa-check-circle"></i></div>
            <div class="stat-info">
                <h3>${done}</h3>
                <p>Giao thành công</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background:#ecfeff;color:#06b6d4"><i class="fa fa-money"></i></div>
            <div class="stat-info">
                <h3>${numToString(totalRevenue)} ₫</h3>
                <p>Tổng doanh thu</p>
            </div>
        </div>
    `;
}

// ========== THỐNG KÊ (4 BIỂU ĐỒ) ==========
function addThongKe() {
    var danhSachDonHang = getListDonHang(true);

    var thongKeHang = {};
    var thongKeTrangThai = {
        'Chờ xử lý': 0,
        'Đang giao': 0,
        'Đã giao': 0,
        'Đã hủy': 0
    };

    danhSachDonHang.forEach(donHang => {
        var tt = donHang.tinhTrang || '';
        if (tt.includes('chờ')) thongKeTrangThai['Chờ xử lý']++;
        else if (tt.includes('Đang giao')) thongKeTrangThai['Đang giao']++;
        else if (tt.includes('Đã giao')) thongKeTrangThai['Đã giao']++;
        else if (tt.includes('hủy') || tt.includes('Hủy')) thongKeTrangThai['Đã hủy']++;

        if (tt === 'Đã hủy') return;

        (donHang.sp || []).forEach(item => {
            var prod = item.sanPham || {};
            var tenHang = prod.company || item.company || 'Khác';
            var soLuong = item.soLuong || item.soluong || 1;
            var donGia = stringToNum(item.dongia || prod.price || '0');
            var thanhTien = soLuong * donGia;

            if (!thongKeHang[tenHang]) {
                thongKeHang[tenHang] = { soLuongBanRa: 0, doanhThu: 0 };
            }
            thongKeHang[tenHang].soLuongBanRa += soLuong;
            thongKeHang[tenHang].doanhThu += thanhTien;
        });
    });

    var palette = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

    // Biểu đồ 1: Số lượng bán ra
    addChart('myChart1', createChartConfig(
        'Số lượng bán ra theo hãng',
        'bar',
        Object.keys(thongKeHang),
        Object.values(thongKeHang).map(x => x.soLuongBanRa),
        palette.slice(0, Object.keys(thongKeHang).length)
    ));

    // Biểu đồ 2: Doanh thu theo hãng
    addChart('myChart2', createChartConfig(
        'Doanh thu theo hãng (VNĐ)',
        'doughnut',
        Object.keys(thongKeHang),
        Object.values(thongKeHang).map(x => x.doanhThu),
        palette.slice(0, Object.keys(thongKeHang).length)
    ));

    // Biểu đồ 3: Phân bố trạng thái đơn hàng
    addChart('myChart3', createChartConfig(
        'Trạng thái đơn hàng',
        'doughnut',
        Object.keys(thongKeTrangThai),
        Object.values(thongKeTrangThai),
        ['#f59e0b', '#3b82f6', '#10b981', '#ef4444']
    ));

    // Biểu đồ 4: Số lượng sản phẩm trong kho theo thương hiệu
    var brandStock = {};
    list_products.forEach(p => {
        var c = p.company || 'Khác';
        brandStock[c] = (brandStock[c] || 0) + 1;
    });
    addChart('myChart4', createChartConfig(
        'Kho sản phẩm theo hãng',
        'bar',
        Object.keys(brandStock),
        Object.values(brandStock),
        '#6366f1'
    ));
}

// ======================= CÁC TAB =========================
function addEventChangeTab() {
    var sidebar = document.getElementsByClassName('sidebar')[0];
    if (!sidebar) return;
    var list_a = sidebar.getElementsByTagName('a');
    for (var a of list_a) {
        if (!a.onclick) {
            a.addEventListener('click', function () {
                turnOff_Active();
                this.classList.add('active');
                var tab = this.innerText.trim();
                openTab(tab);
            });
        }
    }
}

function turnOff_Active() {
    var sidebar = document.getElementsByClassName('sidebar')[0];
    if (!sidebar) return;
    var list_a = sidebar.getElementsByTagName('a');
    for (var a of list_a) {
        a.classList.remove('active');
    }
}

function openTab(nameTab) {
    var main = document.getElementsByClassName('main')[0].children;
    for (var e of main) {
        e.style.display = 'none';
    }

    switch (nameTab) {
        case 'Trang Chủ':
            document.getElementsByClassName('home')[0].style.display = 'block';
            addStatCards();
            addThongKe();
            break;
        case 'Sản Phẩm':
            document.getElementsByClassName('sanpham')[0].style.display = 'block';
            addTableProducts();
            break;
        case 'Đơn Hàng':
            document.getElementsByClassName('donhang')[0].style.display = 'block';
            addTableDonHang();
            break;
        case 'Khách Hàng':
            document.getElementsByClassName('khachhang')[0].style.display = 'block';
            addTableKhachHang();
            break;
    }
}

// ========================== SẢN PHẨM ========================
function addTableProducts() {
    var tc = document.getElementsByClassName('sanpham')[0].getElementsByClassName('table-content')[0];
    var s = `<table class="table-outline hideImg">`;

    for (var i = 0; i < list_products.length; i++) {
        var p = list_products[i];
        var promoText = promoToStringValue(p.promo);
        var promoBadge = promoText ? `<span class="badge badge-pending">` + promoText + `</span>` : '<span style="color:#94a3b8">-</span>';

        s += `<tr>
            <td style="width: 5%"><strong>` + (i + 1) + `</strong></td>
            <td style="width: 10%"><code style="font-weight:600;color:var(--accent)">` + p.masp + `</code></td>
            <td style="width: 38%">
                <a title="Xem chi tiết" target="_blank" href="chitietsanpham.html?` + p.name.split(' ').join('-') + `" style="font-weight:600">` + p.name + `</a>
                <span style="font-size:0.75rem;color:var(--text-secondary);display:block">Hãng: ${p.company}</span>
                <img src="` + p.img + `" onerror="this.src='img/favicon.ico'">
            </td>
            <td style="width: 14%"><strong style="color:var(--danger)">` + p.price + ` ₫</strong></td>
            <td style="width: 18%">` + promoBadge + `</td>
            <td style="width: 15%; text-align:center">
                <div style="display:inline-flex;gap:6px">
                    <button class="btn-primary" onclick="addKhungSuaSanPham('` + p.masp + `')" style="padding:4px 10px;font-size:0.75rem;background:var(--accent)">
                        <i class="fa fa-pencil"></i> Sửa
                    </button>
                    <button class="btn-primary" onclick="xoaSanPham('` + p.masp + `', '` + p.name + `')" style="padding:4px 10px;font-size:0.75rem;background:var(--danger)">
                        <i class="fa fa-trash"></i> Xóa
                    </button>
                </div>
            </td>
        </tr>`;
    }

    s += `</table>`;
    tc.innerHTML = s;
}

function timKiemSanPham(inp) {
    var kieuTim = document.getElementsByName('kieuTimSanPham')[0].value;
    var text = inp.value;
    var vitriKieuTim = { 'ma': 1, 'ten': 2 };

    var listTr_table = document.getElementsByClassName('sanpham')[0].getElementsByClassName('table-content')[0].getElementsByTagName('tr');
    for (var tr of listTr_table) {
        var td = tr.getElementsByTagName('td')[vitriKieuTim[kieuTim]].innerText.toLowerCase();
        if (td.indexOf(text.toLowerCase()) < 0) {
            tr.style.display = 'none';
        } else {
            tr.style.display = '';
        }
    }
}

function layThongTinSanPhamTuTable(id) {
    var khung = document.getElementById(id);
    var tr = khung.getElementsByTagName('tr');

    var masp = tr[1].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var name = tr[2].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var company = tr[3].getElementsByTagName('td')[1].getElementsByTagName('select')[0].value;
    var imgElement = tr[4].getElementsByTagName('td')[1].getElementsByTagName('img')[0];
    var img = imgElement.getAttribute('src') || '';
    var price = tr[5].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var star = tr[6].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var rateCount = tr[7].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var promoName = tr[8].getElementsByTagName('td')[1].getElementsByTagName('select')[0].value;
    var promoValue = tr[9].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;

    var screen = tr[11].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var os = tr[12].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var camara = tr[13].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var camaraFront = tr[14].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var cpu = tr[15].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var ram = tr[16].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var rom = tr[17].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var microUSB = tr[18].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var battery = tr[19].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;

    var normalizedPrice = price.replace(/[.,\s]/g, '');
    if (!/^\d+$/.test(normalizedPrice) || Number(normalizedPrice) <= 0) {
        alert('Giá phải là số nguyên lớn hơn 0');
        return false;
    }

    if (star.trim() && (!/^\d+$/.test(star) || Number(star) > 5)) {
        alert('Số sao phải là số nguyên từ 0 đến 5');
        return false;
    }

    if (rateCount.trim() && !/^\d+$/.test(rateCount)) {
        alert('Số đánh giá phải là số nguyên không âm');
        return false;
    }

    try {
        return {
            "name": name,
            "company": company,
            "img": img,
            "price": numToString(Number.parseInt(normalizedPrice, 10)),
            "star": Number.parseInt(star || '0', 10),
            "rateCount": Number.parseInt(rateCount || '0', 10),
            "promo": {
                "name": promoName,
                "value": promoValue
            },
            "detail": {
                "screen": screen,
                "os": os,
                "camara": camara,
                "camaraFront": camaraFront,
                "cpu": cpu,
                "ram": ram,
                "rom": rom,
                "microUSB": microUSB,
                "battery": battery
            },
            "masp": masp
        };
    } catch (e) {
        alert('Lỗi: ' + e.toString());
        return false;
    }
}

async function themSanPham() {
    var newSp = layThongTinSanPhamTuTable('khungThemSanPham');
    if (!newSp) return;

    for (var p of list_products) {
        if (p.masp == newSp.masp) {
            alert('Mã sản phẩm bị trùng !!');
            return false;
        }
        if (p.name == newSp.name) {
            alert('Tên sản phẩm bị trùng !!');
            return false;
        }
    }
    if (window.API) {
        var response = await API.createProduct(newSp);
        if (!response || !response.success) {
            alert(response && response.message ? response.message : 'Không kết nối được database. Sản phẩm chưa được thêm.');
            return false;
        }
    }

    list_products.push(newSp);
    cacheAdminProducts();
    addTableProducts();

    alert('Thêm sản phẩm "' + newSp.name + '" thành công.');
    var addForm = document.getElementById('khungThemSanPham');
    for (var input of addForm.querySelectorAll('input[type="text"]')) input.value = '';
    for (var fileInput of addForm.querySelectorAll('input[type="file"]')) fileInput.value = '';
    addForm.querySelector('.hinhDaiDien').setAttribute('src', '');
    addForm.getElementsByTagName('select')[1].selectedIndex = 0;
    autoMaSanPham();
    addForm.style.transform = 'scale(0)';
}

function autoMaSanPham(company) {
    if (!company) company = document.getElementsByName('chonCompany')[0].value;
    var index = 0;
    for (var i = 0; i < list_products.length; i++) {
        if (list_products[i].company == company) {
            index++;
        }
    }
    document.getElementById('maspThem').value = company.substring(0, 3) + index;
}

async function xoaSanPham(masp, tensp) {
    if (window.confirm('Bạn có chắc muốn xóa ' + tensp + '?')) {
        if (window.API) {
            var response = await API.deleteProduct(masp);
            if (!response || !response.success) {
                alert(response && response.message ? response.message : 'Không kết nối được database. Sản phẩm chưa bị xóa.');
                return false;
            }
        }

        for (var i = 0; i < list_products.length; i++) {
            if (list_products[i].masp == masp) {
                list_products.splice(i, 1);
            }
        }

        cacheAdminProducts();
        addTableProducts();
    }
}

async function suaSanPham(masp) {
    var sp = layThongTinSanPhamTuTable('khungSuaSanPham');
    if (!sp) return;

    for (var p of list_products) {
        if (p.masp == masp && p.masp != sp.masp) {
            alert('Mã sản phẩm bị trùng !!');
            return false;
        }
        if (p.name == sp.name && p.masp != sp.masp) {
            alert('Tên sản phẩm bị trùng !!');
            return false;
        }
    }
    if (window.API) {
        var response = await API.updateProduct(masp, sp);
        if (!response || !response.success) {
            alert(response && response.message ? response.message : 'Không kết nối được database. Sản phẩm chưa được cập nhật.');
            return false;
        }
    }

    for (var i = 0; i < list_products.length; i++) {
        if (list_products[i].masp == masp) {
            list_products[i] = sp;
        }
    }

    cacheAdminProducts();
    addTableProducts();
    alert('Sửa ' + sp.name + ' thành công');
    document.getElementById('khungSuaSanPham').style.transform = 'scale(0)';
}

function addKhungSuaSanPham(masp) {
    var sp;
    for (var p of list_products) {
        if (p.masp == masp) {
            sp = p;
        }
    }

    var s = `<span class="close" onclick="this.parentElement.style.transform = 'scale(0)';">&times;</span>
    <table class="overlayTable table-outline table-content table-header">
        <tr>
            <th colspan="2">Chỉnh sửa: ` + sp.name + `</th>
        </tr>
        <tr>
            <td>Mã sản phẩm:</td>
            <td><input type="text" value="` + sp.masp + `" readonly></td>
        </tr>
        <tr>
            <td>Tên sản phẩm:</td>
            <td><input type="text" value="` + sp.name + `"></td>
        </tr>
        <tr>
            <td>Hãng:</td>
            <td>
                <select>`
    var company = ["Apple", "Samsung", "Oppo", "Nokia", "Huawei", "Xiaomi", "Realme", "Vivo", "Philips", "Mobell", "Mobiistar", "Itel", "Coolpad", "HTC", "Motorola"];
    for (var c of company) {
        if (sp.company == c)
            s += (`<option value="` + c + `" selected>` + c + `</option>`);
        else s += (`<option value="` + c + `">` + c + `</option>`);
    }

    s += `
                </select>
            </td>
        </tr>
        <tr>
            <td>Hình:</td>
            <td>
                <img class="hinhDaiDien" id="anhDaiDienSanPhamSua" src="` + sp.img + `">
                <input type="file" accept="image/*" onchange="capNhatAnhSanPham(this.files, 'anhDaiDienSanPhamSua')">
            </td>
        </tr>
        <tr>
            <td>Giá tiền (số nguyên):</td>
            <td><input type="text" value="` + stringToNum(sp.price) + `"></td>
        </tr>
        <tr>
            <td>Số sao (0->5):</td>
            <td><input type="text" value="` + sp.star + `"></td>
        </tr>
        <tr>
            <td>Đánh giá (số nguyên):</td>
            <td><input type="text" value="` + sp.rateCount + `"></td>
        </tr>
        <tr>
            <td>Khuyến mãi:</td>
            <td>
                <select>
                    <option value="">Không</option>
                    <option value="tragop" ` + (sp.promo.name == 'tragop' ? 'selected' : '') + `>Trả góp</option>
                    <option value="giamgia" ` + (sp.promo.name == 'giamgia' ? 'selected' : '') + `>Giảm giá</option>
                    <option value="giareonline" ` + (sp.promo.name == 'giareonline' ? 'selected' : '') + `>Giá rẻ online</option>
                    <option value="moiramat" ` + (sp.promo.name == 'moiramat' ? 'selected' : '') + `>Mới ra mắt</option>
                </select>
            </td>
        </tr>
        <tr>
            <td>Giá trị khuyến mãi:</td>
            <td><input type="text" value="` + sp.promo.value + `"></td>
        </tr>
        <tr>
            <th colspan="2">Thông số kĩ thuật</th>
        </tr>
        <tr>
            <td>Màn hình:</td>
            <td><input type="text" value="` + sp.detail.screen + `"></td>
        </tr>
        <tr>
            <td>Hệ điều hành:</td>
            <td><input type="text" value="` + sp.detail.os + `"></td>
        </tr>
        <tr>
            <td>Camera sau:</td>
            <td><input type="text" value="` + sp.detail.camara + `"></td>
        </tr>
        <tr>
            <td>Camera trước:</td>
            <td><input type="text" value="` + sp.detail.camaraFront + `"></td>
        </tr>
        <tr>
            <td>CPU:</td>
            <td><input type="text" value="` + sp.detail.cpu + `"></td>
        </tr>
        <tr>
            <td>RAM:</td>
            <td><input type="text" value="` + sp.detail.ram + `"></td>
        </tr>
        <tr>
            <td>Bộ nhớ trong:</td>
            <td><input type="text" value="` + sp.detail.rom + `"></td>
        </tr>
        <tr>
            <td>Thẻ nhớ:</td>
            <td><input type="text" value="` + sp.detail.microUSB + `"></td>
        </tr>
        <tr>
            <td>Dung lượng Pin:</td>
            <td><input type="text" value="` + sp.detail.battery + `"></td>
        </tr>
        <tr>
            <td colspan="2" class="table-footer" style="text-align:center">
                <button onclick="suaSanPham('` + sp.masp + `')" class="btn-primary" style="padding:10px 32px">
                    <i class="fa fa-save"></i> LƯU THAY ĐỔI
                </button>
            </td>
        </tr>
    </table>`;
    var khung = document.getElementById('khungSuaSanPham');
    khung.innerHTML = s;
    khung.style.transform = 'scale(1)';
}

function capNhatAnhSanPham(files, id) {
    const reader = new FileReader();
    reader.addEventListener("load", function () {
        document.getElementById(id).setAttribute('src', reader.result);
    }, false);

    if (files[0]) {
        reader.readAsDataURL(files[0]);
    }
}

function sortProductsTable(loai) {
    var list = document.getElementsByClassName('sanpham')[0].getElementsByClassName("table-content")[0];
    var tr = list.getElementsByTagName('tr');

    quickSort(tr, 0, tr.length - 1, loai, getValueOfTypeInTable_SanPham);
    decrease = !decrease;
}

function getValueOfTypeInTable_SanPham(tr, loai) {
    var td = tr.getElementsByTagName('td');
    switch (loai) {
        case 'stt': return Number(td[0].innerText);
        case 'masp': return td[1].innerText.toLowerCase();
        case 'ten': return td[2].innerText.toLowerCase();
        case 'gia': return stringToNum(td[3].innerText);
        case 'khuyenmai': return td[4].innerText.toLowerCase();
    }
    return false;
}

// ========================= ĐƠN HÀNG ===========================
function addTableDonHang() {
    var tc = document.getElementsByClassName('donhang')[0].getElementsByClassName('table-content')[0];
    var s = `<table class="table-outline">`;

    var listDH = getListDonHang();

    TONGTIEN = 0;
    for (var i = 0; i < listDH.length; i++) {
        var d = listDH[i];
        var badgeClass = tinhTrangToBadge(d.tinhTrang);
        s += `<tr data-order-date="` + new Date(d.ngaymua).toISOString() + `" onclick="xemChiTietDonHang('` + d.ma + `')" style="cursor:pointer">
            <td style="width: 4%"><strong>` + (i + 1) + `</strong></td>
            <td style="width: 16%"><code style="font-size:0.78rem;color:var(--accent);background:var(--accent-light);padding:3px 8px;border-radius:6px;font-weight:600">` + d.ma + `</code></td>
            <td style="width: 12%">
                <div style="font-weight:600;color:var(--text-primary)">` + (d.hoTen || d.khach) + `</div>
                <div style="font-size:0.75rem;color:var(--text-secondary)">@` + d.khach + `</div>
            </td>
            <td style="width: 22%">` + d.sp + `</td>
            <td style="width: 13%"><strong style="color:var(--danger)">` + d.tongtien + ` ₫</strong></td>
            <td style="width: 13%;font-size:0.8rem;color:var(--text-secondary)">` + d.ngaygio + `</td>
            <td style="width: 12%"><span class="badge ` + badgeClass + `">` + d.tinhTrang + `</span></td>
            <td style="width: 8%; text-align:center" onclick="event.stopPropagation()">
                <button class="btn-primary" onclick="xemChiTietDonHang('` + d.ma + `')" style="padding:4px 10px;font-size:0.75rem;background:#06b6d4">
                    <i class="fa fa-eye"></i> Xem
                </button>
            </td>
        </tr>`;
        TONGTIEN += stringToNum(d.tongtien);
    }

    s += `</table>`;
    tc.innerHTML = s;
}

function tinhTrangToBadge(tt) {
    if (!tt) return 'badge-pending';
    if (tt.includes('chờ')) return 'badge-pending';
    if (tt.includes('Đang giao')) return 'badge-shipping';
    if (tt.includes('Đã giao')) return 'badge-done';
    if (tt.includes('hủy') || tt.includes('Hủy')) return 'badge-cancel';
    return 'badge-pending';
}

function getListDonHang(traVeDanhSachSanPham = false) {
    if (adminOrdersLoaded) {
        return adminOrders.map(function (order) {
            var orderItems = (order.sp || []).map(function (item) {
                var product = list_products.find(function (p) { return p.masp === item.ma; }) || {
                    masp: item.ma,
                    name: item.name || 'Sản phẩm đã ngừng kinh doanh',
                    company: item.company || '',
                    img: item.img || '',
                    price: item.dongia || '0',
                    promo: { name: '', value: '' },
                    detail: {}
                };
                product = Object.assign({}, product, { price: item.dongia || product.price });
                return {
                    ma: item.ma,
                    name: item.name || product.name,
                    company: item.company || product.company || '',
                    soluong: Number(item.soluong) || 1,
                    dongia: item.dongia || product.price,
                    sanPham: product,
                    soLuong: Number(item.soluong) || 1,
                    img: item.img || product.img || ''
                };
            });
            var productHtml = orderItems.map(function (item) {
                return `<div style="font-size:0.83rem;line-height:1.4"><span style="font-weight:600">${item.name}</span> <span style="color:#6366f1;font-weight:600">x${item.soluong}</span></div>`;
            }).join('');
            return {
                ma: order.ma,
                khach: order.khach,
                hoTen: order.hoTen || order.khach,
                email: order.email || '',
                sdt: order.sdt || '',
                diaChi: order.diaChi || '',
                sp: traVeDanhSachSanPham ? orderItems : productHtml,
                rawSp: orderItems,
                tongtien: order.tongtien || '0',
                ngaygio: order.ngaygio || (order.ngaymua ? new Date(order.ngaymua).toLocaleString('vi-VN') : ''),
                ngaymua: order.ngaymua || new Date(),
                tinhTrang: order.tinhTrang || 'Đang chờ xử lý'
            };
        });
    }

    var u = getListUser();
    var result = [];
    for (var i = 0; i < u.length; i++) {
        for (var j = 0; j < (u[i].donhang || []).length; j++) {
            var tongtien = 0;
            for (var s of u[i].donhang[j].sp) {
                var timsp = timKiemTheoMa(list_products, s.ma);
                if (timsp) {
                    if (timsp.promo.name == 'giareonline') tongtien += stringToNum(timsp.promo.value);
                    else tongtien += stringToNum(timsp.price);
                }
            }

            var x = new Date(u[i].donhang[j].ngaymua).toLocaleString();
            var sps = '';
            for (var s of u[i].donhang[j].sp) {
                var prodObj = timKiemTheoMa(list_products, s.ma);
                sps += `<div style="font-size:0.83rem;line-height:1.4"><span style="font-weight:600">` + (prodObj ? prodObj.name : s.ma) + `</span> <span style="color:#6366f1;font-weight:600">x` + s.soluong + `</span></div>`;
            }

            var danhSachSanPham = [];
            for (var s of u[i].donhang[j].sp) {
                danhSachSanPham.push({
                    sanPham: timKiemTheoMa(list_products, s.ma),
                    soLuong: s.soluong,
                    soluong: s.soluong,
                    ma: s.ma,
                    name: timKiemTheoMa(list_products, s.ma) ? timKiemTheoMa(list_products, s.ma).name : s.ma
                });
            }

            result.push({
                "ma": u[i].donhang[j].ngaymua.toString(),
                "khach": u[i].username,
                "hoTen": (u[i].ho || '') + ' ' + (u[i].ten || u[i].username),
                "email": u[i].email || '',
                "sdt": u[i].sdt || '',
                "diaChi": u[i].donhang[j].diaChi || '280 An Dương Vương, Quận 5, TP.HCM',
                "sp": traVeDanhSachSanPham ? danhSachSanPham : sps,
                "rawSp": danhSachSanPham,
                "tongtien": numToString(tongtien),
                "ngaygio": x,
                "ngaymua": u[i].donhang[j].ngaymua,
                "tinhTrang": u[i].donhang[j].tinhTrang || 'Đang chờ xử lý'
            });
        }
    }
    return result;
}

// ========== MODAL CHI TIẾT ĐƠN HÀNG (ENTERPRISE DETAILS) ==========
function xemChiTietDonHang(maDon) {
    var order = null;
    if (adminOrdersLoaded && adminOrders.length) {
        order = adminOrders.find(function (o) { return o.ma === maDon; });
    }
    if (!order) {
        var listDH = getListDonHang(true);
        var found = listDH.find(function (o) { return o.ma === maDon; });
        if (found) {
            order = {
                ma: found.ma,
                khach: found.khach,
                hoTen: found.hoTen || found.khach,
                email: found.email || '',
                sdt: found.sdt || '',
                diaChi: found.diaChi || '280 An Dương Vương, Quận 5, TP.HCM',
                tongtien: found.tongtien,
                ngaygio: found.ngaygio,
                tinhTrang: found.tinhTrang,
                sp: found.sp.map(function (item) {
                    var prod = item.sanPham || {};
                    return {
                        ma: item.ma || prod.masp,
                        name: item.name || prod.name,
                        company: prod.company || '',
                        dongia: item.dongia || prod.price,
                        soluong: item.soluong || item.soLuong || 1,
                        img: prod.img || ''
                    };
                })
            };
        }
    }

    if (!order) {
        alert('Không tìm thấy thông tin đơn hàng ' + maDon);
        return;
    }

    var badgeClass = tinhTrangToBadge(order.tinhTrang);

    // Danh sách sản phẩm
    var productHtml = '';
    if (order.sp && order.sp.length > 0) {
        productHtml = '<ul class="odp-product-list">' + order.sp.map(function (item) {
            var pImg = item.img || 'img/favicon.ico';
            var pPrice = item.dongia ? (item.dongia.includes('₫') ? item.dongia : item.dongia + ' ₫') : '';
            return `<li class="odp-product-item">
                <img src="${pImg}" onerror="this.src='img/favicon.ico'" alt="${item.name}">
                <div class="pname">
                    ${item.name || item.ma}
                    <small>Mã SP: ${item.ma} ${item.company ? ' | Hãng: ' + item.company : ''}</small>
                </div>
                <div class="pqty-price">
                    <span style="color:#64748b;font-size:0.8rem">SL: ${item.soluong}</span>
                    <strong style="color:var(--danger)">${pPrice}</strong>
                </div>
            </li>`;
        }).join('') + '</ul>';
    } else {
        productHtml = '<p style="color:#94a3b8;text-align:center;padding:16px">Không có sản phẩm</p>';
    }

    // Nút hành động theo trạng thái
    var actionButtons = '';
    if (order.tinhTrang === 'Đang chờ xử lý') {
        actionButtons = `
            <button class="btn-primary btn-warning" onclick="duyetTuModal('${order.ma}', 'Đang giao hàng')">
                <i class="fa fa-truck"></i> Giao hàng
            </button>
            <button class="btn-primary btn-success" onclick="duyetTuModal('${order.ma}', 'Đã giao hàng')">
                <i class="fa fa-check"></i> Đã giao thành công
            </button>
            <button class="btn-primary btn-danger" onclick="duyetTuModal('${order.ma}', 'Đã hủy')">
                <i class="fa fa-ban"></i> Hủy đơn
            </button>`;
    } else if (order.tinhTrang === 'Đang giao hàng') {
        actionButtons = `
            <button class="btn-primary btn-success" onclick="duyetTuModal('${order.ma}', 'Đã giao hàng')">
                <i class="fa fa-check"></i> Xác nhận đã giao
            </button>
            <button class="btn-primary btn-danger" onclick="duyetTuModal('${order.ma}', 'Đã hủy')">
                <i class="fa fa-ban"></i> Hủy đơn
            </button>`;
    }

    document.getElementById('odpBody').innerHTML = `
        <!-- Thông tin đơn hàng -->
        <div class="odp-section">
            <h4>📋 THÔNG TIN ĐƠN HÀNG</h4>
            <div class="odp-row">
                <span class="label">Mã đơn:</span>
                <span class="value"><code style="color:var(--accent);background:var(--accent-light);padding:2px 8px;border-radius:4px">${order.ma}</code></span>
            </div>
            <div class="odp-row">
                <span class="label">Thời gian:</span>
                <span class="value">${order.ngaygio}</span>
            </div>
            <div class="odp-row">
                <span class="label">Trạng thái:</span>
                <span class="value"><span class="badge ${badgeClass}">${order.tinhTrang}</span></span>
            </div>
            <div class="odp-row">
                <span class="label">Tổng thanh toán:</span>
                <span class="value" style="color:var(--danger);font-size:1.05rem;font-weight:700">${order.tongtien} ₫</span>
            </div>
        </div>

        <!-- Thông tin khách hàng & người nhận -->
        <div class="odp-section">
            <h4>👤 THÔNG TIN KHÁCH HÀNG</h4>
            <div class="odp-row">
                <span class="label">Người nhận:</span>
                <span class="value">${order.hoTen || order.khach}</span>
            </div>
            <div class="odp-row">
                <span class="label">Tài khoản:</span>
                <span class="value"><code style="color:var(--text-secondary)">@${order.khach}</code></span>
            </div>
            <div class="odp-row">
                <span class="label">Điện thoại:</span>
                <span class="value" style="color:var(--accent)"><i class="fa fa-phone"></i> ${order.sdt || '0988123456'}</span>
            </div>
            <div class="odp-row">
                <span class="label">Email:</span>
                <span class="value">${order.email || '<em style="color:#94a3b8">Chưa cập nhật</em>'}</span>
            </div>
        </div>

        <!-- Địa chỉ giao hàng chi tiết -->
        <div class="odp-section full-width">
            <h4>📍 ĐỊA CHỈ GIAO HÀNG CHI TIẾT</h4>
            <div style="padding:12px;background:#fff;border-radius:8px;border:1px solid var(--border);font-size:0.92rem;color:var(--text-primary);display:flex;align-items:center;gap:10px">
                <i class="fa fa-map-marker" style="font-size:1.3rem;color:var(--danger)"></i>
                <span>${order.diaChi || '280 An Dương Vương, Phường 4, Quận 5, TP. Hồ Chí Minh'}</span>
            </div>
        </div>

        <!-- Sản phẩm trong đơn -->
        <div class="odp-section full-width">
            <h4>🛍️ DANH SÁCH SẢN PHẨM (${(order.sp || []).length} mục)</h4>
            ${productHtml}
        </div>
    `;

    document.getElementById('odpFooter').innerHTML = `
        <div class="odp-total">Tổng tiền: <span style="color:var(--danger);font-weight:700">${order.tongtien} ₫</span></div>
        <div class="odp-actions">
            ${actionButtons}
            <button class="btn-primary btn-outline" onclick="closeOrderDetail()">
                <i class="fa fa-times"></i> Đóng
            </button>
        </div>
    `;

    var modal = document.getElementById('orderDetailModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeOrderDetail() {
    var modal = document.getElementById('orderDetailModal');
    if (modal) {
        modal.classList.remove('show');
    }
    document.body.style.overflow = '';
}

// Duyệt / Cập nhật trạng thái từ modal chi tiết
async function duyetTuModal(maDon, tinhTrangMoi) {
    if (tinhTrangMoi === 'Đã hủy' && !window.confirm('Bạn có chắc muốn hủy đơn hàng ' + maDon + '?')) return;

    if (window.API) {
        var response = await API.updateOrderStatus(maDon, tinhTrangMoi);
        if (!response || !response.success) {
            alert(response && response.message ? response.message : 'Không thể cập nhật trạng thái đơn hàng!');
            return;
        }
    }

    if (adminOrdersLoaded && adminOrders.length) {
        var order = adminOrders.find(function (o) { return o.ma === maDon; });
        if (order) order.tinhTrang = tinhTrangMoi;
    }

    closeOrderDetail();
    addTableDonHang();
    addStatCards();
    addThongKe();
    alert('✅ Đã cập nhật trạng thái đơn hàng: ' + tinhTrangMoi);
}

// Duyệt / Hủy từ bảng
async function duyet(maDonHang, duyetDon) {
    var nextStatus = duyetDon ? 'Đã giao hàng' : 'Đã hủy';
    if (adminOrdersLoaded && window.API) {
        var order = adminOrders.find(function (item) { return item.ma === maDonHang; });
        if (!order) {
            alert('Không tìm thấy đơn hàng trong database.');
            return;
        }
        if (order.tinhTrang !== 'Đang chờ xử lý') {
            alert(order.tinhTrang === 'Đã hủy' ? 'Không thể duyệt đơn đã hủy.' : 'Đơn hàng này đã được xử lý.');
            return;
        }
        if (!duyetDon && !window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

        var response = await API.updateOrderStatus(maDonHang, nextStatus);
        if (!response || !response.success) {
            alert(response && response.message ? response.message : 'Không kết nối được database. Trạng thái đơn hàng chưa đổi.');
            return;
        }
        order.tinhTrang = nextStatus;
        addTableDonHang();
        addStatCards();
        addThongKe();
        return;
    }

    var u = getListUser();
    for (var i = 0; i < u.length; i++) {
        for (var j = 0; j < u[i].donhang.length; j++) {
            if (u[i].donhang[j].ngaymua == maDonHang) {
                if (duyetDon) {
                    if (u[i].donhang[j].tinhTrang == 'Đang chờ xử lý') {
                        u[i].donhang[j].tinhTrang = 'Đã giao hàng';
                    } else if (u[i].donhang[j].tinhTrang == 'Đã hủy') {
                        alert('Không thể duyệt đơn đã hủy !');
                        return;
                    }
                } else {
                    if (u[i].donhang[j].tinhTrang == 'Đang chờ xử lý') {
                        if (window.confirm('Bạn có chắc muốn hủy đơn hàng này?'))
                            u[i].donhang[j].tinhTrang = 'Đã hủy';
                    } else if (u[i].donhang[j].tinhTrang == 'Đã giao hàng') {
                        alert('Không thể hủy đơn hàng đã giao !');
                        return;
                    }
                }
                break;
            }
        }
    }

    setListUser(u);
    addTableDonHang();
    addStatCards();
    addThongKe();
}

function locDonHangTheoKhoangNgay() {
    var fromValue = document.getElementById('fromDate').value;
    var toValue = document.getElementById('toDate').value;
    var from = fromValue ? new Date(fromValue + 'T00:00:00') : null;
    var to = toValue ? new Date(toValue + 'T23:59:59.999') : null;

    var listTr_table = document.getElementsByClassName('donhang')[0].getElementsByClassName('table-content')[0].getElementsByTagName('tr');
    for (var tr of listTr_table) {
        var d = new Date(tr.dataset.orderDate);
        if ((!from || d >= from) && (!to || d <= to)) {
            tr.style.display = '';
        } else {
            tr.style.display = 'none';
        }
    }
}

function timKiemDonHang(inp) {
    var kieuTim = document.getElementsByName('kieuTimDonHang')[0].value;
    var text = inp.value;
    var vitriKieuTim = { 'ma': 1, 'khachhang': 2, 'trangThai': 6 };

    var listTr_table = document.getElementsByClassName('donhang')[0].getElementsByClassName('table-content')[0].getElementsByTagName('tr');
    for (var tr of listTr_table) {
        var td = tr.getElementsByTagName('td')[vitriKieuTim[kieuTim]].innerText.toLowerCase();
        if (td.indexOf(text.toLowerCase()) < 0) {
            tr.style.display = 'none';
        } else {
            tr.style.display = '';
        }
    }
}

function sortDonHangTable(loai) {
    var list = document.getElementsByClassName('donhang')[0].getElementsByClassName("table-content")[0];
    var tr = list.getElementsByTagName('tr');

    quickSort(tr, 0, tr.length - 1, loai, getValueOfTypeInTable_DonHang);
    decrease = !decrease;
}

function getValueOfTypeInTable_DonHang(tr, loai) {
    var td = tr.getElementsByTagName('td');
    switch (loai) {
        case 'stt': return Number(td[0].innerText);
        case 'ma': return td[1].innerText.toLowerCase();
        case 'khach': return td[2].innerText.toLowerCase();
        case 'sanpham': return td[3].children.length;
        case 'tongtien': return stringToNum(td[4].innerText);
        case 'ngaygio': return new Date(td[5].innerText);
        case 'trangthai': return td[6].innerText.toLowerCase();
    }
    return false;
}

// ====================== KHÁCH HÀNG =============================
function addTableKhachHang() {
    var tc = document.getElementsByClassName('khachhang')[0].getElementsByClassName('table-content')[0];
    var s = `<table class="table-outline">`;

    var listUser = adminUsersLoaded ? adminUsers : getListUser();

    for (var i = 0; i < listUser.length; i++) {
        var u = listUser[i];
        var isLocked = u.off ? true : false;
        var statusBadge = isLocked 
            ? `<span class="badge badge-locked">Đã khóa</span>` 
            : `<span class="badge badge-active">Hoạt động</span>`;

        s += `<tr>
            <td style="width: 5%"><strong>` + (i + 1) + `</strong></td>
            <td style="width: 18%"><strong>` + (u.ho || '') + ' ' + (u.ten || '') + `</strong></td>
            <td style="width: 22%;color:var(--text-secondary)">` + (u.email || '<em style="color:#94a3b8">Chưa có</em>') + `</td>
            <td style="width: 18%"><code style="background:var(--bg-main);padding:2px 6px;border-radius:4px;color:var(--accent)">` + u.username + `</code></td>
            <td style="width: 12%;color:#94a3b8">••••••••</td>
            <td style="width: 10%;text-align:center">` + statusBadge + `</td>
            <td style="width: 15%;text-align:center">
                <div style="display:inline-flex;align-items:center;gap:12px">
                    <div class="tooltip">
                        <label class="switch">
                            <input type="checkbox" ` + (isLocked ? '' : 'checked') + ` onclick="voHieuHoaNguoiDung(this, '` + u.username + `')">
                            <span class="slider round"></span>
                        </label>
                        <span class="tooltiptext">` + (isLocked ? 'Mở khóa' : 'Khóa') + `</span>
                    </div>
                    <div class="tooltip">
                        <i class="fa fa-trash" onclick="xoaNguoiDung('` + u.username + `')" style="color:var(--danger);cursor:pointer"></i>
                        <span class="tooltiptext">Xóa</span>
                    </div>
                </div>
            </td>
        </tr>`;
    }

    s += `</table>`;
    tc.innerHTML = s;
}

function timKiemNguoiDung(inp) {
    var kieuTim = document.getElementsByName('kieuTimKhachHang')[0].value;
    var text = inp.value;
    var vitriKieuTim = { 'ten': 1, 'email': 2, 'taikhoan': 3 };

    var listTr_table = document.getElementsByClassName('khachhang')[0].getElementsByClassName('table-content')[0].getElementsByTagName('tr');
    for (var tr of listTr_table) {
        var td = tr.getElementsByTagName('td')[vitriKieuTim[kieuTim]].innerText.toLowerCase();
        if (td.indexOf(text.toLowerCase()) < 0) {
            tr.style.display = 'none';
        } else {
            tr.style.display = '';
        }
    }
}

async function openThemNguoiDung() {
    var username = window.prompt('Tên đăng nhập khách hàng mới:');
    if (!username) return;
    var pass = window.prompt('Mật khẩu:');
    if (!pass) return;
    var ho = window.prompt('Họ:', '') || '';
    var ten = window.prompt('Tên:', '') || '';
    var email = window.prompt('Email:', '') || '';

    var response = window.API ? await API.createUser({ username: username, pass: pass, ho: ho, ten: ten, email: email }) : null;
    if (!response || !response.success) {
        alert(response && response.message ? response.message : 'Không kết nối được database. Khách hàng chưa được thêm.');
        return;
    }
    await taiLaiKhachHang();
    addTableKhachHang();
    alert('Đã thêm khách hàng ' + username + '.');
}

async function taiLaiKhachHang() {
    if (!window.API) return;
    var users = await API.getUsers();
    if (Array.isArray(users)) {
        adminUsers = users;
        adminUsersLoaded = true;
    }
}

async function voHieuHoaNguoiDung(inp, taikhoan) {
    var listUser = adminUsersLoaded ? adminUsers : getListUser();
    for (var u of listUser) {
        if (u.username == taikhoan) {
            var response = window.API ? await API.toggleLockUser(taikhoan) : null;
            if (!response || !response.success) {
                inp.checked = !inp.checked;
                alert(response && response.message ? response.message : 'Không kết nối được database. Trạng thái khách hàng chưa đổi.');
                return;
            }
            u.off = response.isLocked;
            if (!adminUsersLoaded) setListUser(listUser);
            addTableKhachHang();
            alert(`${u.off ? 'Khoá' : 'Mở khoá'} tài khoản ${u.username} thành công.`);
            break;
        }
    }
}

async function xoaNguoiDung(taikhoan) {
    if (window.confirm('Xác nhận xóa ' + taikhoan + '? \nMọi dữ liệu về ' + taikhoan + ' sẽ mất! Bao gồm cả những đơn hàng của ' + taikhoan)) {
        var listuser = adminUsersLoaded ? adminUsers : getListUser();
        for (var i = 0; i < listuser.length; i++) {
            if (listuser[i].username == taikhoan) {
                var response = window.API ? await API.deleteUser(taikhoan) : null;
                if (!response || !response.success) {
                    alert(response && response.message ? response.message : 'Không kết nối được database. Khách hàng chưa bị xóa.');
                    return;
                }
                listuser.splice(i, 1);
                if (!adminUsersLoaded) setListUser(listuser);

                localStorage.removeItem('CurrentUser');
                addTableKhachHang();
                addTableDonHang();
                addStatCards();
                addThongKe();
                return;
            }
        }
    }
}

function sortKhachHangTable(loai) {
    var list = document.getElementsByClassName('khachhang')[0].getElementsByClassName("table-content")[0];
    var tr = list.getElementsByTagName('tr');

    quickSort(tr, 0, tr.length - 1, loai, getValueOfTypeInTable_KhachHang);
    decrease = !decrease;
}

function getValueOfTypeInTable_KhachHang(tr, loai) {
    var td = tr.getElementsByTagName('td');
    switch (loai) {
        case 'stt': return Number(td[0].innerText);
        case 'hoten': return td[1].innerText.toLowerCase();
        case 'email': return td[2].innerText.toLowerCase();
        case 'taikhoan': return td[3].innerText.toLowerCase();
        case 'matkhau': return td[4].innerText.toLowerCase();
    }
    return false;
}

// ================== SORT ====================
var decrease = true;

function quickSort(arr, left, right, loai, func) {
    var pivot, partitionIndex;

    if (left < right) {
        pivot = right;
        partitionIndex = partition(arr, pivot, left, right, loai, func);
        quickSort(arr, left, partitionIndex - 1, loai, func);
        quickSort(arr, partitionIndex + 1, right, loai, func);
    }
    return arr;
}

function partition(arr, pivot, left, right, loai, func) {
    var pivotValue = func(arr[pivot], loai),
        partitionIndex = left;

    for (var i = left; i < right; i++) {
        if (decrease && func(arr[i], loai) > pivotValue ||
            !decrease && func(arr[i], loai) < pivotValue) {
            swap(arr, i, partitionIndex);
            partitionIndex++;
        }
    }
    swap(arr, right, partitionIndex);
    return partitionIndex;
}

function swap(arr, i, j) {
    var tempi = arr[i].cloneNode(true);
    var tempj = arr[j].cloneNode(true);
    arr[i].parentNode.replaceChild(tempj, arr[i]);
    arr[j].parentNode.replaceChild(tempi, arr[j]);
}

function promoToStringValue(pr) {
    if (!pr) return '';
    switch (pr.name) {
        case 'tragop': return 'Góp ' + pr.value + '%';
        case 'giamgia': return 'Giảm ' + pr.value;
        case 'giareonline': return 'Online (' + pr.value + ')';
        case 'moiramat': return 'Mới';
    }
    return '';
}

function progress(percent, bg, width, height) {
    return `<div class="progress" style="width: ` + width + `; height:` + height + `">
                <div class="progress-bar bg-info" style="width: ` + percent + `%; background-color:` + bg + `"></div>
            </div>`;
}

// Đóng modal khi bấm vào nền xám mờ bên ngoài
document.addEventListener('DOMContentLoaded', function () {
    var modal = document.getElementById('orderDetailModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeOrderDetail();
        });
    }
});

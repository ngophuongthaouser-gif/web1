var currentuser; // user hiện tại, biến toàn cục
window.onload = async function () {
    khoiTao();
	if (window.API) {
		var products = await API.getProducts();
		if (Array.isArray(products)) {
			list_products = products;
			setListProducts(products);
		}
	}

	// autocomplete cho khung tim kiem
	autocomplete(document.getElementById('search-box'), list_products);

	// thêm tags (từ khóa) vào khung tìm kiếm
	var tags = ["Samsung", "iPhone", "Huawei", "Oppo", "Mobi"];
	for (var t of tags) addTags(t, "index.html?search=" + t)

	currentuser = getCurrentUser();
	addProductToTable(currentuser);
}

function addProductToTable(user) {
	var table = document.getElementsByClassName('listSanPham')[0];

	var s = `
		<tbody>
			<tr>
				<th>STT</th>
				<th>Sản phẩm</th>
				<th>Giá</th>
				<th>Số lượng</th>
				<th>Thành tiền</th>
				<th>Thời gian</th>
				<th>Xóa</th>
			</tr>`;

	if (!user) {
		s += `
			<tr>
				<td colspan="7"> 
					<h1 style="color:red; background-color:white; font-weight:bold; text-align:center; padding: 15px 0;">
						Bạn chưa đăng nhập !!
					</h1> 
				</td>
			</tr>
		`;
		table.innerHTML = s;
		return;
	} else if (user.products.length == 0) {
		s += `
			<tr>
				<td colspan="7"> 
					<h1 style="color:green; background-color:white; font-weight:bold; text-align:center; padding: 15px 0;">
						Giỏ hàng trống !!
					</h1> 
				</td>
			</tr>
		`;
		table.innerHTML = s;
		return;
	}

	var totalPrice = 0;
	for (var i = 0; i < user.products.length; i++) {
		var masp = user.products[i].ma;
		var soluongSp = user.products[i].soluong;
		var p = timKiemTheoMa(list_products, masp);
		if (!p) {
			s += `<tr><td>` + (i + 1) + `</td><td>Sản phẩm ` + masp + ` không còn bán</td><td colspan="4">Vui lòng xóa sản phẩm này khỏi giỏ hàng</td><td class="noPadding"><i class="fa fa-trash" onclick="xoaSanPhamTrongGioHang(` + i + `)"></i></td></tr>`;
			continue;
		}
		var price = (p.promo.name == 'giareonline' ? p.promo.value : p.price);
		var thoigian = new Date(user.products[i].date).toLocaleString();
		var thanhtien = stringToNum(price) * soluongSp;

		s += `
			<tr>
				<td>` + (i + 1) + `</td>
				<td class="noPadding imgHide">
					<a target="_blank" href="chitietsanpham.html?` + p.name.split(' ').join('-') + `" title="Xem chi tiết">
						` + p.name + `
						<img src="` + p.img + `">
					</a>
				</td>
				<td class="alignRight">` + price + ` ₫</td>
				<td class="soluong" >
					<button onclick="giamSoLuong('` + masp + `')"><i class="fa fa-minus"></i></button>
					<input size="1" onchange="capNhatSoLuongFromInput(this, '` + masp + `')" value=` + soluongSp + `>
					<button onclick="tangSoLuong('` + masp + `')"><i class="fa fa-plus"></i></button>
				</td>
				<td class="alignRight">` + numToString(thanhtien) + ` ₫</td>
				<td style="text-align: center" >` + thoigian + `</td>
				<td class="noPadding"> <i class="fa fa-trash" onclick="xoaSanPhamTrongGioHang(` + i + `)"></i> </td>
			</tr>
		`;
		// Chú ý nháy cho đúng ở giamsoluong, tangsoluong
		totalPrice += thanhtien;
	}

	s += `
			<tr style="font-weight:bold; text-align:center">
				<td colspan="4">TỔNG TIỀN: </td>
				<td class="alignRight">` + numToString(totalPrice) + ` ₫</td>
				<td class="thanhtoan" onclick="thanhToan()"> Thanh Toán </td>
				<td class="xoaHet" onclick="xoaHet()"> Xóa hết </td>
			</tr>
		</tbody>
	`;

	table.innerHTML = s;
}

function xoaSanPhamTrongGioHang(i) {
	if (window.confirm('Xác nhận hủy mua')) {
		currentuser.products.splice(i, 1);
		capNhatMoiThu();
	}
}

async function thanhToan() {
	var c_user = getCurrentUser();
	if(c_user.off) {
        alert('Tài khoản của bạn hiện đang bị khóa nên không thể mua hàng!');
        addAlertBox('Tài khoản của bạn đã bị khóa bởi Admin.', '#aa0000', '#fff', 10000);
        return;
	}
	
	if (!currentuser.products.length) {
		addAlertBox('Không có mặt hàng nào cần thanh toán !!', '#ffb400', '#fff', 2000);
		return;
	}
	if (window.confirm('Thanh toán giỏ hàng ?')) {
		if (window.API) {
			var orderProducts = currentuser.products.map(function(item) {
				var product = timKiemTheoMa(list_products, item.ma);
				if (!product) return null;
				var price = product.promo && product.promo.name === 'giareonline' ? product.promo.value : product.price;
				return {
					ma: item.ma,
					soluong: item.soluong,
					dongia: price
				};
			});
			if (orderProducts.some(function(item) { return !item; })) {
				alert('Có sản phẩm không còn trong danh mục. Hãy tải lại trang và thử lại.');
				return;
			}
			var total = orderProducts.reduce(function(sum, item) {
				return sum + stringToNum(item.dongia) * item.soluong;
			}, 0);
			var defaultName = (currentuser.ho ? currentuser.ho + ' ' : '') + (currentuser.ten || currentuser.username);
			var hoTen = window.prompt('Nhập họ tên người nhận hàng:', defaultName) || defaultName;
			var sdt = window.prompt('Nhập số điện thoại nhận hàng:', '0912345678') || '0912345678';
			var diaChi = window.prompt('Nhập địa chỉ nhận hàng chi tiết:', '280 An Dương Vương, Phường 4, Quận 5, TP.HCM') || '280 An Dương Vương, Phường 4, Quận 5, TP.HCM';

			var response = await API.createOrder({
				username: currentuser.username,
				sp: orderProducts,
				tongtien: numToString(total),
				diaChi: diaChi,
				sdt: sdt,
				hoTenNguoiNhan: hoTen
			});
			if (!response || !response.success) {
				alert(response && response.message ? response.message : 'Không lưu được đơn hàng vào database. Giỏ hàng của bạn vẫn được giữ nguyên.');
				return;
			}
			currentuser.donhang = currentuser.donhang || [];
			currentuser.donhang.push({
				ma: response.maDon,
				sp: currentuser.products,
				ngaymua: new Date(),
				tinhTrang: 'Đang chờ xử lý'
			});
			currentuser.products = [];
			capNhatMoiThu();
			addAlertBox('Đơn hàng đã được lưu và đang chờ xử lý.', '#17c671', '#fff', 4000);
			return;
		}

		currentuser.donhang.push({
			"sp": currentuser.products,
			"ngaymua": new Date(),
			"tinhTrang": 'Đang chờ xử lý'
		});
		currentuser.products = [];
		capNhatMoiThu();
		addAlertBox('Các sản phẩm đã được gửi vào đơn hàng và chờ xử lý.', '#17c671', '#fff', 4000);
	}
}

function xoaHet() {
	if (currentuser.products.length) {
		if (window.confirm('Bạn có chắc chắn muốn xóa hết sản phẩm trong giỏ !!')) {
			currentuser.products = [];
			capNhatMoiThu();
		}
	}
}

// Cập nhật số lượng lúc nhập số lượng vào input
function capNhatSoLuongFromInput(inp, masp) {
	var soLuongMoi = Number(inp.value);
	if (!soLuongMoi || soLuongMoi <= 0) soLuongMoi = 1;

	for (var p of currentuser.products) {
		if (p.ma == masp) {
			p.soluong = soLuongMoi;
		}
	}

	capNhatMoiThu();
}

function tangSoLuong(masp) {
	for (var p of currentuser.products) {
		if (p.ma == masp) {
			p.soluong++;
		}
	}

	capNhatMoiThu();
}

function giamSoLuong(masp) {
	for (var p of currentuser.products) {
		if (p.ma == masp) {
			if (p.soluong > 1) {
				p.soluong--;
			} else {
				return;
			}
		}
	}

	capNhatMoiThu();
}

function capNhatMoiThu() { // Mọi thứ
	animateCartNumber();

	// cập nhật danh sách sản phẩm trong localstorage
	setCurrentUser(currentuser);
	updateListUser(currentuser);

	// cập nhật danh sách sản phẩm ở table
	addProductToTable(currentuser);

	// Cập nhật trên header
	capNhat_ThongTin_CurrentUser();
}

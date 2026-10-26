-- ========================================================
-- SCRIPT TẠO DATABASE VÀ DỮ LIỆU MẪU CHO DOAN_WEB1
-- Chạy trên SQL Server Management Studio (SSMS)
-- ========================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'WebDienThoaiDB')
BEGIN
    CREATE DATABASE WebDienThoaiDB;
END
GO

USE WebDienThoaiDB;
GO

-- 1. Bảng Admin
IF OBJECT_ID('Admins', 'U') IS NOT NULL DROP TABLE Admins;
CREATE TABLE Admins (
    Username NVARCHAR(50) PRIMARY KEY,
    Password NVARCHAR(255) NOT NULL
);

-- 2. Bảng Users (Khách hàng)
IF OBJECT_ID('OrderDetails', 'U') IS NOT NULL DROP TABLE OrderDetails;
IF OBJECT_ID('Orders', 'U') IS NOT NULL DROP TABLE Orders;
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) UNIQUE NOT NULL,
    Password NVARCHAR(255) NOT NULL,
    Ho NVARCHAR(100),
    Ten NVARCHAR(100),
    Email NVARCHAR(255),
    IsLocked BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 3. Bảng Products (Sản phẩm)
IF OBJECT_ID('Products', 'U') IS NOT NULL DROP TABLE Products;
CREATE TABLE Products (
    MaSP NVARCHAR(50) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Company NVARCHAR(100) NOT NULL,
    Img NVARCHAR(MAX),
    Price NVARCHAR(50),
    Star INT DEFAULT 0,
    RateCount INT DEFAULT 0,
    PromoName NVARCHAR(50),
    PromoValue NVARCHAR(50),
    Screen NVARCHAR(255),
    OS NVARCHAR(255),
    Camara NVARCHAR(255),
    CamaraFront NVARCHAR(255),
    CPU NVARCHAR(255),
    RAM NVARCHAR(50),
    ROM NVARCHAR(50),
    MicroUSB NVARCHAR(255),
    Battery NVARCHAR(100)
);

-- 4. Bảng Orders (Đơn hàng)
CREATE TABLE Orders (
    MaDon NVARCHAR(100) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL,
    NgayMua DATETIME DEFAULT GETDATE(),
    TongTien NVARCHAR(50),
    TinhTrang NVARCHAR(100) DEFAULT N'Đang chờ xử lý',
    DiaChi NVARCHAR(500) NULL,
    SDT NVARCHAR(20) NULL,
    HoTenNguoiNhan NVARCHAR(200) NULL
);

-- 5. Bảng OrderDetails (Chi tiết đơn hàng)
CREATE TABLE OrderDetails (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    MaDon NVARCHAR(100) FOREIGN KEY REFERENCES Orders(MaDon) ON DELETE CASCADE,
    MaSP NVARCHAR(50) FOREIGN KEY REFERENCES Products(MaSP),
    SoLuong INT NOT NULL,
    DonGia NVARCHAR(50)
);
GO

-- NẠP DỮ LIỆU ADMIN
INSERT INTO Admins (Username, Password) VALUES ('admin', 'adadad');

-- NẠP DỮ LIỆU KHÁCH HÀNG MẪU
INSERT INTO Users (Username, Password, Ho, Ten, Email, IsLocked) 
VALUES 
(N'user1', N'123456', N'Nguyễn', N'Văn A', N'vana@gmail.com', 0),
(N'user2', N'123456', N'Trần', N'Thị B', N'thib@gmail.com', 0);
GO

-- NẠP DỮ LIỆU SẢN PHẨM (50 sản phẩm)
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Sam0', N'SamSung Galaxy J4+', N'Samsung', N'img/products/samsung-galaxy-j4-plus-pink-400x400.jpg', N'3.490.000', 3, 26, N'tragop', N'0', N'IPS LCD, 6.0'', HD+', N'Android 8.1 (Oreo)', N'13 MP', N'5 MP', N'Qualcomm Snapdragon 425 4 nhân 64-bit', N'2 GB', N'16 GB', N'MicroSD, hỗ trợ tối đa 256 GB', N'3300 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Xia0', N'Xiaomi Mi 8 Lite', N'Xiaomi', N'img/products/xiaomi-mi-8-lite-black-1-600x600.jpg', N'6.690.000', 0, 0, N'tragop', N'0', N'IPS LCD, 6.26'', Full HD+', N'Android 8.1 (Oreo)', N'12 MP và 5 MP (2 camera)', N'24 MP', N'Qualcomm Snapdragon 660 8 nhân', N'4 GB', N'64 GB', N'MicroSD, hỗ trợ tối đa 512 GB', N'3300 mAh, có sạc nhanh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Opp0', N'Oppo F9', N'Oppo', N'img/products/oppo-f9-red-600x600.jpg', N'7.690.000', 5, 188, N'giamgia', N'500.000', N'LTPS LCD, 6.3'', Full HD+', N'ColorOS 5.2 (Android 8.1)', N'16 MP và 2 MP (2 camera)', N'25 MP', N'MediaTek Helio P60 8 nhân 64-bit', N'4 GB', N'64 GB', N'MicroSD, hỗ trợ tối đa 256 GB', N'3500 mAh, có sạc nhanh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Nok0', N'Nokia 5.1 Plus', N'Nokia', N'img/products/nokia-51-plus-black-18thangbh-400x400.jpg', N'4.790.000', 5, 7, N'giamgia', N'250.000', N'IPS LCD, 5.8'', HD+', N'Android One', N'13 MP và 5 MP (2 camera)', N'8 MP', N'MediaTek Helio P60 8 nhân 64-bit', N'3 GB', N'32 GB', N'MicroSD, hỗ trợ tối đa 256 GB', N'3060 mAh, có sạc nhanh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Sam1', N'Samsung Galaxy A8+ (2018)', N'Samsung', N'img/products/samsung-galaxy-a8-plus-2018-gold-600x600.jpg', N'11.990.000', 0, 0, N'giamgia', N'1.500.000', N'Super AMOLED, 6'', Full HD+', N'Android 7.1 (Nougat)', N'16 MP', N'16 MP và 8 MP (2 camera)', N'Exynos 7885 8 nhân 64-bit', N'6 GB', N'64 GB', N'MicroSD, hỗ trợ tối đa 256 GB', N'3500 mAh, có sạc nhanh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'App0', N'iPhone X 256GB Silver', N'Apple', N'img/products/iphone-x-256gb-silver-400x400.jpg', N'31.990.000', 4, 10, N'giareonline', N'27.990.000', N'OLED, 5.8'', Super Retina', N'iOS 11', N'2 camera 12 MP', N'7 MP', N'Apple A11 Bionic 6 nhân', N'3 GB', N'256 GB', N'Không', N'2716 mAh, có sạc nhanh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Opp1', N'Oppo A3s 32GB', N'Oppo', N'img/products/oppo-a3s-32gb-600x600.jpg', N'4.690.000', 0, 0, N'tragop', N'0', N'IPS LCD, 6.2'', HD+', N'Android 8.1 (Oreo)', N'13 MP và 2 MP (2 camera)', N'8 MP', N'Qualcomm Snapdragon 450 8 nhân 64-bit', N'3 GB', N'32 GB', N'MicroSD, hỗ trợ tối đa 256 GB', N'4230 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Sam2', N'Samsung Galaxy J8', N'Samsung', N'img/products/samsung-galaxy-j8-600x600-600x600.jpg', N'6.290.000', 0, 0, N'giamgia', N'500.000', N'Super AMOLED, 6.0'', HD+', N'Android 8.0 (Oreo)', N'16 MP và 5 MP (2 camera)', N'16 MP', N'Qualcomm Snapdragon 450 8 nhân 64-bit', N'3 GB', N'32 GB', N'MicroSD, hỗ trợ tối đa 256 GB', N'3500 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'App1', N'iPad 2018 Wifi 32GB', N'Apple', N'img/products/ipad-wifi-32gb-2018-thumb-600x600.jpg', N'8.990.000', 0, 0, N'tragop', N'0', N'LED-backlit LCD, 9.7p''''', N'	iOS 11.3', N'8 MP', N'1.2 MP', N'Apple A10 Fusion, 2.34 GHz', N'2 GB', N'32 GB', N'Không', N'Chưa có thông số cụ thể');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'App2', N'iPhone 7 Plus 32GB', N'Apple', N'img/products/iphone-7-plus-32gb-hh-600x600.jpg', N'17.000.000', 0, 0, N'giareonline', N'16.990.000', N'LED-backlit IPS LCD, 5.5'', Retina HD', N'iOS 11', N'2 camera 12 MP', N'7 MP', N'Apple A10 Fusion 4 nhân 64-bit', N'3 GB', N'32 GB', N'Không', N'2900 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Xia1', N'Xiaomi Mi 8', N'Xiaomi', N'img/products/xiaomi-mi-8-1-600x600.jpg', N'12.990.000', 0, 0, N'', N'0', N'IPS LCD, 6.26'', Full HD+', N'Android 8.1 (Oreo)', N'12 MP và 5 MP (2 camera)', N'24 MP', N'Qualcomm Snapdragon 660 8 nhân', N'4 GB', N'64 GB', N'MicroSD, hỗ trợ tối đa 512 GB', N'3300 mAh, có sạc nhanh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Mob0', N'Mobiistar X', N'Mobiistar', N'img/products/mobiistar-x-3-600x600.jpg', N'3.490.000', 4, 16, N'tragop', N'0', N'IPS LCD, 5.86'', HD+', N'Android 8.1 (Oreo)', N'16 MP và 5 MP (2 camera)', N'16 MP', N'MediaTek MT6762 8 nhân 64-bit (Helio P22)', N'4 GB', N'32 GB', N'MicroSD, hỗ trợ tối đa 256 GB', N'3000 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Mob1', N'Mobiistar Zumbo S2 Dual', N'Mobiistar', N'img/products/mobiistar-zumbo-s2-dual-300x300.jpg', N'2.850.000', 4, 104, N'moiramat', N'', N'IPS LCD, 5.5'', Full HD', N'Android 7.0 (Nougat)', N'13 MP', N'13 MP và 8 MP (2 camera)', N'MT6737T, 4 nhân', N'3 GB', N'32 GB', N'MicroSD, hỗ trợ tối đa 128 GB', N'3000 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Mob2', N'Mobiistar E Selfie', N'Mobiistar', N'img/products/mobiistar-e-selfie-300-1copy-600x600.jpg', N'2.490.000', 4, 80, N'', N'', N'IPS LCD, 6.0'', HD+', N'Android 7.0 (Nougat)', N'13 MP', N'13 MP', N'MediaTek MT6739 4 nhân 64-bit', N'2 GB', N'16 GB', N'MicroSD, hỗ trợ tối đa 128 GB', N'3900 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Mob3', N'Mobiistar B310', N'Mobiistar', N'img/products/mobiistar-b310-orange-600x600.jpg', N'260.000', 5, 87, N'moiramat', N'', N'LCD, 1.8'', QQVGA', N'Không', N'0.08 MP', N'Không', N'Không', N'Không', N'Không', N'MicroSD, hỗ trợ tối đa 32 GB', N'800 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Xia2', N'Xiaomi Redmi Note 5', N'Xiaomi', N'img/products/xiaomi-redmi-note-5-pro-600x600.jpg', N'5.690.000', 4, 372, N'moiramat', N'', N'IPS LCD, 5.99'', Full HD+', N'Android 8.1 (Oreo)', N'12 MP và 5 MP (2 camera)', N'13 MP', N'Qualcomm Snapdragon 636 8 nhân', N'4 GB', N'64 GB', N'MicroSD, hỗ trợ tối đa 128 GB', N'4000 mAh, có sạc nhanh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Xia3', N'Xiaomi Redmi 5 Plus 4GB', N'Xiaomi', N'img/products/xiaomi-redmi-5-plus-600x600.jpg', N'4.790.000', 4, 347, N'', N'', N'IPS LCD, 5.99'', Full HD+', N'Android 7.1 (Nougat)', N'12 MP', N'5 MP', N'Snapdragon 625 8 nhân 64-bit', N'4 GB', N'64 GB', N'MicroSD, hỗ trợ tối đa 256 GB', N'4000 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Hua0', N'Huawei Mate 20 Pro', N'Huawei', N'img/products/huawei-mate-20-pro-green-600x600.jpg', N'21.990.000', 5, 4, N'tragop', N'0', N'OLED, 6.39'', Quad HD+ (2K+)', N'Android 9.0 (Pie)', N'40 MP, 20 MP và 8 MP (3 camera)', N'24 MP', N'Hisilicon Kirin 980 8 nhân 64-bit', N'6 GB', N'128 GB', N'NM card, hỗ trợ tối đa 512 GB', N'4200 mAh, có sạc nhanh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Hua1', N'Huawei Nova 3', N'Huawei', N'img/products/huawei-nova-3-2-600x600.jpg', N'9.990.000', 4, 22, N'tragop', N'0', N'LTPS LCD, 6.3'', Full HD+', N'Android 8.1 (Oreo)', N'24 MP và 16 MP (2 camera)', N'24 MP và 2 MP (2 camera)', N'Hisilicon Kirin 970 8 nhân', N'6 GB', N'128 GB', N'MicroSD, hỗ trợ tối đa 256 GB', N'3750 mAh, có sạc nhanh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Hua2', N'Huawei Y5 2017', N'Huawei', N'img/products/huawei-y5-2017-300x300.jpg', N'1.990.000', 5, 54, N'', N'', N'IPS LCD, 5'', HD', N'Android 6.0 (Marshmallow)', N'8 MP', N'5 MP', N'MT6737T, 4 nhân', N'2 GB', N'16 GB', N'MicroSD, hỗ trợ tối đa 128 GB', N'3000 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Nok1', N'Nokia black future', N'Nokia', N'https://cdn.tgdd.vn/Products/Images/42/22701/dien-thoai-di-dong-Nokia-1280-dienmay.com-l.jpg', N'999.999.000', 5, 9999, N'giamgia', N'1.000', N'4K, Chống nước, Chống trầy', N'iOS + Android song song', N'Bộ tứ camara tàng hình', N'Chuẩn thế giới 50MP', N'16 nhân 128 bit', N'Không giới hạn', N'Dùng thoải mái', N'Không cần', N'Không cần sạc');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Sam3', N'Samsung Galaxy A7 (2018)', N'Samsung', N'https://cdn.tgdd.vn/Products/Images/42/194327/samsung-galaxy-a7-2018-128gb-black-400x400.jpg', N'8.990.000', 4, 22, N'tragop', N'0', N'Super AMOLED, 6.0'', Full HD+', N'Android 8.0 (Oreo)', N'24 MP, 8 MP và 5 MP (3 camera)', N'24 MP', N'Exynos 7885 8 nhân 64-bit', N'4 GB', N'64 GB', N'MicroSD, hỗ trợ tối đa 512 GB', N'3300 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Rea0', N'Realme 2 Pro 8GB/128GB', N'Realme', N'https://cdn.tgdd.vn/Products/Images/42/192002/oppo-realme-2-pro-black-600x600.jpg', N'6.990.000', 5, 16, N'moiramat', N'', N'IPS LCD, 6.3'', Full HD+', N'ColorOS 5.2 (Android 8.1)', N'16 MP và 2 MP (2 camera)', N'16 MP', N'Qualcomm Snapdragon 660 8 nhân', N'8 GB', N'128 GB', N'MicroSD, hỗ trợ tối đa 256 GB', N'3500 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Rea1', N'Realme 2 4GB/64GB', N'Realme', N'https://cdn.tgdd.vn/Products/Images/42/193462/realme-2-4gb-64gb-docquyen-600x600.jpg', N'4.490.000', 5, 7, N'moiramat', N'', N'IPS LCD, 6.2'', HD+', N'Android 8.1 (Oreo)', N'13 MP và 2 MP (2 camera)', N'8 MP', N'Qualcomm Snapdragon 450 8 nhân 64-bit', N'4 GB', N'64 GB', N'MicroSD, hỗ trợ tối đa 256 GB', N'4230 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Rea2', N'Realme C1', N'Realme', N'https://cdn.tgdd.vn/Products/Images/42/193286/realme-c1-black-600x600.jpg', N'2.490.000', 4, 4, N'moiramat', N'', N'IPS LCD, 6.2'', HD+', N'Android 8.1 (Oreo)', N'13 MP và 2 MP (2 camera)', N'5 MP', N'Qualcomm Snapdragon 450 8 nhân 64-bit', N'2 GB', N'16 GB', N'MicroSD, hỗ trợ tối đa 256 GB', N'4230 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Rea3', N'Realme 2 Pro 4GB/64GB', N'Realme', N'https://cdn.tgdd.vn/Products/Images/42/193464/realme-2-pro-4gb-64gb-blue-600x600.jpg', N'5.590.000', 4, 11, N'moiramat', N'', N'IPS LCD, 6.3'', Full HD+', N'ColorOS 5.2 (Android 8.1)', N'16 MP và 2 MP (2 camera)', N'16 MP', N'Qualcomm Snapdragon 660 8 nhân', N'4 GB', N'64 GB', N'MicroSD, hỗ trợ tối đa 256 GB', N'3500 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Phi0', N'Philips E331', N'Philips', N'https://cdn.tgdd.vn/Products/Images/42/139742/philips-e331-xenium-300-300x300.jpg', N'890.000', 5, 6, N'', N'', N'TFT, 2.4'', QVGA', N'Không', N'0.3 MP', N'Không', N'Không', N'Không', N'Không', N'MicroSD, hỗ trợ tối đa 16 GB', N'1600 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Phi1', N'Philips S329', N'Philips', N'https://cdn.tgdd.vn/Products/Images/42/143146/philips-s329-2-300x300.jpg', N'2.390.000', 3, 30, N'', N'', N'IPS LCD, 5'', HD', N'Android 7.0 (Nougat)', N'13 MP', N'5 MP', N'Mediatek MT6750 8 nhân', N'3 GB', N'16 GB', N'MicroSD, hỗ trợ tối đa 64 GB', N'3000 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Phi2', N'Philips E103', N'Philips', N'https://cdn.tgdd.vn/Products/Images/42/73727/philips-e103-9-300x300.jpg', N'260.000', 5, 126, N'', N'', N'TFT, 1.77'', 65.536 màu', N'Không', N'Không', N'Không', N'Không', N'Không', N'Không', N'Không', N'1050 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Viv0', N'Vivo V11', N'Vivo', N'https://cdn.tgdd.vn/Products/Images/42/188828/vivo-v11-600x600.jpg', N'10.990.000', 0, 0, N'tragop', N'0', N'Super AMOLED, 6.41'', Full HD+', N'Android 8.1 (Oreo)', N'12 MP và 5 MP (2 camera)', N'25 MP', N'Qualcomm Snapdragon 660 8 nhân', N'6 GB', N'128 GB', N'MicroSD, hỗ trợ tối đa 256 GB', N'3400 mAh, có sạc nhanh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Viv1', N'Vivo V9', N'Vivo', N'https://cdn.tgdd.vn/Products/Images/42/155047/vivo-v9-2-1-600x600-600x600.jpg', N'7.490.000', 5, 168, N'giamgia', N'800.000', N'IPS LCD, 6.3'', Full HD+', N'Android 8.1 (Oreo)', N'16 MP và 5 MP (2 camera)', N'24 MP', N'Snapdragon 626 8 nhân 64-bit', N'4 GB', N'64 GB', N'MicroSD, hỗ trợ tối đa 256 GB', N'3260 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Viv2', N'Vivo Y85', N'Vivo', N'https://cdn.tgdd.vn/Products/Images/42/156205/vivo-y85-red-docquyen-600x600.jpg', N'4.990.000', 4, 60, N'giamgia', N'500.000', N'IPS LCD, 6.22'', HD+', N'Android 8.1 (Oreo)', N'13 MP và 2 MP (2 camera)', N'8 MP', N'MediaTek MT6762 8 nhân 64-bit (Helio P22)', N'4 GB', N'32 GB', N'MicroSD, hỗ trợ tối đa 256 GB', N'3260 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Viv3', N'Vivo Y71', N'Vivo', N'https://cdn.tgdd.vn/Products/Images/42/158585/vivo-y71-docquyen-600x600.jpg', N'3.290.000', 4, 60, N'tragop', N'0', N'IPS LCD, 6.0'', HD+', N'Android 8.1 (Oreo)', N'13 MP', N'5 MP', N'Qualcomm Snapdragon 425 4 nhân 64-bit', N'3 GB', N'16 GB', N'MicroSD, hỗ trợ tối đa 256 GB', N'3360 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Mobe0', N'Mobell M789', N'Mobell', N'https://cdn.tgdd.vn/Products/Images/42/92016/mobell-m789-8-300x300.jpg', N'550.000', 4, 37, N'', N'', N'TFT, 2.4'', 65.536 màu', N'Không', N'Không', N'Không', N'Không', N'Không', N'Không', N'Không', N'1200 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Mobe1', N'Mobell Rock 3', N'Mobell', N'https://cdn.tgdd.vn/Products/Images/42/112837/mobell-rock-3-2-300x300.jpg', N'590.000', 4, 58, N'', N'', N'TFT, 2.4'', 65.536 màu', N'Không', N'Không', N'Không', N'Không', N'Không', N'Không', N'Không', N'5000 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Mobe2', N'Mobell S60', N'Mobell', N'https://cdn.tgdd.vn/Products/Images/42/193271/mobell-s60-red-1-600x600.jpg', N'1.790.000', 0, 0, N'moiramat', N'', N'LCD, 5.5'', FWVGA', N'Android 8.1 (Oreo)', N'8 MP và 2 MP (2 camera)', N'5 MP', N'MT6580 4 nhân 32-bit', N'1 GB', N'16 GB', N'MicroSD, hỗ trợ tối đa 32 GB', N'2650 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Ite0', N'Itel P32', N'Itel', N'https://cdn.tgdd.vn/Products/Images/42/186851/itel-p32-gold-600x600.jpg', N'1.890.000', 4, 12, N'', N'', N'IPS LCD, 5.45'', qHD', N'Android 8.1 (Oreo)', N'5 MP và 0.3 MP (2 camera)', N'5 MP', N'MT6580 4 nhân 32-bit', N'1 GB', N'8 GB', N'MicroSD, hỗ trợ tối đa 32 GB', N'4000 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Ite1', N'Itel A32F', N'Itel', N'https://cdn.tgdd.vn/Products/Images/42/193990/itel-a32f-pink-gold-600x600.jpg', N'1.350.000', 5, 3, N'moiramat', N'', N'TFT, 5'', FWVGA', N'Android Go Edition', N'5 MP', N'2 MP', N'MediaTek MT6580 4 nhân 32-bit', N'1 GB', N'8 GB', N'MicroSD, hỗ trợ tối đa 32 GB', N'2050 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Ite2', N'Itel it2123', N'Itel', N'https://cdn.tgdd.vn/Products/Images/42/146651/itel-it2123-d-300-300x300.jpg', N'160.000', 5, 302, N'', N'', N'TFT, 1.77'', 65.536 màu', N'Không', N'Không', N'Không', N'Không', N'Không', N'Không', N'Không', N'1000 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Ite3', N'Itel it2161', N'Itel', N'https://cdn.tgdd.vn/Products/Images/42/193989/itel-it2161-600x600.jpg', N'170.000', 5, 33, N'moiramat', N'', N'TFT, 1.77'', WVGA', N'Không', N'Không', N'Không', N'Không', N'Không', N'Không', N'MicroSD, hỗ trợ tối đa 32 GB', N'1000 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Coo0', N'Coolpad N3D', N'Coolpad', N'https://cdn.tgdd.vn/Products/Images/42/193504/coolpad-n3d-blue-600x600.jpg', N'2.390.000', 0, 0, N'moiramat', N'', N'IPS LCD, 5.45'', HD+', N'Android 8.1 (Oreo)', N'8 MP và 0.3 MP (2 camera)', N'5 MP', N'Spreadtrum SC9850K 4 nhân', N'2 GB', N'16 GB', N'MicroSD, hỗ trợ tối đa 32 GB', N'2500 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Coo1', N'Coolpad N3', N'Coolpad', N'https://cdn.tgdd.vn/Products/Images/42/193502/coolpad-n3-gray-1-600x600.jpg', N'1.890.000', 3, 3, N'moiramat', N'', N'IPS LCD, 5.45'', HD+', N'Android Go Edition', N'5 MP và 0.3 MP (2 camera)', N'2 MP', N'Spreadtrum SC9850K 4 nhân', N'1 GB', N'16 GB', N'MicroSD, hỗ trợ tối đa 32 GB', N'2300 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Coo2', N'Coolpad N3 mini', N'Coolpad', N'https://cdn.tgdd.vn/Products/Images/42/193503/coolpad-n3-mini-600x600.jpg', N'1.390.000', 4, 2, N'moiramat', N'', N'IPS LCD, 5'', WVGA', N'Android Go Edition', N'5 MP và 0.3 MP (2 camera)', N'2 MP', N'MT6580 4 nhân 32-bit', N'1 GB', N'8 GB', N'MicroSD, hỗ trợ tối đa 32 GB', N'2000 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'HTC0', N'HTC U12 life', N'HTC', N'https://cdn.tgdd.vn/Products/Images/42/186397/htc-u12-life-1-600x600.jpg', N'7.690.000', 4, 12, N'moiramat', N'', N'Super LCD, 6'', Full HD+', N'Android 8.1 (Oreo)', N'16 MP và 5 MP (2 camera)', N'13 MP', N'Qualcomm Snapdragon 636 8 nhân', N'4 GB', N'64 GB', N'MicroSD, hỗ trợ tối đa 512 GB', N'3600 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Mot0', N'Motorola Moto C 4G', N'Motorola', N'https://cdn.tgdd.vn/Products/Images/42/109099/motorola-moto-c-4g-300-300x300.jpg', N'1.290.000', 4, 14, N'', N'', N'TFT, 5'', FWVGA', N'Android 7.1 (Nougat)', N'5 MP', N'2 MP', N'MT6737 4 nhân', N'1 GB', N'16 GB', N'MicroSD, hỗ trợ tối đa 32 GB', N'2350 mAh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'App3', N'iPhone Xr 128GB', N'Apple', N'https://cdn.tgdd.vn/Products/Images/42/191483/iphone-xr-128gb-red-600x600.jpg', N'24.990.000', 0, 0, N'giareonline', N'22.990.000', N'IPS LCD, 6.1'', IPS LCD, 16 triệu màu', N'iOS 12', N'12 MP', N'7 MP', N'Apple A12 Bionic 6 nhân', N'3 GB', N'128 GB', N'Không', N'2942 mAh, có sạc nhanh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'App4', N'iPhone 8 Plus 64GB', N'Apple', N'https://cdn.tgdd.vn/Products/Images/42/114110/iphone-8-plus-hh-600x600.jpg', N'20.990.000', 5, 230, N'tragop', N'0', N'LED-backlit IPS LCD, 5.5'', Retina HD', N'iOS 11', N'2 camera 12 MP', N'7 MP', N'Apple A11 Bionic 6 nhân', N'3 GB', N'64 GB', N'Không', N'2691 mAh, có sạc nhanh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'App5', N'iPhone 8 Plus 256GB', N'Apple', N'https://cdn.tgdd.vn/Products/Images/42/114114/iphone-8-plus-256gb-red-600x600.jpg', N'25.790.000', 5, 16, N'giamgia', N'500.000', N'LED-backlit IPS LCD, 4.7'', Retina HD', N'iOS 11', N'12 MP', N'7 MP', N'Apple A11 Bionic 6 nhân', N'2 GB', N'256 GB', N'Không', N'1821 mAh, có sạc nhanh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'App6', N'iPhone Xr 64GB', N'Apple', N'https://cdn.tgdd.vn/Products/Images/42/190325/iphone-xr-black-400x460.png', N'22.990.000', 4, 5, N'giareonline', N'19.990.000', N'IPS LCD, 6.1'', IPS LCD, 16 triệu màu', N'iOS 12', N'12 MP', N'7 MP', N'Apple A12 Bionic 6 nhân', N'3 GB', N'64 GB', NULL, N'2942 mAh, có sạc nhanh');
INSERT INTO Products (MaSP, Name, Company, Img, Price, Star, RateCount, PromoName, PromoValue, Screen, OS, Camara, CamaraFront, CPU, RAM, ROM, MicroUSB, Battery)
VALUES (N'Hua3', N'Huawei Nova 2i', N'Huawei', N'https://cdn.tgdd.vn/Products/Images/42/157031/samsung-galaxy-a6-2018-2-600x600.jpg', N'4.490.000', 4, 804, N'giareonline', N'3.990.000', N'IPS LCD, 5.9'', Full HD+', N'Android 7.0 (Nougat)', N'16 MP và 2 MP (2 camera)', N'13 MP và 2 MP (2 camera)', N'HiSilicon Kirin 659 8 nhân', N'4 GB', N'64 GB', N'MicroSD, hỗ trợ tối đa 128 GB', N'3340 mAh');

GO

PRINT 'Khoi tao database WebDienThoaiDB va nap du lieu thanh cong!';

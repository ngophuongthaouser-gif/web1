-- Migration: Thêm cột địa chỉ giao hàng vào bảng Orders
USE WebDienThoaiDB;
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Orders') AND name = N'DiaChi')
BEGIN
    ALTER TABLE Orders ADD DiaChi NVARCHAR(500) NULL;
    PRINT 'Đã thêm cột DiaChi vào bảng Orders';
END
ELSE
    PRINT 'Cột DiaChi đã tồn tại';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Orders') AND name = N'SDT')
BEGIN
    ALTER TABLE Orders ADD SDT NVARCHAR(20) NULL;
    PRINT 'Đã thêm cột SDT vào bảng Orders';
END
ELSE
    PRINT 'Cột SDT đã tồn tại';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Orders') AND name = N'HoTenNguoiNhan')
BEGIN
    ALTER TABLE Orders ADD HoTenNguoiNhan NVARCHAR(200) NULL;
    PRINT 'Đã thêm cột HoTenNguoiNhan vào bảng Orders';
END
ELSE
    PRINT 'Cột HoTenNguoiNhan đã tồn tại';
GO

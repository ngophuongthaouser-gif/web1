#!/bin/bash
# ============================================================
# Script khởi tạo Database tự động khi deploy lên AWS
# Chạy sau khi docker compose up -d --build
# ============================================================

set -e

DB_PASSWORD="${DB_PASSWORD:-Password123!}"
MAX_WAIT=120
ELAPSED=0

echo "⏳ Chờ SQL Server khởi động..."
until docker exec webdienthoai-mssql /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P "$DB_PASSWORD" -C \
    -Q "SELECT 1" > /dev/null 2>&1; do
    sleep 5
    ELAPSED=$((ELAPSED+5))
    echo "  Đã chờ ${ELAPSED}s..."
    if [ $ELAPSED -ge $MAX_WAIT ]; then
        echo "❌ Timeout: SQL Server không khởi động sau ${MAX_WAIT}s. Kiểm tra logs: docker logs webdienthoai-mssql"
        exit 1
    fi
done

echo "✅ SQL Server đã sẵn sàng!"
echo "📥 Đang nạp dữ liệu Database..."

docker exec -i webdienthoai-mssql /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P "$DB_PASSWORD" -C \
    < backend/sql/setup_database.sql

echo "🎉 Database đã khởi tạo xong!"
echo "🌐 Truy cập website tại: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'IP_EC2'):5000"

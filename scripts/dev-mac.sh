#!/bin/bash

# Lấy đường dẫn thư mục hiện tại
PROJECT_ROOT=$(pwd)

# Mở một Tab mới cho Backend
osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_ROOT' && bun dev:api\""

# Mở một Tab mới cho Frontend
osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_ROOT' && bun dev:web\""

echo "🚀 Đã khởi động Backend và Frontend trong các cửa sổ Terminal riêng biệt!"

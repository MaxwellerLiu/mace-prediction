#!/bin/bash

echo "=============================================="
echo "MACE预测系统 - 启动脚本"
echo "=============================================="

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python3，请先安装Python3"
    exit 1
fi

# 检查依赖
echo "检查依赖..."
python3 -c "import flask" 2>/dev/null || {
    echo "安装依赖..."
    pip3 install -r requirements.txt
}

# 启动服务器
echo ""
echo "启动服务器..."
echo "访问地址: http://localhost:5000"
echo "按 Ctrl+C 停止服务器"
echo "=============================================="

python3 server.py

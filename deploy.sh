#!/bin/bash

echo "=============================================="
echo "MACE预测系统 - 一键部署脚本"
echo "=============================================="
echo ""

# 检测部署方式
if [ "$1" = "vercel" ]; then
    echo "🚀 部署到 Vercel..."
    
    # 检查是否安装vercel
    if ! command -v vercel &> /dev/null; then
        echo "正在安装 Vercel CLI..."
        npm install -g vercel
    fi
    
    # 部署
    vercel --prod
    
elif [ "$1" = "netlify" ]; then
    echo "🚀 部署到 Netlify..."
    
    # 检查是否安装netlify
    if ! command -v netlify &> /dev/null; then
        echo "正在安装 Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # 部署
    netlify deploy --prod --dir=.
    
elif [ "$1" = "docker" ]; then
    echo "🐳 构建 Docker 镜像..."
    
    # 检查是否安装docker
    if ! command -v docker &> /dev/null; then
        echo "❌ 请先安装 Docker"
        exit 1
    fi
    
    # 构建并运行
    docker build -t mace-predictor .
    echo ""
    echo "✅ 镜像构建完成"
    echo "运行命令: docker run -d -p 5000:5000 mace-predictor"
    
elif [ "$1" = "local" ]; then
    echo "💻 本地运行 Flask 服务器..."
    
    # 检查Python依赖
    python3 -c "import flask" 2>/dev/null || {
        echo "安装依赖..."
        pip3 install -r requirements.txt
    }
    
    echo "启动服务器..."
    python3 server.py
    
else
    echo "使用方法: ./deploy.sh [方式]"
    echo ""
    echo "可用方式:"
    echo "  ./deploy.sh local      - 本地运行 (http://localhost:5000)"
    echo "  ./deploy.sh vercel     - 部署到 Vercel (推荐)"
    echo "  ./deploy.sh netlify    - 部署到 Netlify"
    echo "  ./deploy.sh docker     - Docker部署"
    echo ""
    echo "示例:"
    echo "  ./deploy.sh local      # 本地测试"
    echo "  ./deploy.sh vercel     # 公开部署"
    echo ""
fi

#!/bin/bash

echo "🚀 FitPlan Lite - 启动脚本"
echo "================================"

# 检查是否安装了 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到 Python 3，请先安装 Python 3"
    exit 1
fi

# 检查是否安装了 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查是否安装了 PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ 未找到 PostgreSQL，请先安装 PostgreSQL"
    exit 1
fi

echo "✅ 环境检查通过"

# 检查数据库是否存在
echo "🔍 检查数据库是否存在..."
psql -lqt | cut -d \| -f 1 | grep -w "fitplan" > /dev/null

if [ $? -ne 0 ]; then
    echo "📦 创建数据库..."
    createdb fitplan
    echo "✅ 数据库创建成功"
else
    echo "✅ 数据库已存在"
fi

# 创建表
echo "📝 创建数据库表..."
psql -d fitplan -f schema.sql

if [ $? -eq 0 ]; then
    echo "✅ 表创建成功"
else
    echo "❌ 表创建失败，请检查 schema.sql 文件"
    exit 1
fi

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend || exit 1
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ 后端依赖安装成功"
else
    echo "❌ 后端依赖安装失败"
    exit 1
fi

# 安装前端依赖
echo "📦 安装前端依赖..."
cd ../frontend || exit 1
npm install

if [ $? -eq 0 ]; then
    echo "✅ 前端依赖安装成功"
else
    echo "❌ 前端依赖安装失败"
    exit 1
fi

cd ..

echo ""
echo "🎉 FitPlan Lite 初始化完成！"
echo ""
echo "📖 使用说明："
echo "1. 启动后端：cd backend && python3 main.py"
echo "2. 启动前端：cd frontend && npm run dev"
echo "3. 访问应用：http://localhost:3000"
echo ""
echo "🔧 配置文件："
echo "- 后端配置：backend/.env"
echo "- 前端配置：frontend/.env.local"

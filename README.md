# FitPlan Lite - 运动训练计划 + 日程 + 完成率

FitPlan Lite 是一个简单易用的运动训练计划管理应用，支持创建训练计划、查看日程、打卡完成情况，并提供基于本周表现的下周模板生成功能。

## 技术栈

- **前端**: Next.js (App Router) + TypeScript + TailwindCSS
- **后端**: FastAPI + Python
- **数据库**: PostgreSQL

## 功能特性

- 📊 **本周概览**: 查看完成率、动作统计和每周进度
- 📅 **训练计划编辑**: 创建和修改一周训练安排
- 📝 **日程管理**: 日历和列表两种视图查看训练安排
- ✅ **打卡功能**: 标记训练日完成状态
- 🔄 **模板生成**: 根据本周表现自动生成下周训练模板

## 快速开始

### 1. 环境准备

确保您已安装以下工具：
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL (v14+)

### 2. 一键启动（推荐）

使用自动启动脚本简化初始化：

```bash
chmod +x start.sh
./start.sh
```

### 3. 手动启动

如果自动脚本无法正常工作，可以手动执行以下步骤：

#### 3.1 数据库配置

创建 PostgreSQL 数据库：
```bash
createdb fitplan
```

执行数据库初始化：
```bash
psql -d fitplan -f schema.sql
```

添加示例数据（可选）：
```bash
psql -d fitplan -f seed_data.sql
```

#### 3.2 后端启动

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

后端将在 `http://localhost:8000` 启动

#### 3.3 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端将在 `http://localhost:3000` 启动

### 4. 访问应用

1. 访问前端应用：`http://localhost:3000`
2. 访问后端API文档：`http://localhost:8000/docs`

## 项目结构

```
FitPlan/
├── frontend/          # Next.js 前端
│   ├── app/           # App Router 页面
│   │   ├── layout.tsx # 根布局
│   │   ├── page.tsx   # Dashboard 页面
│   │   ├── plan/      # 计划编辑页面
│   │   ├── schedule/  # 日程页面
│   │   └── day/       # 训练日详情页面
│   ├── components/    # React 组件
│   ├── services/      # API 服务
│   ├── types/         # TypeScript 类型定义
│   └── package.json   # 前端依赖
├── backend/           # FastAPI 后端
│   ├── main.py        # 主入口文件
│   ├── database.py    # 数据库连接和模型
│   ├── models.py      # Pydantic 模型
│   ├── crud.py        # 数据库操作
│   └── requirements.txt # 后端依赖
├── schema.sql         # 数据库架构
├── seed_data.sql      # 示例数据
├── start.sh           # 一键启动脚本
├── .env.example       # 环境变量示例
└── README.md          # 项目文档
```

## 核心业务规则

### 周定义
- 每周从周一开始
- 计划按周开始日期唯一标识

### 完成率计算
- 只统计训练日（非休息日）
- 公式：完成训练日数 / 总训练日数

### 下周模板生成
- 完成率 ≥0.8：训练日 +1（最多5天），每个训练日4个动作
- 0.5 ≤ 完成率 <0.8：训练日数不变，每个训练日3个动作
- 完成率 <0.5：固定3天训练（周一/周三/周五），每个训练日3个动作

## 演示路径

1. 创建本周计划
2. 查看日历安排
3. 打卡完成训练日
4. 查看Dashboard完成率变化
5. 生成下周训练模板
6. 应用模板创建下周计划

## 联系方式

如有问题，请提交 Issue 或联系开发者。
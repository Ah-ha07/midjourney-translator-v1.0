# Midjourney提示词翻译平台

一个专门用于翻译和存储Midjourney提示词的中文平台，帮助用户学习AI绘画技巧。

## 功能特性

- 🔄 **智能翻译** - 调用DeepSeek API翻译Midjourney提示词
- 🖼️ **图片管理** - 上传和管理Midjourney生成的图片
- 📚 **学习平台** - 浏览优秀案例和提示词技巧
- 🎨 **科技风格UI** - 现代化的用户界面设计

## 技术栈

- **前端**: React + Ant Design
- **后端**: Node.js + Express
- **数据库**: MongoDB
- **文件存储**: 本地存储

## 快速开始

1. 安装依赖
```bash
npm run install-all
```

2. 配置环境变量
```bash
cp server/.env.example server/.env
# 编辑 .env 文件，添加 DeepSeek API 密钥
```

3. 启动开发服务器
```bash
npm run dev
```

4. 访问应用
- 前端: http://localhost:3000
- 后端: http://localhost:5000

## 项目结构

```
├── client/          # React前端应用
├── server/          # Node.js后端API
├── package.json     # 根项目配置
└── README.md        # 项目说明
```

## 开发阶段

- [x] 第一阶段：核心翻译功能
- [ ] 第二阶段：图片管理功能
- [ ] 第三阶段：学习平台功能
- [ ] 第四阶段：部署和优化

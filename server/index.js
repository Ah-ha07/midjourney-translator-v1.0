const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet());

// 信任代理设置（解决rate-limit警告）
app.set('trust proxy', 1);

// CORS配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static('uploads'));

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/midjourney-translator')
  .then(() => console.log('✅ MongoDB连接成功'))
  .catch(err => console.error('❌ MongoDB连接失败:', err));

// 路由
app.use('/api/translate', require('./routes/translate'));
app.use('/api/prompts', require('./routes/prompts'));  // 提示词管理路由
app.use('/api/images', require('./routes/images'));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后再试'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📱 前端地址: http://localhost:3000`);
  console.log(`🔧 API地址: http://localhost:${PORT}/api`);
});

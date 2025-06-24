const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();

// 中间件配置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

// 导入路由
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const categoryRoutes = require('./routes/category.routes');
const tagRoutes = require('./routes/tag.routes');

// 设置API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);

// 根路由
app.get('/', (req, res) => {
  res.json({ message: '欢迎使用博客API服务' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || '服务器内部错误'
  });
});

// 连接MongoDB数据库
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB数据库连接成功');
  
  // 启动服务器
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器运行在端口: ${PORT}，监听所有网络接口`);
  });
})
.catch(err => {
  console.error('MongoDB连接失败:', err.message);
  process.exit(1);
});

// 处理未捕获的异常
process.on('unhandledRejection', (err) => {
  console.log('未处理的Promise拒绝:', err);
  // 关闭服务器并退出进程
  process.exit(1);
});
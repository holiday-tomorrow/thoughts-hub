# 博客API服务器

这是一个使用Node.js、Express和MongoDB构建的个人博客后端API服务。

## 功能特点

### 文章管理
- 文章发布/编辑/删除
- 文章分类/标签系统
- 草稿自动保存
- Markdown编辑器支持
- 文章置顶功能

### 用户系统
- 用户注册/登录/注销
- 个人资料管理
- 密码重置

### 内容展示
- 文章列表分页
- 文章详情页
- 分类/标签归档页
- 时间轴归档
- 搜索功能

## 项目结构

```
src/
  ├── config/         # 配置文件
  ├── controllers/    # 控制器
  ├── middlewares/    # 中间件
  ├── models/         # 数据模型
  ├── routes/         # 路由
  ├── services/       # 服务
  ├── utils/          # 工具函数
  └── index.js        # 入口文件
```

## 安装与运行

### 前提条件
- Node.js (v14+)
- MongoDB

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run dev
```

### 生产环境运行
```bash
npm start
```

## API文档

启动服务后，访问 `/api-docs` 路径查看详细的API文档。

## 环境变量

创建 `.env` 文件并配置以下环境变量：

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blog
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# 邮件发送配置
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=your_email@example.com
EMAIL_FROM_NAME=思想中心
```
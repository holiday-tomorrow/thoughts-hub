const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// 保护路由中间件 - 验证用户是否已登录
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 从请求头中获取令牌
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 检查令牌是否存在
    if (!token) {
      return res.status(401).json({
        success: false,
        error: '未授权访问，请登录'
      });
    }

    try {
      // 验证令牌
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 获取用户信息
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: '找不到该用户'
        });
      }

      // 将用户信息添加到请求对象
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: '令牌无效或已过期'
      });
    }
  } catch (error) {
    next(error);
  }
};

// 角色授权中间件
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '未授权访问，请登录'
      });
    }

    // 检查用户角色是否有权限
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: '您没有权限执行此操作'
      });
    }

    next();
  };
};
const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  logout, 
  getMe, 
  forgotPassword, 
  resetPassword, 
  updatePassword,
  sendRegisterCode,
  sendLoginCode,
  sendResetCode
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

// 发送注册验证码
router.post('/send-register-code', sendRegisterCode);

// 用户注册
router.post('/register', register);

// 发送登录验证码
router.post('/send-login-code', sendLoginCode);

// 用户登录
router.post('/login', login);

// 用户登出
router.get('/logout', logout);

// 获取当前登录用户信息
router.get('/me', protect, getMe);

// 发送重置密码验证码
router.post('/send-reset-code', sendResetCode);

// 忘记密码
router.post('/forgot-password', forgotPassword);

// 重置密码
router.put('/reset-password/:resetToken', resetPassword);

// 更新密码
router.put('/update-password', protect, updatePassword);

module.exports = router;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const { sendVerificationEmail, generateVerificationCode } = require('../utils/email');

// 生成JWT令牌
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    发送注册验证码
// @route   POST /api/auth/send-register-code
// @access  公开
exports.sendRegisterCode = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: '请提供邮箱地址'
      });
    }

    // 检查邮箱是否已被注册
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: '该邮箱已被注册'
      });
    }

    // 生成验证码
    const verificationCode = generateVerificationCode();

    // 创建临时用户或更新现有临时用户
    let user = await User.findOne({ email, isVerified: false });
    if (!user) {
      user = new User({ email });
    }

    // 设置验证码
    user.setVerificationCode();
    await user.save({ validateBeforeSave: false });

    // 发送验证码邮件
    await sendVerificationEmail(email, user.verificationCode.code, 'register');

    res.status(200).json({
      success: true,
      message: '验证码已发送到您的邮箱'
    });
  } catch (error) {
    console.error('发送验证码失败:', error);
    next(error);
  }
};

// @desc    注册用户
// @route   POST /api/auth/register
// @access  公开
exports.register = async (req, res, next) => {
  try {
    const { email, code, username, password } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: '请提供邮箱和验证码'
      });
    }

    // 查找未验证的用户
    const user = await User.findOne({ email, isVerified: false });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: '请先获取验证码'
      });
    }

    // 验证验证码
    if (!user.verifyCode(code)) {
      return res.status(400).json({
        success: false,
        error: '验证码无效或已过期'
      });
    }

    // 检查用户名是否已存在
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          error: '该用户名已被使用'
        });
      }
    }

    // 更新用户信息
    user.username = username || `user_${Date.now().toString().slice(-6)}`;
    if (password) {
      user.password = password;
    }
    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    // 生成JWT令牌
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    发送登录验证码
// @route   POST /api/auth/send-login-code
// @access  公开
exports.sendLoginCode = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: '请提供邮箱地址'
      });
    }

    // 检查用户是否存在
    const user = await User.findOne({ email, isVerified: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '该邮箱未注册或未验证'
      });
    }

    // 设置验证码
    const code = user.setVerificationCode();
    await user.save({ validateBeforeSave: false });

    // 发送验证码邮件
    await sendVerificationEmail(email, code, 'login');

    res.status(200).json({
      success: true,
      message: '验证码已发送到您的邮箱'
    });
  } catch (error) {
    console.error('发送验证码失败:', error);
    next(error);
  }
};

// @desc    用户登录
// @route   POST /api/auth/login
// @access  公开
exports.login = async (req, res, next) => {
  try {
    const { email, password, code } = req.body;

    // 验证输入
    if (!email || (!password && !code)) {
      return res.status(400).json({
        success: false,
        error: '请提供邮箱和密码或验证码'
      });
    }

    // 查找用户
    const user = await User.findOne({ email, isVerified: true }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '邮箱未注册或未验证'
      });
    }

    let isAuthenticated = false;

    // 验证码登录
    if (code) {
      isAuthenticated = user.verifyCode(code);
      if (!isAuthenticated) {
        return res.status(401).json({
          success: false,
          error: '验证码无效或已过期'
        });
      }
      // 清除验证码
      user.verificationCode = undefined;
      await user.save({ validateBeforeSave: false });
    } 
    // 密码登录
    else if (password) {
      isAuthenticated = await user.matchPassword(password);
      if (!isAuthenticated) {
        return res.status(401).json({
          success: false,
          error: '邮箱或密码不正确'
        });
      }
    }

    // 生成JWT令牌
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    用户登出
// @route   GET /api/auth/logout
// @access  私有
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: '登出成功'
  });
};

// @desc    获取当前登录用户信息
// @route   GET /api/auth/me
// @access  私有
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    发送重置密码验证码
// @route   POST /api/auth/send-reset-code
// @access  公开
exports.sendResetCode = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: '请提供邮箱地址'
      });
    }

    // 检查用户是否存在
    const user = await User.findOne({ email, isVerified: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '该邮箱未注册或未验证'
      });
    }

    // 设置验证码
    const code = user.setVerificationCode();
    await user.save({ validateBeforeSave: false });

    // 发送验证码邮件
    await sendVerificationEmail(email, code, 'reset');

    res.status(200).json({
      success: true,
      message: '验证码已发送到您的邮箱'
    });
  } catch (error) {
    console.error('发送验证码失败:', error);
    next(error);
  }
};

// @desc    忘记密码
// @route   POST /api/auth/forgot-password
// @access  公开
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: '请提供邮箱和验证码'
      });
    }

    // 查找用户
    const user = await User.findOne({ email, isVerified: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '该邮箱未注册或未验证'
      });
    }

    // 验证验证码
    if (!user.verifyCode(code)) {
      return res.status(401).json({
        success: false,
        error: '验证码无效或已过期'
      });
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 加密令牌并设置过期时间
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10分钟
    user.verificationCode = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      resetToken,
      message: '验证成功，请重置密码'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    重置密码
// @route   PUT /api/auth/reset-password/:resetToken
// @access  公开
exports.resetPassword = async (req, res, next) => {
  try {
    // 获取令牌并加密
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    // 查找有效的重置令牌
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: '无效或已过期的令牌'
      });
    }

    // 设置新密码
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // 生成新的JWT令牌
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      message: '密码重置成功'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    更新密码
// @route   PUT /api/auth/update-password
// @access  私有
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 获取当前用户（包含密码字段）
    const user = await User.findById(req.user.id).select('+password');

    // 验证当前密码
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: '当前密码不正确'
      });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    // 生成新的JWT令牌
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      message: '密码更新成功'
    });
  } catch (error) {
    next(error);
  }
};
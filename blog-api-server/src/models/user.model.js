const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    minlength: [3, '用户名至少需要3个字符'],
    maxlength: [20, '用户名不能超过20个字符']
  },
  email: {
    type: String,
    required: [true, '请提供邮箱'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, '请提供有效的邮箱地址']
  },
  password: {
    type: String,
    minlength: [6, '密码至少需要6个字符'],
    select: false
  },
  avatar: {
    type: String,
    default: 'default-avatar.jpg'
  },
  bio: {
    type: String,
    maxlength: [200, '个人简介不能超过200个字符']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    code: String,
    expiresAt: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  thirdPartyAuth: {
    wechat: {
      id: String,
      token: String
    },
    qq: {
      id: String,
      token: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  // 只有在密码被修改时才进行加密
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // 生成盐
    const salt = await bcrypt.genSalt(10);
    // 加密密码
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码的方法
UserSchema.methods.matchPassword = async function(enteredPassword) {
  // 如果用户没有设置密码，则无法通过密码验证
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// 设置验证码的方法
UserSchema.methods.setVerificationCode = function() {
  // 生成6位数字验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 设置验证码和过期时间（10分钟后过期）
  this.verificationCode = {
    code: code,
    expiresAt: Date.now() + 10 * 60 * 1000
  };
  
  return code;
};

// 验证验证码的方法
UserSchema.methods.verifyCode = function(code) {
  // 检查验证码是否存在、是否匹配、是否过期
  return (
    this.verificationCode &&
    this.verificationCode.code === code &&
    this.verificationCode.expiresAt > Date.now()
  );
};

// 生成JWT的方法将在auth服务中实现

module.exports = mongoose.model('User', UserSchema);
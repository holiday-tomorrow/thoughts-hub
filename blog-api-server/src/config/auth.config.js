const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: LocalStrategy } = require('passport-local');
const User = require('../models/user.model');

// JWT策略配置
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

// 本地策略配置（用户名密码验证）
const localOptions = {
  usernameField: 'email',
  passwordField: 'password'
};

// 配置本地策略
const configureLocalStrategy = () => {
  passport.use(new LocalStrategy(localOptions, async (email, password, done) => {
    try {
      // 查找用户
      const user = await User.findOne({ email }).select('+password');
      
      // 用户不存在
      if (!user) {
        return done(null, false, { message: '邮箱或密码不正确' });
      }
      
      // 验证密码
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return done(null, false, { message: '邮箱或密码不正确' });
      }
      
      // 密码正确，返回用户（不包含密码）
      user.password = undefined;
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
};

// 配置JWT策略
const configureJwtStrategy = () => {
  passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      // 根据JWT中的ID查找用户
      const user = await User.findById(jwtPayload.id);
      
      if (!user) {
        return done(null, false);
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));
};

// 初始化Passport认证策略
const initializeAuth = () => {
  configureLocalStrategy();
  configureJwtStrategy();
};

module.exports = {
  initializeAuth,
  jwtOptions
};
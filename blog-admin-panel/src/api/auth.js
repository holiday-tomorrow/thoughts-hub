import request from './request';

// 发送注册验证码
export function sendRegisterCode(data) {
  return request({
    url: '/auth/send-register-code',
    method: 'post',
    data
  });
}

// 用户注册
export function register(data) {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  });
}

// 发送登录验证码
export function sendLoginCode(data) {
  return request({
    url: '/auth/send-login-code',
    method: 'post',
    data
  });
}

// 用户登录
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  });
}

// 用户登出
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'get'
  });
}

// 获取当前登录用户信息
export function getMe() {
  return request({
    url: '/auth/me',
    method: 'get'
  });
}

// 发送重置密码验证码
export function sendResetCode(data) {
  return request({
    url: '/auth/send-reset-code',
    method: 'post',
    data
  });
}

// 忘记密码
export function forgotPassword(data) {
  return request({
    url: '/auth/forgot-password',
    method: 'post',
    data
  });
}

// 重置密码
export function resetPassword(resetToken, data) {
  return request({
    url: `/auth/reset-password/${resetToken}`,
    method: 'put',
    data
  });
}

// 更新密码
export function updatePassword(data) {
  return request({
    url: '/auth/update-password',
    method: 'put',
    data
  });
}
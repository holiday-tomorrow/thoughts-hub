import request from './request';

// 获取所有用户（管理员权限）
export function getUsers(params) {
  return request({
    url: '/users',
    method: 'get',
    params
  });
}

// 获取当前用户资料
export function getUserProfile() {
  return request({
    url: '/users/profile',
    method: 'get'
  });
}

// 更新用户资料
export function updateUserProfile(data) {
  return request({
    url: '/users/profile',
    method: 'put',
    data
  });
}

// 更新特定用户（管理员权限）
export function updateUser(id, data) {
  return request({
    url: `/users/${id}`,
    method: 'put',
    data
  });
}

// 删除用户
export function deleteUser(id) {
  // 如果提供了id，则删除特定用户（管理员权限）
  if (id) {
    return request({
      url: `/users/${id}`,
      method: 'delete'
    });
  }
  // 否则删除当前用户资料
  return request({
    url: '/users/profile',
    method: 'delete'
  });
}

// 更新用户头像
export function updateAvatar(data) {
  return request({
    url: '/users/avatar',
    method: 'put',
    data
  });
}
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { login, logout, getMe } from '../api/auth';
import { ElMessage } from 'element-plus';

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '');
  const userInfo = ref(JSON.parse(localStorage.getItem('user') || '{}'));
  const isLoggedIn = ref(!!token.value);

  // 登录
  async function loginAction(loginData) {
    try {
      const response = await login(loginData);
      if (response.success) {
        token.value = response.token;
        userInfo.value = response.user;
        isLoggedIn.value = true;
        
        // 保存到本地存储
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        ElMessage.success('登录成功');
        return true;
      }
      return false;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    }
  }

  // 登出
  async function logoutAction() {
    try {
      await logout();
      resetState();
      ElMessage.success('登出成功');
      return true;
    } catch (error) {
      console.error('登出失败:', error);
      return false;
    }
  }

  // 获取用户信息
  async function getUserInfo() {
    try {
      const response = await getMe();
      if (response.success) {
        userInfo.value = response.data;
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }

  // 重置状态
  function resetState() {
    token.value = '';
    userInfo.value = {};
    isLoggedIn.value = false;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    loginAction,
    logoutAction,
    getUserInfo,
    resetState
  };
});
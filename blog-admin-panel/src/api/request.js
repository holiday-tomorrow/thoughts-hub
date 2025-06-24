import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建axios实例
const service = axios.create({
  baseURL: '/api', // API基础URL
  timeout: 10000 // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    console.log('发送请求:', config.url, config.method);
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    // 如果有token则添加到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    console.log('收到响应:', response.config.url, response.status);
    const res = response.data;
    console.log('响应数据:', res);
    // 如果响应成功但业务状态码不为成功
    if (!res.success && res.error) {
      ElMessage.error(res.error || '请求失败');
      return Promise.reject(new Error(res.error || '请求失败'));
    }
    return res;
  },
  error => {
    console.error('响应错误:', error);
    console.error('错误详情:', error.response?.data);
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录已过期，请重新登录');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else {
      // 处理其他错误
      ElMessage.error(error.response?.data?.error || '请求失败');
    }
    return Promise.reject(error);
  }
);

export default service;
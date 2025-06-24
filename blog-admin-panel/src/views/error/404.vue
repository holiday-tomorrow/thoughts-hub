<template>
  <div class="error-container">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <div class="error-image">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
          <path fill="#e6e6e6" d="M190 100c0 49.71-40.29 90-90 90S10 149.71 10 100 50.29 10 100 10s90 40.29 90 90z"/>
          <path fill="#cccccc" d="M100 20c-44.18 0-80 35.82-80 80s35.82 80 80 80 80-35.82 80-80-35.82-80-80-80zm0 150c-38.66 0-70-31.34-70-70s31.34-70 70-70 70 31.34 70 70-31.34 70-70 70z"/>
          <path fill="#f5f5f5" d="M100 40c-33.14 0-60 26.86-60 60s26.86 60 60 60 60-26.86 60-60-26.86-60-60-60zm-20 90c-8.28 0-15-6.72-15-15s6.72-15 15-15 15 6.72 15 15-6.72 15-15 15zm40 0c-8.28 0-15-6.72-15-15s6.72-15 15-15 15 6.72 15 15-6.72 15-15 15z"/>
          <path fill="#ff6b6b" d="M120 140H80c-2.76 0-5-2.24-5-5s2.24-5 5-5h40c2.76 0 5 2.24 5 5s-2.24 5-5 5z"/>
        </svg>
      </div>
      <h2 class="error-title">页面不存在</h2>
      <p class="error-desc">抱歉，您访问的页面不存在或已被删除</p>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="goBack">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.error-content {
  text-align: center;
  padding: 40px;
  max-width: 500px;
}

.error-code {
  font-size: 80px;
  font-weight: bold;
  color: #409eff;
  margin: 0;
  line-height: 1;
}

.error-image {
  margin: 20px auto;
  width: 200px;
  height: 200px;
}

.error-title {
  font-size: 24px;
  color: #303133;
  margin: 20px 0 10px;
}

.error-desc {
  font-size: 16px;
  color: #606266;
  margin-bottom: 30px;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style>
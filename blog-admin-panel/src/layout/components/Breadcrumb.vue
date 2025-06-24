<template>
  <el-breadcrumb separator="/" class="app-breadcrumb">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
      <span v-if="index === breadcrumbs.length - 1" class="no-redirect">{{ item.meta.title }}</span>
      <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const breadcrumbs = ref([]);

// 获取面包屑数据
const getBreadcrumbs = () => {
  // 过滤掉没有meta.title的路由
  const matched = route.matched.filter(item => item.meta && item.meta.title);
  
  // 如果第一个路由不是根路由，添加首页
  if (matched[0].path !== '/dashboard') {
    matched.unshift({
      path: '/dashboard',
      meta: { title: '首页' }
    });
  }
  
  breadcrumbs.value = matched;
};

// 处理链接点击
const handleLink = (item) => {
  router.push(item.path);
};

// 监听路由变化，更新面包屑
watch(
  () => route.path,
  () => getBreadcrumbs(),
  { immediate: true }
);
</script>

<style scoped>
.app-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 60px;
}

.app-breadcrumb a {
  color: #666;
  cursor: pointer;
}

.app-breadcrumb .no-redirect {
  color: #97a8be;
  cursor: text;
}
</style>
<template>
  <div class="sidebar-logo-container" :class="{ 'collapse': isCollapse }">
    <transition name="sidebar-logo-fade">
      <router-link v-if="isCollapse" key="collapse" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo" alt="Logo" />
        <h1 v-else class="sidebar-title">{{ title.charAt(0) }}</h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo" alt="Logo" />
        <h1 class="sidebar-title">{{ title }}</h1>
      </router-link>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  isCollapse: {
    type: Boolean,
    required: true
  }
});

// 系统Logo和标题
const logo = computed(() => {
  // 这里可以返回实际的Logo图片路径
  // 如果没有Logo，可以返回null或空字符串
  return null;
});

const title = computed(() => {
  return '博客管理系统';
});
</script>

<style lang="scss" scoped>
.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  background: #2b2f3a;
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;

    & .sidebar-logo {
      width: 32px;
      height: 32px;
      vertical-align: middle;
      margin-right: 12px;
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: #fff;
      font-weight: 600;
      line-height: 50px;
      font-size: 18px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      vertical-align: middle;
    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0;
    }
  }
}

.sidebar-logo-fade-enter-active,
.sidebar-logo-fade-leave-active {
  transition: opacity 0.3s;
}

.sidebar-logo-fade-enter-from,
.sidebar-logo-fade-leave-to {
  opacity: 0;
}
</style>
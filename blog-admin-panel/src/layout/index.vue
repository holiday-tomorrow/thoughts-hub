<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <div class="sidebar-container" :class="{ 'is-collapsed': isCollapse }">
      <div class="logo-container">
        <img src="../assets/logo.svg" alt="Logo" class="logo" />
        <h1 v-show="!isCollapse">博客管理系统</h1>
      </div>
      <el-scrollbar>
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :unique-opened="true"
          :collapse-transition="false"
          class="sidebar-menu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          router
        >
          <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" />
        </el-menu>
      </el-scrollbar>
    </div>
    
    <!-- 主区域 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <div class="navbar">
        <div class="left-menu">
          <el-icon class="hamburger" @click="toggleSidebar">
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
          <breadcrumb />
        </div>
        <div class="right-menu">
          <el-dropdown trigger="click">
            <div class="avatar-container">
              <el-avatar :size="30" :src="userInfo.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
              <span class="username">{{ userInfo.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/profile/index')">
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 主内容区 -->
      <div class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { ElMessageBox } from 'element-plus';
import { ArrowDown, User, SwitchButton, Expand, Fold } from '@element-plus/icons-vue';
import SidebarItem from './components/SidebarItem.vue';
import Breadcrumb from './components/Breadcrumb.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 用户信息
const userInfo = computed(() => userStore.userInfo);

// 侧边栏折叠状态
const isCollapse = ref(false);

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value;
};

// 获取路由
const routes = computed(() => {
  return router.options.routes.filter(route => !route.meta?.hidden);
});

// 当前激活的菜单
const activeMenu = computed(() => {
  const { meta, path } = route;
  if (meta.activeMenu) {
    return meta.activeMenu;
  }
  return path;
});

// 处理登出
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await userStore.logoutAction();
    router.push('/login');
  }).catch(() => {});
};
</script>

<style scoped>
.app-wrapper {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.sidebar-container {
  width: 210px;
  height: 100%;
  background-color: #304156;
  transition: width 0.28s;
  overflow: hidden;
}

.sidebar-container.is-collapsed {
  width: 64px;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  background-color: #2b3649;
  overflow: hidden;
}

.logo {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}

.logo-container h1 {
  color: #fff;
  font-size: 18px;
  margin: 0;
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.navbar {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  background-color: #fff;
}

.left-menu {
  display: flex;
  align-items: center;
}

.hamburger {
  font-size: 20px;
  cursor: pointer;
  margin-right: 15px;
}

.right-menu {
  display: flex;
  align-items: center;
}

.avatar-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 5px;
  color: #606266;
}

.app-main {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background-color: #f0f2f5;
}

/* 过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
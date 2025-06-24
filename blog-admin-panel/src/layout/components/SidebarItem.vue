<template>
  <div v-if="!item.meta || !item.meta.hidden">
    <!-- 如果有子路由且只有一个可见的子路由 -->
    <template v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)">
          <el-icon v-if="onlyOneChild.meta && onlyOneChild.meta.icon">
            <component :is="onlyOneChild.meta.icon" />
          </el-icon>
          <template #title>
            <span>{{ onlyOneChild.meta.title }}</span>
          </template>
        </el-menu-item>
      </app-link>
    </template>
    
    <!-- 如果有多个子路由或强制显示子菜单 -->
    <el-sub-menu v-else :index="resolvePath(item.path)">
      <template #title>
        <el-icon v-if="item.meta && item.meta.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item.meta.title }}</span>
      </template>
      
      <!-- 递归渲染子菜单 -->
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </el-sub-menu>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { isExternal } from '../../utils/validate';
import AppLink from './Link.vue';
import path from 'path-browserify';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  basePath: {
    type: String,
    default: ''
  }
});

const onlyOneChild = ref(null);

// 判断是否只有一个显示的子路由
const hasOneShowingChild = (children = [], parent) => {
  if (!children) {
    children = [];
  }
  
  const showingChildren = children.filter(item => {
    if (item.meta && item.meta.hidden) {
      return false;
    } else {
      // 递归过滤
      onlyOneChild.value = item;
      return true;
    }
  });
  
  // 如果只有一个子路由，则返回true
  if (showingChildren.length === 1) {
    return true;
  }
  
  // 如果没有子路由，则显示父路由
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true };
    return true;
  }
  
  return false;
};

// 解析路径
const resolvePath = (routePath) => {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }
  return path.resolve(props.basePath, routePath);
};
</script>
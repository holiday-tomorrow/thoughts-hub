import { createRouter, createWebHistory } from 'vue-router';

// 布局组件
const Layout = () => import('../layout/index.vue');

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      }
    ]
  },
  {
    path: '/posts',
    component: Layout,
    redirect: '/posts/list',
    meta: { title: '文章管理', icon: 'Document' },
    children: [
      {
        path: 'list',
        name: 'PostsList',
        component: () => import('../views/posts/list.vue'),
        meta: { title: '文章列表' }
      },
      {
        path: 'create',
        name: 'PostsCreate',
        component: () => import('../views/posts/edit.vue'),
        meta: { title: '创建文章' }
      },
      {
        path: 'edit/:id',
        name: 'PostsEdit',
        component: () => import('../views/posts/edit.vue'),
        meta: { title: '编辑文章', hidden: true }
      }
    ]
  },
  {
    path: '/categories',
    component: Layout,
    redirect: '/categories/list',
    meta: { title: '分类管理', icon: 'Folder' },
    children: [
      {
        path: 'list',
        name: 'CategoriesList',
        component: () => import('../views/categories/index.vue'),
        meta: { title: '分类列表' }
      }
    ]
  },
  {
    path: '/tags',
    component: Layout,
    redirect: '/tags/list',
    meta: { title: '标签管理', icon: 'Collection' },
    children: [
      {
        path: 'list',
        name: 'TagsList',
        component: () => import('../views/tags/index.vue'),
        meta: { title: '标签列表' }
      }
    ]
  },
  {
    path: '/users',
    component: Layout,
    redirect: '/users/list',
    meta: { title: '用户管理', icon: 'User' },
    children: [
      {
        path: 'list',
        name: 'UsersList',
        component: () => import('../views/users/index.vue'),
        meta: { title: '用户列表' }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    meta: { hidden: true },
    children: [
      {
        path: 'index',
        name: 'Profile',
        component: () => import('../views/profile/index.vue'),
        meta: { title: '个人中心', icon: 'UserFilled' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('../views/error/404.vue'),
    meta: { hidden: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 博客管理系统` : '博客管理系统';
  
  // 获取token
  const token = localStorage.getItem('token');
  
  // 如果访问登录页且已有token，重定向到首页
  if (to.path === '/login' && token) {
    next({ path: '/' });
    return;
  }
  
  // 如果访问非登录页且没有token，重定向到登录页
  if (to.path !== '/login' && !token) {
    next({ path: '/login' });
    return;
  }
  
  next();
});

export default router;
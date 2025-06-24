<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>文章总数</span>
              <el-icon class="card-icon"><Document /></el-icon>
            </div>
          </template>
          <div class="card-content">
            <div class="stat-value">{{ stats.totalPosts }}</div>
            <div class="stat-desc">已发布文章数量</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>分类总数</span>
              <el-icon class="card-icon"><Folder /></el-icon>
            </div>
          </template>
          <div class="card-content">
            <div class="stat-value">{{ stats.totalCategories }}</div>
            <div class="stat-desc">已创建分类数量</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>标签总数</span>
              <el-icon class="card-icon"><PriceTag /></el-icon>
            </div>
          </template>
          <div class="card-content">
            <div class="stat-value">{{ stats.totalTags }}</div>
            <div class="stat-desc">已创建标签数量</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>用户总数</span>
              <el-icon class="card-icon"><User /></el-icon>
            </div>
          </template>
          <div class="card-content">
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-desc">注册用户数量</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="dashboard-row">
      <!-- 最近文章 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>最近发布的文章</span>
              <el-button type="primary" size="small" @click="$router.push('/posts/create')">写文章</el-button>
            </div>
          </template>
          <div class="recent-posts">
            <el-table :data="recentPosts" style="width: 100%" v-loading="loading.posts">
              <el-table-column prop="title" label="标题" min-width="180">
                <template #default="{row}">
                  <el-link type="primary" @click="$router.push(`/posts/edit/${row._id}`)">{{ row.title }}</el-link>
                </template>
              </el-table-column>
              <el-table-column prop="category.name" label="分类" width="100" />
              <el-table-column prop="createdAt" label="发布时间" width="160">
                <template #default="{row}">
                  {{ formatDate(row.createdAt) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      
      <!-- 草稿箱 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>草稿箱</span>
              <el-button type="primary" size="small" @click="$router.push('/posts/create')">新建草稿</el-button>
            </div>
          </template>
          <div class="draft-posts">
            <el-table :data="draftPosts" style="width: 100%" v-loading="loading.drafts">
              <el-table-column prop="title" label="标题" min-width="180">
                <template #default="{row}">
                  <el-link type="primary" @click="$router.push(`/posts/edit/${row._id}`)">{{ row.title || '无标题草稿' }}</el-link>
                </template>
              </el-table-column>
              <el-table-column prop="updatedAt" label="最后更新" width="160">
                <template #default="{row}">
                  {{ formatDate(row.updatedAt) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="{row}">
                  <el-button type="primary" size="small" @click="$router.push(`/posts/edit/${row._id}`)">编辑</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Document, Folder, PriceTag, User } from '@element-plus/icons-vue';
import { getPosts } from '../../api/post';
import { getCategories } from '../../api/category';
import { getTags } from '../../api/tag';
import { getUsers } from '../../api/user';
import { formatDate } from '../../utils/validate';

// 统计数据
const stats = reactive({
  totalPosts: 0,
  totalCategories: 0,
  totalTags: 0,
  totalUsers: 0
});

// 最近文章和草稿
const recentPosts = ref([]);
const draftPosts = ref([]);

// 加载状态
const loading = reactive({
  posts: false,
  drafts: false,
  stats: false
});

// 获取统计数据
const fetchStats = async () => {
  loading.stats = true;
  try {
    // 获取文章总数
    const postsResponse = await getPosts({ limit: 1, page: 1 });
    if (postsResponse.success) {
      stats.totalPosts = postsResponse.pagination.total || 0;
    }
    
    // 获取分类总数
    const categoriesResponse = await getCategories();
    if (categoriesResponse.success) {
      stats.totalCategories = categoriesResponse.data?.length || 0;
    }
    
    // 获取标签总数
    const tagsResponse = await getTags();
    if (tagsResponse.success) {
      stats.totalTags = tagsResponse.data?.length || 0;
    }
    
    // 获取用户总数
    const usersResponse = await getUsers();
    if (usersResponse.success) {
      stats.totalUsers = usersResponse.data?.length || 0;
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
  } finally {
    loading.stats = false;
  }
};

// 获取最近文章
const fetchRecentPosts = async () => {
  loading.posts = true;
  try {
    const response = await getPosts({ limit: 5, page: 1, status: 'published' });
    if (response.success) {
      recentPosts.value = response.data || [];
    }
  } catch (error) {
    console.error('获取最近文章失败:', error);
  } finally {
    loading.posts = false;
  }
};

// 获取草稿箱
const fetchDraftPosts = async () => {
  loading.drafts = true;
  try {
    const response = await getPosts({ limit: 5, page: 1, status: 'draft' });
    if (response.success) {
      draftPosts.value = response.data || [];
    }
  } catch (error) {
    console.error('获取草稿箱失败:', error);
  } finally {
    loading.drafts = false;
  }
};

// 页面加载时获取数据
onMounted(() => {
  fetchStats();
  fetchRecentPosts();
  fetchDraftPosts();
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-row {
  margin-top: 20px;
}

.stat-card {
  height: 100%;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-icon {
  font-size: 20px;
  color: #409EFF;
}

.card-content {
  text-align: center;
  padding: 10px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-desc {
  font-size: 14px;
  color: #909399;
}

.dashboard-card {
  height: 100%;
  margin-bottom: 20px;
}

.recent-posts, .draft-posts {
  min-height: 300px;
}
</style>
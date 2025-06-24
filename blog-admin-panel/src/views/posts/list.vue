<template>
  <div class="post-list-container">
    <div class="page-header">
      <h2>文章管理</h2>
      <el-button type="primary" @click="$router.push('/posts/create')">
        <el-icon><Plus /></el-icon>写文章
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-container">
      <el-input
        v-model="searchQuery"
        placeholder="搜索文章标题"
        class="filter-item"
        @keyup.enter="handleSearch"
        clearable
      >
        <template #append>
          <el-button @click="handleSearch">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>

      <el-select
        v-model="filters.category"
        placeholder="选择分类"
        clearable
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in categories"
          :key="item._id"
          :label="item.name"
          :value="item._id"
        />
      </el-select>

      <el-select
        v-model="filters.status"
        placeholder="文章状态"
        clearable
        class="filter-item"
        @change="handleFilter"
      >
        <el-option label="已发布" value="published" />
        <el-option label="草稿" value="draft" />
      </el-select>

      <el-button type="primary" @click="handleFilter" class="filter-item">
        筛选
      </el-button>
      <el-button @click="resetFilter" class="filter-item">
        重置
      </el-button>
    </div>

    <!-- 文章列表 -->
    <el-table
      v-loading="loading"
      :data="postList"
      border
      style="width: 100%"
      @sort-change="handleSortChange"
    >
      <el-table-column prop="title" label="标题" min-width="200">
        <template #default="{row}">
          <el-link type="primary" @click="$router.push(`/posts/edit/${row._id}`)">
            {{ row.title || '无标题草稿' }}
          </el-link>
          <el-tag v-if="row.isTop" size="small" type="danger" class="ml-5">置顶</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="category.name" label="分类" width="120">
        <template #default="{row}">
          <el-tag v-if="row.category" size="small">{{ row.category.name }}</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column label="标签" width="180">
        <template #default="{row}">
          <div class="tag-group">
            <el-tag
              v-for="tag in row.tags"
              :key="tag._id"
              size="small"
              class="tag-item"
            >
              {{ tag.name }}
            </el-tag>
            <span v-if="!row.tags || row.tags.length === 0">-</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="100">
        <template #default="{row}">
          <el-tag :type="row.status === 'published' ? 'success' : 'info'">
            {{ row.status === 'published' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createdAt" label="创建时间" width="180" sortable="custom">
        <template #default="{row}">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column prop="updatedAt" label="更新时间" width="180" sortable="custom">
        <template #default="{row}">
          {{ formatDate(row.updatedAt) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{row}">
          <el-button
            size="small"
            type="primary"
            @click="$router.push(`/posts/edit/${row._id}`)"
          >
            编辑
          </el-button>
          <el-button
            size="small"
            type="success"
            v-if="row.status === 'draft'"
            @click="handlePublish(row)"
          >
            发布
          </el-button>
          <el-button
            size="small"
            :type="row.isTop ? 'info' : 'warning'"
            @click="handleToggleTop(row)"
          >
            {{ row.isTop ? '取消置顶' : '置顶' }}
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import { getPosts, deletePost, updatePost, toggleSticky } from '../../api/post';
import { getCategories } from '../../api/category';
import { formatDate } from '../../utils/validate';

// 文章列表数据
const postList = ref([]);
const loading = ref(false);
const categories = ref([]);

// 搜索和筛选
const searchQuery = ref('');
const filters = reactive({
  category: '',
  status: '',
  sort: '',
  order: ''
});

// 分页
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
});

// 获取文章列表
const fetchPosts = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: searchQuery.value,
      category: filters.category,
      status: filters.status
    };
    
    // 添加排序参数
    if (filters.sort) {
      params.sort = filters.sort;
      params.order = filters.order;
    }
    
    const response = await getPosts(params);
    if (response.success) {
      postList.value = response.data || [];
      pagination.total = response.pagination.total || 0;
    }
  } catch (error) {
    console.error('获取文章列表失败:', error);
    ElMessage.error('获取文章列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取所有分类
const fetchCategories = async () => {
  try {
    const response = await getCategories();
    if (response.success) {
      categories.value = response.data || [];
    }
  } catch (error) {
    console.error('获取分类列表失败:', error);
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchPosts();
};

// 筛选
const handleFilter = () => {
  pagination.page = 1;
  fetchPosts();
};

// 重置筛选
const resetFilter = () => {
  searchQuery.value = '';
  Object.keys(filters).forEach(key => {
    filters[key] = '';
  });
  pagination.page = 1;
  fetchPosts();
};

// 排序变化
const handleSortChange = (column) => {
  if (column.prop) {
    filters.sort = column.prop;
    filters.order = column.order === 'ascending' ? 'asc' : 'desc';
  } else {
    filters.sort = '';
    filters.order = '';
  }
  fetchPosts();
};

// 分页大小变化
const handleSizeChange = (val) => {
  pagination.limit = val;
  fetchPosts();
};

// 页码变化
const handleCurrentChange = (val) => {
  pagination.page = val;
  fetchPosts();
};

// 发布草稿
const handlePublish = async (row) => {
  try {
    const response = await updatePost(row._id, { status: 'published' });
    if (response.success) {
      ElMessage.success('文章已发布');
      fetchPosts();
    }
  } catch (error) {
    console.error('发布文章失败:', error);
    ElMessage.error('发布文章失败');
  }
};

// 切换置顶状态
const handleToggleTop = async (row) => {
  try {
    const response = await toggleSticky(row._id);
    if (response.success) {
      ElMessage.success(row.isTop ? '已取消置顶' : '文章已置顶');
      fetchPosts();
    }
  } catch (error) {
    console.error('切换置顶状态失败:', error);
    ElMessage.error('操作失败');
  }
};

// 删除文章
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除这篇文章吗？此操作不可恢复。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await deletePost(row._id);
      if (response.success) {
        ElMessage.success('文章已删除');
        fetchPosts();
      }
    } catch (error) {
      console.error('删除文章失败:', error);
      ElMessage.error('删除文章失败');
    }
  }).catch(() => {
    // 取消删除
  });
};

// 页面加载时获取数据
onMounted(() => {
  fetchPosts();
  fetchCategories();
});
</script>

<style scoped>
.post-list-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-item {
  margin-bottom: 10px;
  min-width: 200px;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag-item {
  margin-right: 5px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.ml-5 {
  margin-left: 5px;
}
</style>
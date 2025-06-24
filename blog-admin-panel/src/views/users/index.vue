<template>
  <div class="user-container">
    <div class="page-header">
      <h2>用户管理</h2>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-container">
      <el-input
        v-model="searchQuery"
        placeholder="搜索用户名或邮箱"
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
        v-model="filters.role"
        placeholder="用户角色"
        clearable
        class="filter-item"
        @change="handleFilter"
      >
        <el-option label="管理员" value="admin" />
        <el-option label="普通用户" value="user" />
      </el-select>

      <el-button type="primary" @click="handleFilter" class="filter-item">
        筛选
      </el-button>
      <el-button @click="resetFilter" class="filter-item">
        重置
      </el-button>
    </div>

    <!-- 用户列表 -->
    <el-table
      v-loading="loading"
      :data="userList"
      border
      style="width: 100%"
    >
      <el-table-column label="头像" width="80" align="center">
        <template #default="{row}">
          <el-avatar :size="40" :src="row.avatar || defaultAvatar">{{ getInitials(row.username) }}</el-avatar>
        </template>
      </el-table-column>

      <el-table-column prop="username" label="用户名" min-width="120" />

      <el-table-column prop="email" label="邮箱" min-width="180" />

      <el-table-column prop="role" label="角色" width="100">
        <template #default="{row}">
          <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
            {{ row.role === 'admin' ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="文章数" width="100" align="center">
        <template #default="{row}">
          <el-tag type="info">{{ row.postCount || 0 }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createdAt" label="注册时间" width="180">
        <template #default="{row}">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{row}">
          <el-button
            size="small"
            type="primary"
            @click="handleEditUser(row)"
          >
            编辑
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDeleteUser(row)"
            :disabled="row.role === 'admin' || row._id === currentUserId"
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

    <!-- 用户编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑用户信息"
      width="500px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" disabled />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" class="w-full">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>

        <el-form-item label="头像">
          <div class="avatar-uploader">
            <el-avatar :size="80" :src="userForm.avatar || defaultAvatar">{{ getInitials(userForm.username) }}</el-avatar>
            <div class="avatar-tip">头像上传功能需要在实际项目中集成文件上传组件</div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUserForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { getUsers, updateUser, deleteUser } from '../../api/user';
import { getPosts } from '../../api/post';
import { formatDate } from '../../utils/validate';
import { useUserStore } from '../../stores/user';

// 用户列表数据
const userList = ref([]);
const loading = ref(false);

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 当前登录用户ID
const userStore = useUserStore();
const currentUserId = computed(() => userStore.userInfo?._id || '');

// 搜索和筛选
const searchQuery = ref('');
const filters = reactive({
  role: ''
});

// 分页
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
});

// 对话框控制
const dialogVisible = ref(false);
const currentEditUserId = ref('');

// 表单引用
const userFormRef = ref(null);

// 用户表单数据
const userForm = reactive({
  username: '',
  email: '',
  role: '',
  avatar: ''
});

// 表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 30, message: '用户名长度应在2到30个字符之间', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
  ]
};

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: searchQuery.value,
      role: filters.role
    };
    
    const response = await getUsers(params);
    console.log('用户列表API响应:', response);
    
    // 检查响应结构
    if (response.success && response.users) {
      // 标准响应结构
      userList.value = response.users || [];
      pagination.total = response.totalDocs || 0;
    } else if (response.success && Array.isArray(response.data)) {
      // 替代响应结构 - data 数组
      userList.value = response.data || [];
      pagination.total = response.total || response.totalDocs || 0;
    } else if (Array.isArray(response)) {
      // 直接返回数组
      userList.value = response || [];
      pagination.total = response.length || 0;
    } else {
      console.error('未知的响应结构:', response);
      userList.value = [];
      pagination.total = 0;
    }
    
    console.log('设置用户列表数据:', userList.value);
    
    // 获取每个用户的文章数量
    await fetchUserPostCounts();
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取每个用户的文章数量
const fetchUserPostCounts = async () => {
  try {
    for (const user of userList.value) {
      const response = await getPosts({ author: user._id, limit: 1 });
      if (response.success) {
        user.postCount = response.totalDocs || 0;
      }
    }
  } catch (error) {
    console.error('获取用户文章数量失败:', error);
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchUsers();
};

// 筛选
const handleFilter = () => {
  pagination.page = 1;
  fetchUsers();
};

// 重置筛选
const resetFilter = () => {
  searchQuery.value = '';
  filters.role = '';
  pagination.page = 1;
  fetchUsers();
};

// 分页大小变化
const handleSizeChange = (val) => {
  pagination.limit = val;
  fetchUsers();
};

// 页码变化
const handleCurrentChange = (val) => {
  pagination.page = val;
  fetchUsers();
};

// 编辑用户
const handleEditUser = (row) => {
  currentEditUserId.value = row._id;
  
  // 填充表单数据
  userForm.username = row.username || '';
  userForm.email = row.email || '';
  userForm.role = row.role || 'user';
  userForm.avatar = row.avatar || '';
  
  dialogVisible.value = true;
};

// 删除用户
const handleDeleteUser = (row) => {
  if (row.role === 'admin') {
    ElMessage.warning('不能删除管理员账户');
    return;
  }
  
  if (row._id === currentUserId.value) {
    ElMessage.warning('不能删除当前登录账户');
    return;
  }
  
  ElMessageBox.confirm(
    '确定要删除这个用户吗？此操作不可恢复，用户的所有数据将被删除。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await deleteUser(row._id);
      if (response.success) {
        ElMessage.success('用户已删除');
        fetchUsers();
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      ElMessage.error('删除用户失败');
    }
  }).catch(() => {
    // 取消删除
  });
};

// 提交用户表单
const submitUserForm = async () => {
  if (!userFormRef.value) return;
  
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await updateUser(currentEditUserId.value, userForm);
        
        if (response.success) {
          ElMessage.success('用户信息已更新');
          dialogVisible.value = false;
          fetchUsers();
        }
      } catch (error) {
        console.error('更新用户失败:', error);
        ElMessage.error('更新用户失败');
      }
    }
  });
};

// 获取用户名首字母（用于头像显示）
const getInitials = (username) => {
  if (!username) return '';
  return username.charAt(0).toUpperCase();
};

// 页面加载时获取数据
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.user-container {
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar-tip {
  font-size: 12px;
  color: #909399;
}

.w-full {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
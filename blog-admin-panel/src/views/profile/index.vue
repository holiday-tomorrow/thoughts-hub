<template>
  <div class="profile-container">
    <div class="page-header">
      <h2>个人中心</h2>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="6">
        <!-- 用户信息卡片 -->
        <el-card class="profile-card">
          <div class="profile-header">
            <el-avatar :size="100" :src="userInfo.avatar || defaultAvatar">{{ getInitials(userInfo.username) }}</el-avatar>
            <h3 class="profile-name">{{ userInfo.username }}</h3>
            <p class="profile-email">{{ userInfo.email }}</p>
            <el-tag :type="userInfo.role === 'admin' ? 'danger' : 'info'" class="profile-role">
              {{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </div>
          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-value">{{ userStats.postCount }}</div>
              <div class="stat-label">文章</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ formatDate(userInfo.createdAt) }}</div>
              <div class="stat-label">注册时间</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="18">
        <!-- 个人信息设置 -->
        <el-card>
          <template #header>
            <div class="card-header">
              <span>个人信息设置</span>
            </div>
          </template>

          <el-tabs v-model="activeTab">
            <!-- 基本信息 -->
            <el-tab-pane label="基本信息" name="basic">
              <el-form
                ref="basicFormRef"
                :model="basicForm"
                :rules="basicRules"
                label-width="100px"
              >
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="basicForm.username" placeholder="请输入用户名" />
                </el-form-item>

                <el-form-item label="邮箱">
                  <el-input v-model="basicForm.email" disabled />
                  <div class="form-tip">邮箱不可修改</div>
                </el-form-item>

                <el-form-item label="头像">
                  <div class="avatar-uploader">
                    <el-avatar :size="80" :src="basicForm.avatar || defaultAvatar">{{ getInitials(basicForm.username) }}</el-avatar>
                    <div class="avatar-actions">
                      <el-button size="small" type="primary">上传头像</el-button>
                      <div class="avatar-tip">头像上传功能需要在实际项目中集成文件上传组件</div>
                    </div>
                  </div>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="updateBasicInfo">保存修改</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 修改密码 -->
            <el-tab-pane label="修改密码" name="password">
              <el-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                label-width="100px"
              >
                <el-form-item label="当前密码" prop="oldPassword">
                  <el-input
                    v-model="passwordForm.oldPassword"
                    type="password"
                    placeholder="请输入当前密码"
                    show-password
                  />
                </el-form-item>

                <el-form-item label="新密码" prop="newPassword">
                  <el-input
                    v-model="passwordForm.newPassword"
                    type="password"
                    placeholder="请输入新密码"
                    show-password
                  />
                  <div class="form-tip">密码长度至少6位，包含字母和数字</div>
                </el-form-item>

                <el-form-item label="确认新密码" prop="confirmPassword">
                  <el-input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    placeholder="请再次输入新密码"
                    show-password
                  />
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="handleUpdatePassword">修改密码</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../../stores/user';
import { getUserProfile, updateUserProfile } from '../../api/user';
import { getPosts } from '../../api/post';
import { updatePassword } from '../../api/auth';
import { formatDate, validatePassword } from '../../utils/validate';

const userStore = useUserStore();

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 当前激活的标签页
const activeTab = ref('basic');

// 用户信息
const userInfo = computed(() => userStore.userInfo || {});

// 用户统计数据
const userStats = reactive({
  postCount: 0
});

// 表单引用
const basicFormRef = ref(null);
const passwordFormRef = ref(null);

// 基本信息表单
const basicForm = reactive({
  username: '',
  email: '',
  avatar: ''
});

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 基本信息表单验证规则
const basicRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 30, message: '用户名长度应在2到30个字符之间', trigger: 'blur' }
  ]
};

// 密码表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (!validatePassword(value)) {
        callback(new Error('密码必须包含字母和数字，且长度至少为6位'));
      } else {
        callback();
      }
    }, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (value !== passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    }, trigger: 'blur' }
  ]
};

// 获取用户详细信息
const fetchUserProfile = async () => {
  try {
    const response = await getUserProfile();
    if (response.success && response.user) {
      // 更新用户信息到 store
      userStore.setUserInfo(response.user);
      
      // 填充表单数据
      basicForm.username = response.user.username || '';
      basicForm.email = response.user.email || '';
      basicForm.avatar = response.user.avatar || '';
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

// 获取用户文章数量
const fetchUserStats = async () => {
  try {
    if (userInfo.value && userInfo.value._id) {
      const response = await getPosts({ author: userInfo.value._id, limit: 1 });
      if (response.success) {
        userStats.postCount = response.totalDocs || 0;
      }
    }
  } catch (error) {
    console.error('获取用户统计数据失败:', error);
  }
};

// 更新基本信息
const updateBasicInfo = async () => {
  if (!basicFormRef.value) return;
  
  await basicFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await updateUserProfile({
          username: basicForm.username,
          avatar: basicForm.avatar
        });
        
        if (response.success) {
          ElMessage.success('个人信息已更新');
          // 更新 store 中的用户信息
          await fetchUserProfile();
        }
      } catch (error) {
        console.error('更新个人信息失败:', error);
        ElMessage.error('更新个人信息失败');
      }
    }
  });
};

// 修改密码
const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return;
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await updatePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        });
        
        if (response.success) {
          ElMessage.success('密码已修改，请重新登录');
          // 清空表单
          passwordForm.oldPassword = '';
          passwordForm.newPassword = '';
          passwordForm.confirmPassword = '';
          passwordFormRef.value.resetFields();
          
          // 退出登录，重定向到登录页
          setTimeout(() => {
            userStore.logoutAction();
          }, 1500);
        }
      } catch (error) {
        console.error('修改密码失败:', error);
        ElMessage.error('修改密码失败，请确认当前密码是否正确');
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
  fetchUserProfile();
  fetchUserStats();
});
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.profile-card {
  margin-bottom: 20px;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.profile-name {
  margin: 15px 0 5px;
  font-size: 18px;
}

.profile-email {
  margin: 0 0 10px;
  color: #606266;
}

.profile-role {
  margin-bottom: 15px;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  padding: 15px 0;
  border-top: 1px solid #ebeef5;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-uploader {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.avatar-tip {
  font-size: 12px;
  color: #909399;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
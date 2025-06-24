<template>
  <div class="tag-container">
    <div class="page-header">
      <h2>标签管理</h2>
      <el-button type="primary" @click="handleAddTag">
        <el-icon><Plus /></el-icon>添加标签
      </el-button>
    </div>

    <!-- 标签列表 -->
    <el-table
      v-loading="loading"
      :data="tagList"
      border
      style="width: 100%"
    >
      <el-table-column prop="name" label="标签名称" min-width="180">
        <template #default="{row}">
          <div class="tag-name">
            <el-tag>{{ row.name }}</el-tag>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="description" label="描述" min-width="300">
        <template #default="{row}">
          {{ row.description || '-' }}
        </template>
      </el-table-column>
      
      <el-table-column prop="slug" label="别名" min-width="150">
        <template #default="{row}">
          {{ row.slug || '-' }}
        </template>
      </el-table-column>
      
      <el-table-column label="文章数" width="100" align="center">
        <template #default="{row}">
          <el-tag type="info">{{ row.postCount || 0 }}</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{row}">
          <el-button
            size="small"
            type="primary"
            @click="handleEditTag(row)"
          >
            编辑
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDeleteTag(row)"
            :disabled="row.postCount > 0"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 标签表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑标签' : '添加标签'"
      width="500px"
    >
      <el-form
        ref="tagFormRef"
        :model="tagForm"
        :rules="tagRules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
        </el-form-item>
        
        <el-form-item label="别名" prop="slug">
          <el-input v-model="tagForm.slug" placeholder="请输入标签别名，用于URL" />
          <div class="form-tip">别名用于URL中，建议使用英文或拼音，不含空格和特殊字符</div>
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input
            v-model="tagForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入标签描述（可选）"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTagForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { getTags, createTag, updateTag, deleteTag } from '../../api/tag';
import { getPosts } from '../../api/post';

// 标签列表数据
const tagList = ref([]);
const loading = ref(false);

// 对话框控制
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentTagId = ref('');

// 表单引用
const tagFormRef = ref(null);

// 标签表单数据
const tagForm = reactive({
  name: '',
  slug: '',
  description: ''
});

// 表单验证规则
const tagRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 20, message: '名称长度应在1到20个字符之间', trigger: 'blur' }
  ],
  slug: [
    { pattern: /^[a-z0-9-]+$/, message: '别名只能包含小写字母、数字和连字符', trigger: 'blur' }
  ]
};

// 获取标签列表
const fetchTags = async () => {
  loading.value = true;
  try {
    const response = await getTags();
    console.log('标签列表API响应:', response);
    
    // 检查响应结构
    if (response.success && response.tags) {
      // 标准响应结构
      tagList.value = response.tags || [];
    } else if (response.success && Array.isArray(response.data)) {
      // 替代响应结构 - data 数组
      tagList.value = response.data || [];
    } else if (Array.isArray(response)) {
      // 直接返回数组
      tagList.value = response || [];
    } else {
      console.error('未知的响应结构:', response);
      tagList.value = [];
    }
    
    console.log('设置标签列表数据:', tagList.value);
    
    // 获取每个标签的文章数量
    await fetchTagPostCounts();
  } catch (error) {
    console.error('获取标签列表失败:', error);
    ElMessage.error('获取标签列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取每个标签的文章数量
const fetchTagPostCounts = async () => {
  try {
    for (const tag of tagList.value) {
      const response = await getPosts({ tag: tag._id, limit: 1 });
      if (response.success) {
        tag.postCount = response.totalDocs || 0;
      }
    }
  } catch (error) {
    console.error('获取标签文章数量失败:', error);
  }
};

// 添加标签
const handleAddTag = () => {
  isEdit.value = false;
  currentTagId.value = '';
  resetTagForm();
  dialogVisible.value = true;
};

// 编辑标签
const handleEditTag = (row) => {
  isEdit.value = true;
  currentTagId.value = row._id;
  
  // 填充表单数据
  tagForm.name = row.name || '';
  tagForm.slug = row.slug || '';
  tagForm.description = row.description || '';
  
  dialogVisible.value = true;
};

// 删除标签
const handleDeleteTag = (row) => {
  if (row.postCount > 0) {
    ElMessage.warning('该标签下有文章，无法删除');
    return;
  }
  
  ElMessageBox.confirm(
    '确定要删除这个标签吗？此操作不可恢复。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await deleteTag(row._id);
      if (response.success) {
        ElMessage.success('标签已删除');
        fetchTags();
      }
    } catch (error) {
      console.error('删除标签失败:', error);
      ElMessage.error('删除标签失败');
    }
  }).catch(() => {
    // 取消删除
  });
};

// 提交标签表单
const submitTagForm = async () => {
  if (!tagFormRef.value) return;
  
  await tagFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let response;
        
        if (isEdit.value) {
          // 更新标签
          response = await updateTag(currentTagId.value, tagForm);
        } else {
          // 创建标签
          response = await createTag(tagForm);
        }
        
        if (response.success) {
          ElMessage.success(isEdit.value ? '标签已更新' : '标签已创建');
          dialogVisible.value = false;
          fetchTags();
        }
      } catch (error) {
        console.error(isEdit.value ? '更新标签失败:' : '创建标签失败:', error);
        ElMessage.error(isEdit.value ? '更新标签失败' : '创建标签失败');
      }
    }
  });
};

// 重置标签表单
const resetTagForm = () => {
  tagForm.name = '';
  tagForm.slug = '';
  tagForm.description = '';
  
  if (tagFormRef.value) {
    tagFormRef.value.resetFields();
  }
};

// 页面加载时获取数据
onMounted(() => {
  fetchTags();
});
</script>

<style scoped>
.tag-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tag-name {
  display: flex;
  align-items: center;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
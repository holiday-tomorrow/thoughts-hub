<template>
  <div class="post-edit-container">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑文章' : '写文章' }}</h2>
      <div class="header-actions">
        <el-button @click="$router.push('/posts/list')">返回列表</el-button>
        <el-button type="info" @click="handleSaveDraft">保存草稿</el-button>
        <el-button type="primary" @click="handlePublish">发布文章</el-button>
      </div>
    </div>

    <el-form
      ref="postFormRef"
      :model="postForm"
      :rules="postRules"
      label-width="80px"
      class="post-form"
    >
      <el-row :gutter="20">
        <el-col :span="18">
          <!-- 标题 -->
          <el-form-item label="标题" prop="title">
            <el-input v-model="postForm.title" placeholder="请输入文章标题" />
          </el-form-item>

          <!-- 内容编辑器 -->
          <el-form-item label="内容" prop="content">
            <div class="editor-container">
              <!-- 使用 Vditor 编辑器，左侧编辑右侧预览 -->
              <div id="vditor" class="vditor-container"></div>
            </div>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <!-- 发布设置 -->
          <el-card class="post-settings">
            <template #header>
              <div class="card-header">
                <span>发布设置</span>
              </div>
            </template>

            <!-- 状态 -->
            <el-form-item label="状态">
              <el-select v-model="postForm.status" class="w-full">
                <el-option label="草稿" value="draft" />
                <el-option label="已发布" value="published" />
              </el-select>
            </el-form-item>

            <!-- 分类 -->
            <el-form-item label="分类" prop="category">
              <el-select
                v-model="postForm.category"
                placeholder="选择分类"
                class="w-full"
                filterable
                clearable
              >
                <el-option
                  v-for="item in categories"
                  :key="item._id"
                  :label="item.name"
                  :value="item._id"
                />
              </el-select>
            </el-form-item>

            <!-- 标签 -->
            <el-form-item label="标签">
              <el-select
                v-model="postForm.tags"
                multiple
                collapse-tags
                placeholder="选择标签"
                class="w-full"
                filterable
                clearable
              >
                <el-option
                  v-for="item in tags"
                  :key="item._id"
                  :label="item.name"
                  :value="item._id"
                />
              </el-select>
            </el-form-item>

            <!-- 置顶 -->
            <el-form-item label="置顶">
              <el-switch v-model="postForm.isTop" />
            </el-form-item>

            <!-- 摘要 -->
            <el-form-item label="摘要">
              <el-input
                v-model="postForm.summary"
                type="textarea"
                :rows="4"
                placeholder="请输入文章摘要，如不填写将自动提取正文前150个字符"
              />
            </el-form-item>
          </el-card>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getPost, createPost, updatePost, savePostDraft } from '../../api/post';
import { getCategories } from '../../api/category';
import { getTags } from '../../api/tag';
import Vditor from 'vditor';
import 'vditor/dist/index.css';

const route = useRoute();
const router = useRouter();
const postId = computed(() => route.params.id);
const isEdit = computed(() => !!postId.value);

// 表单引用
const postFormRef = ref(null);

// Vditor 编辑器实例
let vditor = null;

// 文章表单数据
const postForm = reactive({
  title: '',
  content: '',
  summary: '',
  category: '',
  tags: [],
  status: 'draft',
  isTop: false
});

// 表单验证规则
const postRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应在2到100个字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ]
};

// 分类和标签数据
const categories = ref([]);
const tags = ref([]);

// 加载状态
const loading = ref(false);

// 初始化 Vditor 编辑器
const initVditor = () => {
  console.log('开始初始化Vditor编辑器...');
  const vditorElement = document.getElementById('vditor');
  if (!vditorElement) {
    console.error('错误: 找不到ID为vditor的DOM元素，无法初始化编辑器');
    return;
  }
  console.log('找到vditor DOM元素:', vditorElement);
  
  try {
    vditor = new Vditor('vditor', {
    height: 500,
    mode: 'ir',  // 分屏模式
    preview: {
      mode: 'both',  // 左侧编辑，右侧预览
      hljs: {
        enable: true,
        style: 'github',
        lineNumber: true
      }
    },
    toolbar: [
      'emoji', 'headings', 'bold', 'italic', 'strike', 'link', '|',
      'list', 'ordered-list', 'check', 'outdent', 'indent', '|',
      'quote', 'line', 'code', 'inline-code', 'insert-before', 'insert-after', '|',
      'upload', 'table', '|',
      'undo', 'redo', '|',
      'fullscreen', 'edit-mode', 'both', 'preview', 'outline', 'help'
    ],
    cache: {
      enable: false
    },
    upload: {
      accept: 'image/*',
      // 这里可以配置图片上传接口
      // url: '/api/upload/image'
    },
    // 使用官方提供的 input 回调函数监听内容变化
    input: (value) => {
      postForm.content = value;
    },
    after: () => {
      // 编辑器初始化完成后的回调
      console.log('Vditor编辑器初始化完成 - after事件触发');
      console.log('当前编辑模式:', isEdit.value ? '编辑文章' : '新建文章');
      console.log('路由参数ID:', postId.value);
      
      if (isEdit.value) {
        console.log('准备获取文章详情...');
        fetchPostDetail();
      }
    }
    // Vditor没有ready回调，所有初始化后的逻辑应放在after回调中
  });
  console.log('Vditor编辑器初始化完成，等待after事件...');
  } catch (error) {
    console.error('Vditor编辑器初始化失败:', error);
  }
};

// 获取文章详情
const fetchPostDetail = async () => {
  console.log('开始获取文章详情, ID:', postId.value);
  if (!postId.value) return;
  
  loading.value = true;
  try {
    const response = await getPost(postId.value);
    if (response.success && response.data) {
      const post = response.data;
      console.log('文章详情获取成功:', post.title);
      
      // 填充表单数据
      postForm.title = post.title || '';
      postForm.content = post.content || '';
      postForm.summary = post.summary || '';
      postForm.category = post.category?._id || '';
      postForm.tags = post.tags?.map(tag => tag._id) || [];
      postForm.status = post.status || 'draft';
      postForm.isTop = post.isTop || false;
      
      console.log('表单数据填充完成, 准备设置编辑器内容');
      console.log('编辑器状态:', vditor ? '已初始化' : '未初始化');
      
      // 如果编辑器已初始化，设置内容
      if (vditor && typeof vditor.setValue === 'function' && postForm.content) {
        console.log('尝试设置编辑器内容...');
        try {
          vditor.setValue(postForm.content);
          console.log('编辑器内容设置成功');
        } catch (err) {
          console.error('设置编辑器内容失败:', err);
          // 如果设置失败，可以尝试延迟设置
          console.log('500ms后将重试设置编辑器内容');
          setTimeout(() => {
            try {
              console.log('重试设置编辑器内容...');
              vditor.setValue(postForm.content);
              console.log('重试设置编辑器内容成功');
            } catch (retryErr) {
              console.error('重试设置编辑器内容失败:', retryErr);
            }
          }, 500);
        }
      } else {
        console.warn('编辑器未准备好或内容为空，无法设置编辑器内容');
        if (!vditor) console.warn('vditor实例不存在');
        if (typeof vditor?.setValue !== 'function') console.warn('setValue方法不可用');
        if (!postForm.content) console.warn('文章内容为空');
      }
    }
  } catch (error) {
    console.error('获取文章详情失败:', error);
    ElMessage.error('获取文章详情失败');
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

// 获取所有标签
const fetchTags = async () => {
  try {
    const response = await getTags();
    if (response.success) {
      tags.value = response.data || [];
    }
  } catch (error) {
    console.error('获取标签列表失败:', error);
  }
};

// 保存草稿
const handleSaveDraft = async () => {
  if (!postForm.title && !vditor.getValue()) {
    ElMessage.warning('请至少输入标题或内容');
    return;
  }
  
  // 同步编辑器内容到表单
  postForm.content = vditor.getValue();
  
  try {
    loading.value = true;
    let response;
    
    // 设置状态为草稿
    postForm.status = 'draft';
    
    if (isEdit.value) {
      // 更新现有文章
      response = await updatePost(postId.value, postForm);
    } else {
      // 创建新草稿
      response = await savePostDraft(postForm);
    }
    
    if (response.success) {
      ElMessage.success('草稿保存成功');
      
      // 如果是新创建的草稿，跳转到编辑页面
      if (!isEdit.value && response.post?._id) {
        router.push(`/posts/edit/${response.post._id}`);
      }
    }
  } catch (error) {
    console.error('保存草稿失败:', error);
    ElMessage.error('保存草稿失败');
  } finally {
    loading.value = false;
  }
};

// 发布文章
const handlePublish = async () => {
  if (!postFormRef.value) return;
  
  // 同步编辑器内容到表单
  postForm.content = vditor.getValue();
  
  await postFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true;
        
        // 设置状态为已发布
        postForm.status = 'published';
        
        let response;
        if (isEdit.value) {
          // 更新现有文章
          response = await updatePost(postId.value, postForm);
        } else {
          // 创建新文章
          response = await createPost(postForm);
        }
        
        if (response.success) {
          ElMessage.success('文章发布成功');
          router.push('/posts/list');
        }
      } catch (error) {
        console.error('发布文章失败:', error);
        ElMessage.error('发布文章失败');
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.warning('请完善文章信息');
    }
  });
};

// 组件卸载前销毁编辑器
onBeforeUnmount(() => {
  if (vditor) {
    vditor.destroy();
    vditor = null;
  }
});

// 页面加载时获取数据
onMounted(() => {
  console.log('============ 组件挂载 ============');
  console.log('当前路由:', route.fullPath);
  console.log('路由参数:', route.params);
  console.log('postId:', postId.value);
  console.log('isEdit:', isEdit.value);
  
  fetchCategories();
  fetchTags();
  
  // 初始化编辑器
  // 文章详情会在编辑器的after回调中获取
  initVditor();
  
  // 如果5秒后vditor的after事件仍未触发，输出警告
  setTimeout(() => {
    if (isEdit.value && !document.querySelector('#vditor .vditor-content')) {
      console.warn('警告: Vditor编辑器可能未正确初始化，after事件可能未触发');
    }
  }, 5000);
});
</script>

<style scoped>
.post-edit-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.post-form {
  margin-top: 20px;
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.vditor-container {
  width: 100%;
  min-height: 500px;
}

.post-settings {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.w-full {
  width: 100%;
}
</style>
<template>
  <div class="category-container">
    <div class="category-header">
      <h1>分类管理</h1>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleAddCategory">添加分类</el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="categoryList"
      style="width: 100%"
      border
    >
      <el-table-column prop="name" label="名称" width="180" />
      <el-table-column prop="slug" label="别名" width="180" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="postCount" label="文章数" width="100" />
      <el-table-column label="操作" width="200" align="center">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="handleEditCategory(scope.row)"
            >编辑</el-button
          >
          <el-button
            size="small"
            type="danger"
            @click="handleDeleteCategory(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分类表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '添加分类'"
      width="500px"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="别名" prop="slug">
          <el-input
            v-model="categoryForm.slug"
            placeholder="请输入分类别名，用于URL"
          />
          <div class="form-tip">
            别名用于URL中，建议使用英文或拼音，不含空格和特殊字符
          </div>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCategoryForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/category";
import { getPosts } from "../../api/post";

// 分类列表数据
const categoryList = ref([]);
const loading = ref(false);

// 对话框控制
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentCategoryId = ref("");

// 表单引用
const categoryFormRef = ref(null);

// 分类表单数据
const categoryForm = reactive({
  name: "",
  slug: "",
  description: "",
});

// 表单验证规则
const categoryRules = {
  name: [
    { required: true, message: "请输入分类名称", trigger: "blur" },
    {
      min: 2,
      max: 30,
      message: "名称长度应在2到30个字符之间",
      trigger: "blur",
    },
  ],
  slug: [
    {
      pattern: /^[a-z0-9-]+$/,
      message: "别名只能包含小写字母、数字和连字符",
      trigger: "blur",
    },
  ],
};

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true;
  try {
    const response = await getCategories();
    console.log("分类列表API响应:", response);
    // 检查响应结构
    if (response.success && Array.isArray(response.data)) {
      // 替代响应结构 - data 数组
      categoryList.value = response.data || [];
    } else {
      console.error("未知的响应结构:", response);
      categoryList.value = [];
    }

    console.log("设置分类列表数据:", categoryList.value);

    // 获取每个分类的文章数量
    await fetchCategoryPostCounts();
  } catch (error) {
    console.error("获取分类列表失败:", error);
    ElMessage.error("获取分类列表失败");
  } finally {
    loading.value = false;
  }
};

// 获取每个分类的文章数量
const fetchCategoryPostCounts = async () => {
  try {
    for (const category of categoryList.value) {
      const response = await getPosts({ category: category._id, limit: 1 });
      if (response.success) {
        category.postCount = response.totalDocs || 0;
      }
    }
  } catch (error) {
    console.error("获取分类文章数量失败:", error);
  }
};

// 添加分类
const handleAddCategory = () => {
  isEdit.value = false;
  currentCategoryId.value = "";
  resetCategoryForm();
  dialogVisible.value = true;
};

// 编辑分类
const handleEditCategory = (row) => {
  isEdit.value = true;
  currentCategoryId.value = row._id;

  // 填充表单数据
  categoryForm.name = row.name || "";
  categoryForm.slug = row.slug || "";
  categoryForm.description = row.description || "";

  dialogVisible.value = true;
};

// 删除分类
const handleDeleteCategory = (row) => {
  if (row.postCount > 0) {
    ElMessage.warning("该分类下有文章，无法删除");
    return;
  }

  ElMessageBox.confirm("确定要删除这个分类吗？此操作不可恢复。", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const response = await deleteCategory(row._id);
        if (response.success) {
          ElMessage.success("分类已删除");
          fetchCategories();
        }
      } catch (error) {
        console.error("删除分类失败:", error);
        ElMessage.error("删除分类失败");
      }
    })
    .catch(() => {
      // 取消删除
    });
};

// 提交分类表单
const submitCategoryForm = async () => {
  if (!categoryFormRef.value) return;

  await categoryFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 先检查分类名称是否已存在（仅在创建新分类时检查）
        if (!isEdit.value) {
          console.log('检查分类名称是否已存在:', categoryForm.name);
          // 先在前端列表中检查
          const localDuplicate = categoryList.value.find(c => 
            c.name.toLowerCase() === categoryForm.name.toLowerCase());
          
          if (localDuplicate) {
            console.warn('前端列表中发现同名分类:', localDuplicate);
            ElMessage.warning(`分类名称"${categoryForm.name}"已存在，请使用其他名称`);
            return; // 阻止提交
          }
        }
        
        console.log('提交分类表单数据:', JSON.stringify(categoryForm));
        let response;

        if (isEdit.value) {
          // 更新分类
          console.log('更新分类ID:', currentCategoryId.value);
          response = await updateCategory(
            currentCategoryId.value,
            categoryForm
          );
        } else {
          // 创建分类
          console.log('创建新分类');
          response = await createCategory(categoryForm);
        }

        console.log('分类操作响应:', response);

        if (response.success) {
          ElMessage.success(isEdit.value ? "分类已更新" : "分类已创建");
          dialogVisible.value = false;
          fetchCategories();
        } else {
          // 处理业务错误
          const errorMsg = response.error || (isEdit.value ? "更新分类失败" : "创建分类失败");
          console.error('业务错误:', errorMsg);
          
          // 检查是否是重复名称错误
          if (errorMsg.includes('已存在')) {
            console.warn('数据库中可能存在同名分类，但前端列表未显示');
            ElMessage.warning(`分类名称"${categoryForm.name}"在数据库中已存在，请使用其他名称`);
            
            // 刷新分类列表，确保前端显示最新数据
            await fetchCategories();
          } else {
            ElMessage.error(errorMsg);
          }
        }
      } catch (error) {
        console.error(isEdit.value ? "更新分类失败:" : "创建分类失败:", error);
        // 尝试提取详细错误信息
        const errorMsg = error.response?.data?.error || 
                        error.message || 
                        (isEdit.value ? "更新分类失败" : "创建分类失败");
        console.error('详细错误信息:', errorMsg);
        
        // 特殊处理重复键错误
        if (errorMsg.includes('已存在') || (error.response?.data && error.response.data.code === 11000)) {
          ElMessage.warning(`分类名称"${categoryForm.name}"已存在，请使用其他名称`);
          // 刷新分类列表，确保前端显示最新数据
          await fetchCategories();
        } else {
          ElMessage.error(errorMsg);
        }
      }
    }
  });
};

// 重置分类表单
const resetCategoryForm = () => {
  categoryForm.name = "";
  categoryForm.slug = "";
  categoryForm.description = "";

  if (categoryFormRef.value) {
    categoryFormRef.value.resetFields();
  }
};

// 页面加载时获取数据
onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.category-container {
  padding: 20px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
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
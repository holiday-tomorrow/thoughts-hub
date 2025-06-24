<template>
  <div class="login-container">
    <div class="login-form-container">
      <div class="login-title">
        <img src="../../assets/logo.svg" alt="Logo" class="login-logo" />
        <h2>博客管理系统</h2>
      </div>
      
      <el-tabs v-model="activeTab" class="login-tabs">
        <el-tab-pane label="账号密码登录" name="password">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            class="login-form"
          >
            <el-form-item prop="email">
              <el-input
                v-model="passwordForm.email"
                placeholder="邮箱"
                type="text"
                prefix-icon="Message"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="passwordForm.password"
                placeholder="密码"
                type="password"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                :loading="loading"
                type="primary"
                class="login-button"
                @click="handlePasswordLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="验证码登录" name="code">
          <el-form
            ref="codeFormRef"
            :model="codeForm"
            :rules="codeRules"
            class="login-form"
          >
            <el-form-item prop="email">
              <el-input
                v-model="codeForm.email"
                placeholder="邮箱"
                type="text"
                prefix-icon="Message"
              />
            </el-form-item>
            
            <el-form-item prop="code">
              <div class="code-input-container">
                <el-input
                  v-model="codeForm.code"
                  placeholder="验证码"
                  type="text"
                  prefix-icon="Key"
                />
                <el-button
                  :disabled="isCodeSending || !codeForm.email"
                  type="primary"
                  class="send-code-button"
                  @click="handleSendCode"
                >
                  {{ codeButtonText }}
                </el-button>
              </div>
            </el-form-item>
            
            <el-form-item>
              <el-button
                :loading="loading"
                type="primary"
                class="login-button"
                @click="handleCodeLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      
      <div class="login-footer">
        <el-button type="text" @click="showForgotPassword = true">忘记密码?</el-button>
      </div>
    </div>
    
    <!-- 忘记密码对话框 -->
    <el-dialog
      v-model="showForgotPassword"
      title="忘记密码"
      width="400px"
      center
    >
      <el-form
        ref="forgotFormRef"
        :model="forgotForm"
        :rules="forgotRules"
        label-width="0"
      >
        <el-form-item prop="email">
          <el-input
            v-model="forgotForm.email"
            placeholder="请输入您的邮箱"
            type="email"
          />
        </el-form-item>
        
        <el-form-item prop="code">
          <div class="code-input-container">
            <el-input
              v-model="forgotForm.code"
              placeholder="验证码"
              type="text"
            />
            <el-button
              :disabled="isResetCodeSending || !forgotForm.email"
              type="primary"
              class="send-code-button"
              @click="handleSendResetCode"
            >
              {{ resetCodeButtonText }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showForgotPassword = false">取消</el-button>
          <el-button type="primary" @click="handleForgotPassword">提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Message, Lock, Key } from '@element-plus/icons-vue';
import { useUserStore } from '../../stores/user';
import { validateEmail } from '../../utils/validate';
import { sendLoginCode, sendResetCode, forgotPassword } from '../../api/auth';

const router = useRouter();
const userStore = useUserStore();

// 表单引用
const passwordFormRef = ref(null);
const codeFormRef = ref(null);
const forgotFormRef = ref(null);

// 当前激活的标签
const activeTab = ref('password');

// 加载状态
const loading = ref(false);

// 密码登录表单
const passwordForm = reactive({
  email: '',
  password: ''
});

// 验证码登录表单
const codeForm = reactive({
  email: '',
  code: ''
});

// 忘记密码表单
const forgotForm = reactive({
  email: '',
  code: ''
});

// 忘记密码对话框显示状态
const showForgotPassword = ref(false);

// 验证规则
const passwordRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (!validateEmail(value)) {
        callback(new Error('请输入有效的邮箱地址'));
      } else {
        callback();
      }
    }, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ]
};

const codeRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (!validateEmail(value)) {
        callback(new Error('请输入有效的邮箱地址'));
      } else {
        callback();
      }
    }, trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度应为6位', trigger: 'blur' }
  ]
};

const forgotRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (!validateEmail(value)) {
        callback(new Error('请输入有效的邮箱地址'));
      } else {
        callback();
      }
    }, trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度应为6位', trigger: 'blur' }
  ]
};

// 验证码发送状态
const isCodeSending = ref(false);
const isResetCodeSending = ref(false);
const countdown = ref(0);
const resetCountdown = ref(0);

// 验证码按钮文本
const codeButtonText = computed(() => {
  if (countdown.value > 0) {
    return `${countdown.value}秒后重新发送`;
  }
  return '发送验证码';
});

const resetCodeButtonText = computed(() => {
  if (resetCountdown.value > 0) {
    return `${resetCountdown.value}秒后重新发送`;
  }
  return '发送验证码';
});

// 开始倒计时
const startCountdown = (type = 'login') => {
  if (type === 'login') {
    countdown.value = 60;
    isCodeSending.value = true;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
        isCodeSending.value = false;
      }
    }, 1000);
  } else {
    resetCountdown.value = 60;
    isResetCodeSending.value = true;
    const timer = setInterval(() => {
      resetCountdown.value--;
      if (resetCountdown.value <= 0) {
        clearInterval(timer);
        isResetCodeSending.value = false;
      }
    }, 1000);
  }
};

// 发送登录验证码
const handleSendCode = async () => {
  if (!validateEmail(codeForm.email)) {
    ElMessage.error('请输入有效的邮箱地址');
    return;
  }
  
  try {
    isCodeSending.value = true;
    const response = await sendLoginCode({ email: codeForm.email });
    if (response.success) {
      ElMessage.success('验证码已发送到您的邮箱');
      startCountdown('login');
    }
  } catch (error) {
    console.error('发送验证码失败:', error);
  } finally {
    if (countdown.value <= 0) {
      isCodeSending.value = false;
    }
  }
};

// 发送重置密码验证码
const handleSendResetCode = async () => {
  if (!validateEmail(forgotForm.email)) {
    ElMessage.error('请输入有效的邮箱地址');
    return;
  }
  
  try {
    isResetCodeSending.value = true;
    const response = await sendResetCode({ email: forgotForm.email });
    if (response.success) {
      ElMessage.success('验证码已发送到您的邮箱');
      startCountdown('reset');
    }
  } catch (error) {
    console.error('发送验证码失败:', error);
  } finally {
    if (resetCountdown.value <= 0) {
      isResetCodeSending.value = false;
    }
  }
};

// 密码登录
const handlePasswordLogin = async () => {
  if (!passwordFormRef.value) return;
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true;
        const success = await userStore.loginAction(passwordForm);
        if (success) {
          router.push('/');
        }
      } catch (error) {
        console.error('登录失败:', error);
      } finally {
        loading.value = false;
      }
    }
  });
};

// 验证码登录
const handleCodeLogin = async () => {
  if (!codeFormRef.value) return;
  
  await codeFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true;
        const success = await userStore.loginAction(codeForm);
        if (success) {
          router.push('/');
        }
      } catch (error) {
        console.error('登录失败:', error);
      } finally {
        loading.value = false;
      }
    }
  });
};

// 处理忘记密码
const handleForgotPassword = async () => {
  if (!forgotFormRef.value) return;
  
  await forgotFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await forgotPassword({
          email: forgotForm.email,
          code: forgotForm.code
        });
        
        if (response.success) {
          ElMessage.success('重置密码链接已发送到您的邮箱');
          showForgotPassword.value = false;
        }
      } catch (error) {
        console.error('忘记密码请求失败:', error);
      }
    }
  });
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDEzNSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZmZmZiI+PC9yZWN0PjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZmZmZmZmIj48L3JlY3Q+PHJlY3QgeD0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2Y1ZjVmNSI+PC9yZWN0PjxyZWN0IHk9IjIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiNmNWY1ZjUiPjwvcmVjdD48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjcGF0dGVybikiIGhlaWdodD0iMTAwJSIgd2lkdGg9IjEwMCUiPjwvcmVjdD48L3N2Zz4=');
}

.login-form-container {
  width: 400px;
  padding: 30px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
}

.login-logo {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.login-title h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.login-tabs {
  margin-bottom: 20px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
}

.login-footer {
  margin-top: 20px;
  text-align: center;
}

.code-input-container {
  display: flex;
}

.send-code-button {
  margin-left: 10px;
  width: 120px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
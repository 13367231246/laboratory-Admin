<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-header">
        <img src="@/assets/logo.png" alt="logo" class="logo" />
        <h1>实验室管理系统</h1>
      </div>
      <a-card class="login-card">
        <h2 class="welcome-text">欢迎登录</h2>
        <a-form :model="formState" name="login" autocomplete="off" @finish="handleFinish">
          <a-form-item name="username" :rules="[{ required: true, message: '请输入用户名' }]">
            <a-input v-model:value="formState.username" size="large" placeholder="请输入用户名">
              <template #prefix>
                <user-outlined class="icon" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item name="password" :rules="[{ required: true, message: '请输入密码' }]">
            <a-input-password v-model:value="formState.password" size="large" placeholder="请输入密码">
              <template #prefix>
                <lock-outlined class="icon" />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item>
            <a-button type="primary" html-type="submit" size="large" block :loading="loading"> 登录 </a-button>
          </a-form-item>
        </a-form>
        <div class="login-tip">
          <p>提示：用户名 <strong>admin</strong>，密码 <strong>123456</strong></p>
        </div>
      </a-card>
    </div>
    <div class="login-footer">
      <p>Copyright © 2024 实验室管理系统</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const formState = reactive({
  username: '',
  password: ''
})

const handleFinish = async (values) => {
  loading.value = true
  try {
    const success = await userStore.login(values.username, values.password)
    if (success) {
      message.success('登录成功')
      router.push('/')
    } else {
      message.error('用户名或密码错误')
    }
  } catch (error) {
    message.error('登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import './index.css';
</style>

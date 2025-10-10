<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-header">
        <img src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" alt="logo" class="logo" />
        <h1>系统模板</h1>
      </div>
      <a-card class="login-card">
        <h2 class="welcome-text">欢迎登录</h2>
        <a-form :model="formState" name="login" autocomplete="off" @finish="handleFinish">
          <a-form-item name="captcha_code" :rules="[{ required: true, message: '请输入验证码' }]">
            <div class="verification-code-input">
              <a-input v-model:value="formState.captcha_code" size="large" placeholder="验证码">
                <template #prefix>
                  <safety-outlined class="icon" />
                </template>
              </a-input>
              <a-button type="primary" size="large" :disabled="cooldown > 0" @click="getVerificationCode" class="get-code-btn">
                {{ cooldown > 0 ? `${cooldown}秒后重试` : '获取验证码' }}
              </a-button>
            </div>
          </a-form-item>

          <a-form-item>
            <a-button type="primary" html-type="submit" size="large" block :loading="loading"> 登录 </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
    <div class="login-footer">
      <p>Copyright © 2024 系统模板</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import { SafetyOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'

import { requestCode } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const cooldown = ref(0)
let timer = null

const formState = reactive({
  captcha_code: ''
})

// 初始化时检查本地存储中的冷却时间
onMounted(() => {
  const savedEndTime = localStorage.getItem('verificationCodeEndTime')
  if (savedEndTime) {
    const endTime = parseInt(savedEndTime)
    const now = Date.now()

    if (endTime > now) {
      // 计算剩余时间（秒）
      cooldown.value = Math.ceil((endTime - now) / 1000)
      startCooldownTimer()
    } else {
      // 如果已过期，清除存储
      localStorage.removeItem('verificationCodeEndTime')
    }
  }
})

// 组件销毁前清除定时器
onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})

// 启动冷却计时器
const startCooldownTimer = () => {
  if (timer) clearInterval(timer)

  timer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) {
      clearInterval(timer)
      localStorage.removeItem('verificationCodeEndTime')
    }
  }, 1000)
}

// 获取验证码
const getVerificationCode = async () => {
  if (cooldown.value > 0) return
  const { code, data, msg } = await requestCode()
  if (code == 200) {
    message.success('验证码已发送')
    cooldown.value = 60
    const endTime = Date.now() + cooldown.value * 1000
    localStorage.setItem('verificationCodeEndTime', endTime.toString())
    startCooldownTimer()
  }
  console.log(code, data, msg)
}

const handleFinish = async (values) => {
  loading.value = true
  await userStore.login(values.captcha_code)
  loading.value = false
}
</script>

<style scoped>
@import './index.css';
</style>

<template>
  <a-form
    ref="formRef"
    :model="form"
    :rules="rules"
    layout="vertical"
    class="profile-form"
  >
    <a-form-item label="当前密码" name="currentPassword">
      <a-input-password v-model:value="form.currentPassword" placeholder="请输入当前密码" />
    </a-form-item>

    <a-form-item label="新密码" name="newPassword">
      <a-input-password v-model:value="form.newPassword" placeholder="请输入新密码" />
    </a-form-item>

    <a-form-item label="确认密码" name="confirmPassword">
      <a-input-password v-model:value="form.confirmPassword" placeholder="请再次输入新密码" />
    </a-form-item>

    <a-form-item>
      <a-button type="primary" @click="handleSubmit" :loading="loading" block>
        <LockOutlined />
        修改密码
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { LockOutlined } from '@ant-design/icons-vue'
import { changePassword } from '@/api/profile'

// 定义emits
const emit = defineEmits(['success'])

// 响应式数据
const formRef = ref()
const loading = ref(false)

// 表单数据
const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const rules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== form.newPassword) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}

// 处理提交
const handleSubmit = async () => {
  try {
    // 表单验证
    await formRef.value.validate()
    
    loading.value = true
    const result = await changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword
    })

    if (result.success) {
      message.success('密码修改成功!')
      // 重置表单
      form.currentPassword = ''
      form.newPassword = ''
      form.confirmPassword = ''
      emit('success')
    } else {
      message.error(result.message || '密码修改失败!')
    }
  } catch (error) {
    if (error.errorFields) {
      // 表单验证错误
      return
    }
    console.error('密码修改失败:', error)
    message.error('密码修改失败!')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.profile-form {
  max-width: 500px;
}
</style>

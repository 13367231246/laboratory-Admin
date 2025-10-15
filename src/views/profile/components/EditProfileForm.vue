<template>
  <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" class="profile-form">
    <a-form-item label="昵称" name="nickname">
      <a-input v-model:value="form.nickname" placeholder="请输入昵称" />
    </a-form-item>

    <a-form-item label="手机号" name="phone">
      <a-input v-model:value="form.phone" placeholder="请输入手机号" />
    </a-form-item>

    <a-form-item label="邮箱" name="email">
      <a-input v-model:value="form.email" placeholder="请输入邮箱" />
    </a-form-item>

    <a-form-item label="性别" name="gender">
      <a-radio-group v-model:value="form.gender">
        <a-radio :value="1">男</a-radio>
        <a-radio :value="2">女</a-radio>
        <a-radio :value="0">保密</a-radio>
      </a-radio-group>
    </a-form-item>

    <a-form-item>
      <a-button type="primary" @click="handleSubmit" :loading="loading" block>
        <EditOutlined />
        保存修改
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import { EditOutlined } from '@ant-design/icons-vue'
import { updateUserInfo } from '@/api/profile'

// 定义props
const props = defineProps({
  userInfo: {
    type: Object,
    required: true
  }
})

// 定义emits
const emit = defineEmits(['success'])

// 响应式数据
const formRef = ref()
const loading = ref(false)

// 表单数据
const form = reactive({
  nickname: '',
  phone: '',
  email: '',
  gender: 0
})

// 表单验证规则
const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }]
}

// 监听用户信息变化，更新表单
watch(
  () => props.userInfo,
  (newUserInfo) => {
    if (newUserInfo) {
      form.nickname = newUserInfo.nickname || ''
      form.phone = newUserInfo.phone || ''
      form.email = newUserInfo.email || ''
      form.gender = newUserInfo.gender || 0
    }
  },
  { immediate: true, deep: true }
)

// 处理提交
const handleSubmit = async () => {
  try {
    // 表单验证
    await formRef.value.validate()

    loading.value = true
    const result = await updateUserInfo({
      nickname: form.nickname,
      phone: form.phone,
      email: form.email,
      gender: form.gender
    })

    if (result.success) {
      message.success('个人信息更新成功!')
      emit('success', result.data)
    } else {
      message.error(result.message || '更新失败!')
    }
  } catch (error) {
    if (error.errorFields) {
      // 表单验证错误
      return
    }
    console.error('更新失败:', error)
    message.error('更新失败!')
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

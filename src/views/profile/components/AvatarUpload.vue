<template>
  <a-modal v-model:open="visible" title="更换头像" :width="400" :footer="null" @cancel="handleCancel">
    <div class="avatar-upload">
      <a-upload :before-upload="beforeAvatarUpload" :show-upload-list="false" accept="image/*">
        <div class="upload-area">
          <a-avatar :size="100" :src="previewAvatar">
            <template v-if="!previewAvatar">
              <PlusOutlined />
            </template>
          </a-avatar>
          <div class="upload-text">
            <p>点击上传头像</p>
            <p class="upload-hint">支持 JPG、PNG 格式，文件大小不超过 2MB</p>
          </div>
        </div>
      </a-upload>

      <div class="avatar-actions" v-if="previewAvatar">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleUpload" :loading="uploading"> 确认上传 </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { uploadAvatar } from '@/api/profile'

// 定义props
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

// 定义emits
const emit = defineEmits(['update:open', 'success'])

// 响应式数据
const previewAvatar = ref('')
const uploading = ref(false)

// 监听visible变化
watch(
  () => props.open,
  (newVal) => {
    if (!newVal) {
      previewAvatar.value = ''
    }
  }
)

// 头像上传前处理
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件!')
    return false
  }

  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
    return false
  }

  // 预览图片
  const reader = new FileReader()
  reader.onload = (e) => {
    previewAvatar.value = e.target.result
  }
  reader.readAsDataURL(file)

  return false // 阻止自动上传
}

// 处理头像上传
const handleUpload = async () => {
  if (previewAvatar.value) {
    try {
      uploading.value = true
      // 将base64转换为File对象
      const response = await fetch(previewAvatar.value)
      const blob = await response.blob()
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })

      const result = await uploadAvatar(file)
      if (result.success) {
        message.success('头像上传成功!')
        emit('success', result.data.avatar)
        handleCancel()
      } else {
        message.error(result.message || '头像上传失败!')
      }
    } catch (error) {
      console.error('头像上传失败:', error)
      message.error('头像上传失败!')
    } finally {
      uploading.value = false
    }
  }
}

// 处理取消
const handleCancel = () => {
  previewAvatar.value = ''
  emit('update:open', false)
}
</script>

<style scoped>
.avatar-upload {
  text-align: center;
}

.upload-area {
  padding: 24px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #1890ff;
}

.upload-text {
  margin-top: 16px;
}

.upload-text p {
  margin: 4px 0;
  color: #8c8c8c;
}

.upload-hint {
  font-size: 12px;
}

.avatar-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>

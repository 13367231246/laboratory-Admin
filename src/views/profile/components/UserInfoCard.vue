<template>
  <a-card class="profile-card" :bordered="false">
    <template #title>
      <div class="card-title">
        <UserOutlined class="title-icon" />
        基本信息
      </div>
    </template>

    <div class="profile-info">
      <!-- 头像区域 -->
      <div class="avatar-section">
        <div class="avatar-container">
          <a-avatar :size="120" :src="userInfo.avatar ? getImageUrl(userInfo.avatar) : defaultAvatar" class="user-avatar">
            <template v-if="!userInfo.avatar">
              <UserOutlined />
            </template>
          </a-avatar>
          <div class="avatar-overlay" @click="$emit('showAvatarUpload')">
            <CameraOutlined class="camera-icon" />
            <span>更换头像</span>
          </div>
        </div>
        <div class="user-basic-info">
          <h2 class="user-name">{{ userInfo.nickname || userInfo.username }}</h2>
          <p class="user-role">系统管理员</p>
          <p class="join-date">加入时间：{{ formatDate(userInfo.createTime) }}</p>
        </div>
      </div>

      <!-- 详细信息 -->
      <div class="user-details">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="用户名">
            {{ userInfo.username }}
          </a-descriptions-item>
          <a-descriptions-item label="昵称">
            {{ userInfo.nickname || '未设置' }}
          </a-descriptions-item>
          <a-descriptions-item label="手机号">
            {{ userInfo.phone || '未设置' }}
          </a-descriptions-item>
          <a-descriptions-item label="邮箱">
            {{ userInfo.email || '未设置' }}
          </a-descriptions-item>
          <a-descriptions-item label="性别">
            {{ getGenderText(userInfo.gender) }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ formatDate(userInfo.createTime) }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { UserOutlined, CameraOutlined } from '@ant-design/icons-vue'
import { getImageUrl } from '@/utils/getImageUrl'
import defaultAvatar from '@/assets/user.png'

// 定义props
const props = defineProps({
  userInfo: {
    type: Object,
    required: true
  }
})

// 定义emits
const emit = defineEmits(['showAvatarUpload'])

// 计算属性
const getGenderText = (gender) => {
  const genderMap = {
    1: '男',
    2: '女',
    0: '保密'
  }
  return genderMap[gender] || '未设置'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '未知'
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.profile-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.title-icon {
  margin-right: 8px;
  color: #1890ff;
}

.profile-info {
  padding: 24px 0;
}

.avatar-section {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid #f0f0f0;
}

.avatar-container {
  position: relative;
  margin-right: 32px;
}

.user-avatar {
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.camera-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.user-basic-info {
  flex: 1;
}

.user-name {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
}

.user-role {
  color: #1890ff;
  font-size: 14px;
  margin: 0 0 8px 0;
}

.join-date {
  color: #8c8c8c;
  font-size: 14px;
  margin: 0;
}

.user-details {
  margin-bottom: 32px;
}

/* 深色主题支持 */
.dark-mode .card-title {
  color: rgba(255, 255, 255, 0.85);
}

.dark-mode .user-name {
  color: rgba(255, 255, 255, 0.85);
}

.dark-mode .join-date {
  color: rgba(255, 255, 255, 0.65);
}

.dark-mode .avatar-section {
  border-bottom-color: #303030;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .avatar-section {
    flex-direction: column;
    text-align: center;
  }

  .avatar-container {
    margin-right: 0;
    margin-bottom: 16px;
  }
}
</style>

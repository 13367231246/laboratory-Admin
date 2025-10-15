<template>
  <div class="profile-container">
    <div class="profile-layout">
      <!-- 左侧：用户信息展示 -->
      <div class="profile-left">
        <UserInfoCard :user-info="userInfo" @show-avatar-upload="showAvatarUpload" />
      </div>

      <!-- 右侧：编辑区域 -->
      <div class="profile-right">
        <a-card class="edit-card" :bordered="false">
          <template #title>
            <div class="card-title">
              <SettingOutlined class="title-icon" />
              账户设置
            </div>
          </template>

          <a-tabs v-model:activeKey="activeTab" class="profile-tabs">
            <!-- 编辑信息标签页 -->
            <a-tab-pane key="edit" tab="编辑信息">
              <template #tab>
                <span>
                  <EditOutlined />
                  编辑信息
                </span>
              </template>

              <EditProfileForm :user-info="userInfo" @success="handleEditSuccess" />
            </a-tab-pane>

            <!-- 修改密码标签页 -->
            <a-tab-pane key="password" tab="修改密码">
              <template #tab>
                <span>
                  <LockOutlined />
                  修改密码
                </span>
              </template>

              <ChangePasswordForm @success="handlePasswordSuccess" />
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </div>
    </div>

    <!-- 头像上传组件 -->
    <AvatarUpload v-model:open="avatarModalVisible" @success="handleAvatarSuccess" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { EditOutlined, LockOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { getUserInfo } from '@/api/profile'
import UserInfoCard from './components/UserInfoCard.vue'
import AvatarUpload from './components/AvatarUpload.vue'
import EditProfileForm from './components/EditProfileForm.vue'
import ChangePasswordForm from './components/ChangePasswordForm.vue'

const userStore = useUserStore()

// 响应式数据
const avatarModalVisible = ref(false)
const activeTab = ref('edit')

// 用户信息 - 从store获取
const userInfo = computed(() => userStore.user)

// 显示头像上传模态框
const showAvatarUpload = () => {
  avatarModalVisible.value = true
}

// 处理头像上传成功
const handleAvatarSuccess = (avatarUrl) => {
  userStore.updateAvatar(avatarUrl)
}

// 处理编辑信息成功
const handleEditSuccess = (userData) => {
  userStore.updateUserInfo(userData)
}

// 处理密码修改成功
const handlePasswordSuccess = () => {
  // 密码修改成功后的处理逻辑
  console.log('密码修改成功')
}

// 组件挂载时加载用户信息
onMounted(async () => {
  try {
    const result = await getUserInfo()
    if (result.success) {
      userStore.updateUserInfo(result.data)
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    message.error('加载用户信息失败!')
  }
})
</script>

<style scoped>
.profile-container {
  padding: 24px;
}

.profile-layout {
  display: flex;
  gap: 24px;
  max-width: 1400px;
}

.profile-left {
  flex: 1;
  min-width: 0;
}

.profile-right {
  flex: 1;
  min-width: 0;
}

.profile-card,
.edit-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.profile-tabs {
  margin-top: 16px;
}

.profile-tabs .ant-tabs-tab {
  padding: 12px 16px;
  font-weight: 500;
}

.profile-tabs .ant-tabs-tab-active {
  color: #1890ff;
}

.profile-tabs .ant-tabs-content-holder {
  padding: 24px 0;
}

.profile-form {
  max-width: 500px;
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

/* 深色主题支持 */
.dark-mode .profile-container {
  background-color: #141414;
}

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

.dark-mode .profile-tabs .ant-tabs-tab {
  color: rgba(255, 255, 255, 0.85);
}

.dark-mode .profile-tabs .ant-tabs-tab-active {
  color: #40a9ff;
}

.dark-mode .profile-tabs .ant-tabs-ink-bar {
  background-color: #40a9ff;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .profile-layout {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: 16px;
  }

  .profile-layout {
    gap: 16px;
  }

  .avatar-section {
    flex-direction: column;
    text-align: center;
  }

  .avatar-container {
    margin-right: 0;
    margin-bottom: 16px;
  }

  .profile-tabs .ant-tabs-tab {
    padding: 8px 12px;
    font-size: 14px;
  }

  .profile-form {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 12px;
  }

  .profile-layout {
    gap: 12px;
  }

  .profile-tabs .ant-tabs-tab {
    padding: 6px 8px;
    font-size: 13px;
  }
}
</style>

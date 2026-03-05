import { defineStore } from 'pinia'
import { userLoginService, getAdminInfoService } from '@/api/profile'
import { message } from 'ant-design-vue'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: {},
    isLoggedIn: false
  }),
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['token', 'user', 'isLoggedIn']
  },
  getters: {
    getUser() {
      return this.user
    },
    getToken() {
      return this.token
    }
  },
  actions: {
    // 用户登录
    async login(username, password) {
        const response = await userLoginService({ username, password })
        console.log(response)
        if (response.code === 0 && response.data) {
          // 保存token
          this.token = response.data
          this.isLoggedIn = true
          localStorage.setItem('token', this.token)
          const adminInfo = await getAdminInfoService()
          if (adminInfo.code === 0 && adminInfo.data) {
            this.user = adminInfo.data
          }
          return true
        } else {
          message.error(response.message || '登录失败')
          return false
        }

    },
    // 退出登录
    async loginOut() {
      // 清空本地存储
      localStorage.removeItem('token')
      this.token = ''
      this.isLoggedIn = false
    },

    // 更新用户信息
    updateUserInfo(userData) {
      this.user = { ...this.user, ...userData }
    },
    // 更新头像
    updateAvatar(avatar) {
      this.user.avatar = avatar
    }
  }
})

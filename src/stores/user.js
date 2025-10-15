import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: {
      id: 1,
      avatar: '',
      nickname: '管理员',
      username: 'admin',
      phone: '13800138000',
      email: 'admin@example.com',
      gender: 1, // 1: 男, 2: 女, 0: 保密
      createTime: new Date('2024-01-01')
    },
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
      try {
        // 模拟登录验证
        if (username === 'admin' && password === '123456') {
          this.token = 'mock-token-' + Date.now()
          this.isLoggedIn = true
          this.user = {
            id: 1,
            avatar: '',
            nickname: '管理员',
            username: username
          }
          localStorage.setItem('token', this.token)
          return true
        }
        return false
      } catch (error) {
        console.error('登录失败:', error)
        return false
      }
    },
    // 退出登录
    loginOut() {
      this.token = ''
      this.isLoggedIn = false
      this.user = {
        id: 0,
        avatar: '',
        nickname: '',
        username: ''
      }
      localStorage.removeItem('token')
    },
    // 重置状态
    resetState() {
      this.token = ''
      this.isLoggedIn = false
      this.user = {
        id: 0,
        avatar: '',
        nickname: '',
        username: '',
        phone: '',
        email: '',
        gender: 0,
        createTime: null
      }
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

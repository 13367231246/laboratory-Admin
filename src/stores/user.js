import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { login } from '@/api/user'
import router from '@/router'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: true,
    token: ''
  }),
  actions: {
    async login(captcha_code) {
      const { code, data, msg } = await login({ captcha_code })
      if (code == 200) {
        this.isLoggedIn = true
        // this.userInfo = data
        this.token = data.access_token
        // // 登录成功后跳转到任务中心
        router.push('/dashboard')
      }
    },
    async logout() {
      this.isLoggedIn = true
      this.token = ''
      return true
    },
    setUserInfo(info) {
      this.userInfo = info
    },
    setToken(newToken) {
      this.token = newToken
    }
  },
  persist: {
    // 持久化配置
    key: 'user-store',
    storage: localStorage,
    paths: ['isLoggedIn', 'userInfo', 'token'] // 指定要持久化的字段
  }
})

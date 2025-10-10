import axios from 'axios'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import router from '@/router'

// 创建请求实例
const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const token = userStore.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  async (response) => {
    if (response.status === 200) {
      if (response.data.code === 401) {
        const userStore = useUserStore()
        await userStore.logout()
        router.push('/')
      }
      if (response.data.code !== 200) {
        message.error(response.data.msg || '请求失败')
        return response.data
      }
      if (response.data.code === 200) return response.data
    }
  },
  (error) => {
    message.error(error.response?.data?.message || '请求失败')
    return Promise.reject(error)
  }
)

export default request

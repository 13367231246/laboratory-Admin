import axios from 'axios'
import { message } from 'ant-design-vue'
import router from '@/router'
import { useUserStore } from '@/stores/user'

// 创建axios实例
const request = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// HTTP请求拦截器
export function setupRequestInterceptor(axiosInstance) {
  // 请求拦截器
  axiosInstance.interceptors.request.use(
    (config) => {
      const userStore = useUserStore()

      // 添加认证token
      if (userStore.token) {
        config.headers.Authorization = userStore.token
      }

      // 添加请求时间戳
      config.metadata = { startTime: new Date() }

      console.log('发送请求:', {
        url: config.url,
        method: config.method,
        headers: config.headers
      })

      return config
    },
    (error) => {
      console.error('请求拦截器错误:', error)
      return Promise.reject(error)
    }
  )
}

// HTTP响应拦截器
export function setupResponseInterceptor(axiosInstance) {
  // 响应拦截器
  axiosInstance.interceptors.response.use(
    (response) => {
      const userStore = useUserStore()

      // 计算请求耗时（可选）
      if (response.config.metadata) {
        const endTime = new Date()
        const duration = endTime - response.config.metadata.startTime
        console.log(`请求完成: ${response.config.url} (${duration}ms)`)
      }

      // 处理成功响应
      console.log('收到响应:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      })

      // 与你给的示例保持相同语义：根据业务 code 判断
      const res = response.data
      if (res && typeof res === 'object' && 'code' in res) {
        if (res.code === 0) {
          // 这里直接返回 data（你登录接口的 token / 用户信息等）
          return res
        }

        // code 非 0：业务失败，给出统一错误提示并抛出
        message.error(res.message || '服务异常')
        return Promise.reject(res)
      }

      // 没有 code 字段的情况，直接返回响应体
      return res
    },
    (error) => {
      const userStore = useUserStore()

      console.error('响应错误:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      })

      // 401：未授权，跳转登录页（与示例一致）
      if (error.response?.status === 401) {
        message.error('用户未授权，清除登录状态')
        userStore.loginOut()
        router.push('/login')
      }

      // 403：权限不足
      if (error.response?.status === 403) {
        message.error('用户权限不足')
      }

      // 处理后端返回的错误格式（带 code / message）
      if (error.response?.data) {
        const res = error.response.data
        if (res.code !== undefined && res.message) {
          error.message = res.message
          error.code = res.code
        }
      }

      // 统一错误提示（优先后端 message）
      if (error.response?.data?.message) {
        message.error(error.response.data.message || '服务异常')
      } else if (error.message) {
        message.error(error.message || '服务异常')
      }

      return Promise.reject(error)
    }
  )
}

// 对当前 axios 实例启用拦截器
setupRequestInterceptor(request)
setupResponseInterceptor(request)

// 导出axios实例
export default request

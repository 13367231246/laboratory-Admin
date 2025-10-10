// 导入 EventSourcePolyfill 用于实现 SSE (Server-Sent Events) 的跨浏览器支持
// EventSourcePolyfill 提供了与标准 EventSource 相同的功能，但支持自定义请求头和更多配置选项
import { EventSourcePolyfill } from 'event-source-polyfill'

// 导入应用状态管理存储，用于获取用户认证令牌
import { useUserStore } from '@/stores/user'

/**
 * 创建并返回一个 SSE 连接实例
 * SSE (Server-Sent Events) 用于实现服务器向客户端的单向实时推送
 * @param {string} url - SSE 连接的 URL
 * @param {Object} options - 可选的配置参数
 * @returns {EventSourcePolyfill} 返回配置好的 EventSource 实例
 */
export function linkSseEvent(url, options = {}) {
  // 初始化应用状态管理实例 - 移到函数内部确保每次调用时获取最新的token
  const userStore = useUserStore()

  // 默认配置
  const defaultOptions = {
    // 启用超时后的自动重试
    retryOnTimeout: true,
    // 设置自动重连时间（毫秒）
    heartbeatTimeout: 60000,
    // 设置请求头，添加Bearer令牌用于身份验证
    headers: {
      Authorization: 'Bearer ' + userStore.token
    },
    // 添加跨域支持
    withCredentials: true
  }

  // 合并默认配置和用户提供的配置
  const finalOptions = { ...defaultOptions, ...options }

  // 使用相对路径，这样请求会经过 Vite 的代理
  return new EventSourcePolyfill(`${url}`, finalOptions)
}

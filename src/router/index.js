import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { setupRouterGuard } from './permission'

const router = createRouter({
  history: createWebHistory(),
  strict: true,
  routes
})

setupRouterGuard(router)

// 重置路由函数
export function resetRouter() {
  // 重置路由到初始状态
  // 这里可以根据需要添加重置逻辑
  console.log('路由已重置')
}

export default router

import { useUserStore } from '../stores/user'

export function setupRouterGuard(router) {
  router.beforeEach((to, from, next) => {
    // 如果访问的是根路径，重定向到任务中心
    if (to.path === '/') {
      next('/dashboard')
      return
    }

    // 获取用户信息
    const userStore = useUserStore()

    // 如果未登录且访问的不是登录页，重定向到登录页
    if (!userStore.isLoggedIn && to.path !== '/login') {
      next('/login')
      return
    }

    // 如果已登录且访问登录页，重定向到首页
    if (userStore.isLoggedIn && to.path === '/login') {
      next('/dashboard')
      return
    }

    next()
  })

  // 添加标题更新
  router.afterEach((to) => {
    document.title = to.meta.title ? `${to.meta.title} - 管理系统` : '管理系统'
  })
}

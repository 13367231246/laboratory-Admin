import { useUserStore } from '@/stores/user'

// 路由不重定向白名单
const whiteList = ['/login']

// 路由加载前
export function setupRouterGuard(router) {
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    const token = localStorage.getItem('token')

    if (token && userStore.isLoggedIn) {
      if (to.path === '/login') {
        next({ path: '/' })
      } else {
        next()
      }
    } else {
      if (whiteList.indexOf(to.path) !== -1) {
        next()
      } else {
        next(`/login?redirect=${to.fullPath}`)
      }
    }
  })
}

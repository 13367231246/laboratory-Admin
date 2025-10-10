import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useTabsStore = defineStore(
  'tabs',
  () => {
    const tabs = ref([])
    const activeKey = ref('')
    const router = useRouter()
    // 用于控制需要缓存的组件
    const cachedViews = ref([])

    // 添加标签
    const addTab = (tab) => {
      const existingTab = tabs.value.find((item) => item.path === tab.path)

      // 检查是否需要缓存（无论标签是否存在）
      if (tab.meta?.keepAlive && tab.name) {
        // 检查是否已经在缓存列表中
        if (!cachedViews.value.includes(tab.name)) {
          cachedViews.value.push(tab.name)
        }
      }

      // 如果标签不存在，则添加
      if (!existingTab && tab.title && tab.path) {
        tabs.value.push(tab)
      }
    }

    // 移除标签
    const removeTab = (targetKey) => {
      if (tabs.value.length <= 1) return

      let lastIndex = tabs.value.findIndex((tab) => tab.path === targetKey) - 1
      lastIndex = lastIndex < 0 ? 0 : lastIndex

      // 清除页面缓存
      const removedTab = tabs.value.find((tab) => tab.path === targetKey)
      if (removedTab) {
        const routeName = router.resolve(targetKey).name

        if (routeName) {
          const index = cachedViews.value.indexOf(routeName)
          if (index > -1) {
            cachedViews.value.splice(index, 1)
          }
        }
      }

      // 移除标签并更新激活标签
      tabs.value = tabs.value.filter((tab) => tab.path !== targetKey)
      if (targetKey === activeKey.value) {
        activeKey.value = tabs.value[lastIndex].path
        router.push(tabs.value[lastIndex].path)
      }
    }

    // 设置当前激活的标签（切换标签时不清除缓存）
    const setActiveKey = (key) => {
      activeKey.value = key
    }

    return {
      tabs,
      activeKey,
      cachedViews,
      addTab,
      removeTab,
      setActiveKey
    }
  },
  {
    persist: {
      key: 'tabs-store',
      storage: localStorage,
      paths: ['tabs', 'activeKey', 'cachedViews']
    }
  }
)

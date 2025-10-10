import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore(
  'layout',
  () => {
    // 布局模式：vertical 或 horizontal
    const layout = ref('vertical')
    // 侧边栏折叠状态（仅用于垂直布局）
    const collapsed = ref(false)

    // 切换布局模式
    const toggleLayout = () => {
      layout.value = layout.value === 'vertical' ? 'horizontal' : 'vertical'
    }

    // 设置布局模式
    const setLayout = (mode) => {
      if (mode === 'vertical' || mode === 'horizontal') {
        layout.value = mode
      }
    }

    // 切换侧边栏折叠状态
    const toggleCollapsed = () => {
      collapsed.value = !collapsed.value
    }

    return {
      layout,
      collapsed,
      toggleLayout,
      setLayout,
      toggleCollapsed
    }
  },
  {
    persist: {
      key: 'layout-store',
      storage: localStorage,
      paths: ['layout', 'collapsed']
    }
  }
)

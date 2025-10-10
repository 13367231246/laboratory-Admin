import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { theme as antdTheme } from 'ant-design-vue'
import { generateColors } from '../utils/colors'

export const useThemeStore = defineStore(
  'theme',
  () => {
    const primaryColor = ref('#1677ff')
    const isDark = ref(false)

    // 获取主题算法
    const algorithm = computed(() => {
      return isDark.value ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm
    })

    // 主题配置
    const theme = computed(() => ({
      token: {
        colorPrimary: primaryColor.value
      },
      algorithm: algorithm.value
    }))

    // 切换主题色
    const setPrimaryColor = (color) => {
      primaryColor.value = color
      // 生成并应用新的主题色
      generateColors(color)
    }

    // 切换暗黑模式
    const toggleDark = () => {
      isDark.value = !isDark.value
    }

    return {
      primaryColor,
      isDark,
      theme,
      setPrimaryColor,
      toggleDark
    }
  },
  {
    persist: {
      key: 'theme-store',
      storage: localStorage,
      paths: ['primaryColor', 'isDark']
    }
  }
)

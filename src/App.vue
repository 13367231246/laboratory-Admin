<template>
  <ConfigProvider :theme="themeStore.theme" :locale="zhCN">
    <router-view></router-view>
  </ConfigProvider>
</template>

<script setup>
import { ConfigProvider } from 'ant-design-vue'
// 导入中文语言包
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { useThemeStore } from './stores/theme'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const themeStore = useThemeStore()

onMounted(() => {
  // 初始化菜单颜色
  const menuColor = localStorage.getItem('menuColor') || '#001529'
  document.documentElement.style.setProperty('--menu-bg-color', menuColor)
})
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

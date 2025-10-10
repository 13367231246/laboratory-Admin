<template>
  <a-menu-item v-for="route in menuItems" :key="route.path">
    <template #icon>
      <component :is="getAntdIcon(route.meta?.icon)" v-if="route.meta?.icon" />
    </template>
    <span>{{ route.meta?.title }}</span>
  </a-menu-item>
</template>

<script setup>
import { computed } from 'vue'
import * as AntdIcons from '@ant-design/icons-vue'

const props = defineProps({
  menuRoutes: {
    type: Array,
    required: true
  }
})

// 获取根路由下的子路由作为菜单项，并过滤掉隐藏的路由
const menuItems = computed(() => {
  const rootRoute = props.menuRoutes.find((route) => route.path === '/')
  return rootRoute?.children?.filter((route) => !route.meta?.hidden) || []
})

// 获取 Antd 图标组件
const getAntdIcon = (iconName) => {
  // 确保图标名称存在
  if (!iconName) return null

  // 将 kebab-case 转换为 PascalCase
  const pascalName = iconName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

  // 返回对应的图标组件
  return AntdIcons[pascalName]
}
</script>

<style scoped>
@import './index.css';
</style>

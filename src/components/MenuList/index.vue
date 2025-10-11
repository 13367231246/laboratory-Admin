<template>
  <template v-for="route in menuItems" :key="route.path">
    <!-- 单级菜单：直接显示为菜单项，不显示下拉 -->
    <a-menu-item v-if="route.meta?.singleLevel" :key="route.path">
      <template #icon>
        <component :is="getAntdIcon(route.meta?.icon)" v-if="route.meta?.icon" />
      </template>
      <span>{{ route.meta?.title }}</span>
    </a-menu-item>

    <!-- 多级菜单：显示子菜单 -->
    <a-sub-menu v-else-if="route.children && route.children.length > 0" :key="route.path">
      <template #icon>
        <component :is="getAntdIcon(route.meta?.icon)" v-if="route.meta?.icon" />
      </template>
      <template #title>{{ route.meta?.title }}</template>

      <!-- 递归渲染子菜单 -->
      <template v-for="child in route.children" :key="child.path">
        <!-- 子菜单还有子菜单 -->
        <a-sub-menu v-if="child.children && child.children.length > 0" :key="child.path">
          <template #icon>
            <component :is="getAntdIcon(child.meta?.icon)" v-if="child.meta?.icon" />
          </template>
          <template #title>{{ child.meta?.title }}</template>

          <!-- 三级菜单项 -->
          <a-menu-item v-for="grandChild in child.children" :key="grandChild.path">
            <template #icon>
              <component :is="getAntdIcon(grandChild.meta?.icon)" v-if="grandChild.meta?.icon" />
            </template>
            <span>{{ grandChild.meta?.title }}</span>
          </a-menu-item>
        </a-sub-menu>

        <!-- 子菜单项 -->
        <a-menu-item v-else :key="child.path">
          <template #icon>
            <component :is="getAntdIcon(child.meta?.icon)" v-if="child.meta?.icon" />
          </template>
          <span>{{ child.meta?.title }}</span>
        </a-menu-item>
      </template>
    </a-sub-menu>

    <!-- 没有子菜单的情况 -->
    <a-menu-item v-else :key="route.path">
      <template #icon>
        <component :is="getAntdIcon(route.meta?.icon)" v-if="route.meta?.icon" />
      </template>
      <span>{{ route.meta?.title }}</span>
    </a-menu-item>
  </template>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import * as AntdIcons from '@ant-design/icons-vue'

const props = defineProps({
  menuRoutes: {
    type: Array,
    required: true
  }
})

// 获取所有一级路由作为菜单项，并过滤掉隐藏的路由
const menuItems = computed(() => {
  return props.menuRoutes.filter((route) => {
    // 过滤掉登录页面和隐藏的路由
    return route.path !== '/login' && !route.meta?.hidden
  })
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

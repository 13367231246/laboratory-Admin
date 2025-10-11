<template>
  <a-layout class="layout-container">
    <!-- 侧边栏 (垂直布局模式) -->
    <a-layout-sider v-if="layoutStore.layout === 'vertical'" class="layout-sider" v-model:collapsed="layoutStore.collapsed" :trigger="null" collapsible>
      <div class="logo hide-on-mobile">{{ appTitle }}</div>
      <a-menu :selectedKeys="selectedKeys" :openKeys="openKeys" mode="inline" @click="handleMenuClick" @openChange="handleOpenChange">
        <menu-list :menu-routes="menuRoutes" />
      </a-menu>
    </a-layout-sider>

    <a-layout :class="[{ 'main-content': layoutStore.layout === 'vertical' }, { collapsed: layoutStore.layout === 'vertical' && layoutStore.collapsed }]">
      <!-- 顶部导航 -->
      <a-layout-header :class="['header', { 'header-dark': themeStore.isDark }, { 'header-horizontal': layoutStore.layout === 'horizontal' }]">
        <!-- 垂直布局模式下的菜单收缩按钮 -->
        <template v-if="layoutStore.layout === 'vertical'">
          <menu-unfold-outlined v-if="layoutStore.collapsed" class="trigger" @click="() => (layoutStore.collapsed = !layoutStore.collapsed)" />
          <menu-fold-outlined v-else class="trigger" @click="() => (layoutStore.collapsed = !layoutStore.collapsed)" />
        </template>

        <!-- 水平布局模式下的Logo和菜单 -->
        <template v-if="layoutStore.layout === 'horizontal'">
          <div class="logo hide-on-mobile">股票社区管理</div>
          <div class="menu-container">
            <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="horizontal" class="menu-horizontal" @click="handleMenuClick" :style="{ background: 'var(--menu-bg-color, #001529)' }">
              <menu-list :menu-routes="menuRoutes" />
            </a-menu>
          </div>
        </template>

        <!-- 右侧用户信息区域 -->
        <div :class="{ 'header-right': layoutStore.layout === 'horizontal', 'user-area': layoutStore.layout === 'vertical' }">
          <a-space>
            <a-dropdown>
              <template #default>
                <a class="ant-dropdown-link" @click.prevent>
                  <img v-if="userStore.user?.avatar" :src="getImageUrl(userStore.user?.avatar)" style="width: 32px; height: 32px; border-radius: 50%" />
                  <a-avatar v-else :size="32" :src="usesrIcon" />
                  <span class="username hide-on-mobile">{{ userStore.user?.nickname || '管理员' }}</span>
                </a>
              </template>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="handleUserInfo">
                    <UserOutlined style="margin-right: 8px" />
                    <a href="javascript:;">个人信息</a>
                  </a-menu-item>
                  <a-menu-item @click="handleLogout">
                    <LogoutOutlined style="margin-right: 8px" />
                    <a href="javascript:;">退出登录</a>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-space>
        </div>
      </a-layout-header>

      <!-- 标签页 -->
      <tabs-view :class="{ 'tabs-view-dark': themeStore.isDark }" />

      <!-- 内容区 -->
      <a-layout-content :class="['content', { 'content-dark': themeStore.isDark }]">
        <router-view v-slot="{ Component }">
          <keep-alive :include="tabsStore.cachedViews">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </a-layout-content>
    </a-layout>

    <!-- 主题设置浮动按钮 -->
    <div class="theme-settings-btn" @click="showThemeSettings">
      <div class="btn-inner">
        <setting-outlined class="icon-setting" />
        <tool-outlined class="icon-tool" />
      </div>
    </div>

    <theme-settings ref="themeSettingsRef" />
  </a-layout>
</template>

<script setup>
import usesrIcon from '@/assets/user.png'
import { useUserStore } from '@/stores/user'
import { useLayoutStore } from '@/stores/layout'
import { useThemeStore } from '@/stores/theme'
import { useTabsStore } from '@/stores/tabs'
import { routes } from '@/router/routes'
import { getImageUrl } from '@/utils/getImageUrl'
import MenuList from '@/components/MenuList/index.vue'
import ThemeSettings from '@/components/ThemeSettings/index.vue'
import TabsView from '@/components/TabsView/index.vue'
import { Modal } from 'ant-design-vue'
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted, computed, watch } from 'vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const layoutStore = useLayoutStore()
const themeStore = useThemeStore()
const tabsStore = useTabsStore()
const selectedKeys = ref([route.path])
const openKeys = ref([])
const themeSettingsRef = ref(null)
const appTitle = import.meta.env.VITE_APP_TITLE
// 过滤出需要显示的路由
const menuRoutes = computed(() => {
  return routes.filter((route) => !route.meta?.hidden)
})

// 处理菜单点击
const handleMenuClick = ({ key }) => {
  router.push(key)
  selectedKeys.value = [key]
}

// 处理菜单展开状态变化
const handleOpenChange = (keys) => {
  // 只有当用户手动操作菜单时才更新展开状态
  // 避免自动计算时覆盖用户的手动操作
  if (keys.length !== openKeys.value.length || !keys.every((key) => openKeys.value.includes(key))) {
    openKeys.value = keys
  }
}

// 监听路由变化更新选中状态
watch(
  () => route.path,
  (newPath) => {
    selectedKeys.value = [newPath]
  }
)

// 监听激活标签页变化，重新计算展开的菜单
watch(
  () => tabsStore.activeKey,
  (newActiveKey) => {
    if (newActiveKey) {
      const calculatedOpenKeys = calculateOpenKeys()
      if (calculatedOpenKeys.length > 0) {
        openKeys.value = calculatedOpenKeys
      }
    }
  }
)
const handleUserInfo = () => {
  router.push('/user/profile')
}

async function handleLogout() {
  // 二次确认弹窗
  Modal.confirm({
    title: '确定退出登录吗？',
    onOk: async () => {
      await userStore.loginOut()
      router.push('/login')
    }
  })
}

const showThemeSettings = () => {
  themeSettingsRef.value?.show()
}

// 根据当前激活的标签页计算需要展开的菜单
const calculateOpenKeys = () => {
  const openKeysSet = new Set()

  // 只处理当前激活的标签页，而不是所有标签页
  const activeTab = tabsStore.tabs.find((tab) => tab.path === tabsStore.activeKey)

  if (activeTab && activeTab.path) {
    const path = activeTab.path
    // 将路径按 / 分割，构建所有可能的父级路径
    const pathSegments = path.split('/').filter(Boolean)

    // 构建所有可能的父级路径，但排除根路径
    for (let i = 1; i < pathSegments.length; i++) {
      const parentPath = '/' + pathSegments.slice(0, i).join('/')
      // 确保父级路径在路由配置中存在
      const routeExists = routes.some((route) => route.path === parentPath)
      if (routeExists) {
        openKeysSet.add(parentPath)
      }
    }
  }

  return Array.from(openKeysSet)
}

// 初始化菜单展开状态
const initMenuOpenKeys = () => {
  // 根据当前标签页计算需要展开的菜单
  const calculatedOpenKeys = calculateOpenKeys()
  if (calculatedOpenKeys.length > 0) {
    openKeys.value = calculatedOpenKeys
  }
}

// 组件挂载时初始化
onMounted(() => {
  initMenuOpenKeys()
})

// 监听主题变化并应用到根元素
watch(
  () => themeStore.isDark,
  (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  },
  { immediate: true }
)
</script>

<style scoped>
@import './index.css';

/* 添加移动端隐藏类 */
@media screen and (max-width: 768px) {
  .hide-on-mobile {
    display: none !important;
  }
}
</style>

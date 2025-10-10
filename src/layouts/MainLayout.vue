<template>
  <a-layout class="layout-container">
    <!-- 侧边栏 (垂直布局模式) -->
    <a-layout-sider v-if="layoutStore.layout === 'vertical'" class="layout-sider" v-model:collapsed="layoutStore.collapsed" :trigger="null" collapsible>
      <div class="logo hide-on-mobile">监控系统</div>
      <a-menu :selectedKeys="selectedKeys" mode="inline" @click="handleMenuClick">
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
          <div class="logo hide-on-mobile">监控系统</div>
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
                  <a-avatar :size="32" :src="usesrIcon" />
                  <span class="username hide-on-mobile">{{ '您好！欢迎回来' }}</span>
                </a>
              </template>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="handleLogout">
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
import MenuList from '@/components/MenuList/index.vue'
import ThemeSettings from '@/components/ThemeSettings/index.vue'
import TabsView from '@/components/TabsView/index.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const layoutStore = useLayoutStore()
const themeStore = useThemeStore()
const tabsStore = useTabsStore()
const selectedKeys = ref([route.path])
const themeSettingsRef = ref(null)

// 过滤出需要显示的路由
const menuRoutes = computed(() => {
  return routes.filter((route) => !route.meta?.hidden)
})

// 处理菜单点击
const handleMenuClick = ({ key }) => {
  router.push(key)
  selectedKeys.value = [key]
}

// 监听路由变化更新选中状态
watch(
  () => route.path,
  (newPath) => {
    selectedKeys.value = [newPath]
  }
)

async function handleLogout() {
  await userStore.logout()
  router.push('/login')
}

const showThemeSettings = () => {
  themeSettingsRef.value?.show()
}

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

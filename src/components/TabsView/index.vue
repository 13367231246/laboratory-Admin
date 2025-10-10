<template>
  <div class="tabs-view" :class="{ 'tabs-view-shadow': isScrolled, 'tabs-view-dark': themeStore.isDark }">
    <a-tabs v-model:activeKey="tabsStore.activeKey" type="editable-card" :hide-add="true" @edit="onEdit" @change="onChange" class="custom-tabs">
      <a-tab-pane v-for="tab in tabsStore.tabs" :key="tab.path" :tab="tab.title" :closable="tabsStore.tabs.length > 1">
        <template #tab>
          <span class="tab-title">
            <span class="title-text">{{ tab.title }}</span>
          </span>
        </template>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const route = useRoute()
const tabsStore = useTabsStore()
const themeStore = useThemeStore()

// 监听路由变化
watch(
  () => route,
  (newRoute) => {
    // 如果tabs为空,则添加第一个路由作为默认标签
    if (tabsStore.tabs.length === 0 && newRoute.name && newRoute.meta?.title) {
      tabsStore.addTab({
        title: newRoute.meta.title,
        path: newRoute.path,
        name: newRoute.name,
        meta: newRoute.meta
      })
    }

    tabsStore.setActiveKey(newRoute.path)

    // 检查路由是否有效并添加新标签
    if (newRoute.name && newRoute.meta?.title) {
      const tab = {
        title: newRoute.meta.title,
        path: newRoute.path,
        name: newRoute.name,
        meta: newRoute.meta
      }
      tabsStore.addTab(tab)
    }
  },
  { immediate: true, deep: true }
)

// 接收属性
const props = defineProps({
  selectedKeys: {
    type: Array,
    default: () => []
  },
  openKeys: {
    type: Array,
    default: () => []
  }
})

// 定义事件
const emit = defineEmits(['update:selectedKeys', 'update:openKeys'])

// 切换标签
const onChange = (key) => {
  router.push(key)
  const currentTab = tabsStore.tabs.find((tab) => tab.path === key)
  if (currentTab) {
    // 通过事件更新父组件的值
    emit('update:selectedKeys', [currentTab.path])

    // 更新展开的菜单项
    const paths = currentTab.path.split('/')
    const newOpenKeys = []
    let tempPath = ''
    paths.forEach((path) => {
      if (path) {
        tempPath += '/' + path
        newOpenKeys.push(tempPath)
      }
    })
    emit('update:openKeys', newOpenKeys)
  }
}

// 编辑标签（关闭）
const onEdit = (targetKey, action) => {
  if (action === 'remove') {
    tabsStore.removeTab(targetKey)
  }
}

// 添加滚动阴影效果
const isScrolled = ref(false)

// 监听滚动事件
onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 0
  }
  window.addEventListener('scroll', handleScroll)

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})
</script>

<style scoped>
@import './index.css';
</style>

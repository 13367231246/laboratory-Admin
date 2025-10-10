<template>
  <a-drawer title="主题设置" placement="right" :open="visible" @close="onClose" width="320">
    <div class="theme-settings">
      <!-- 布局设置 -->
      <div class="setting-block">
        <div class="setting-title">布局模式</div>
        <div class="layout-options">
          <div class="layout-option" :class="{ active: layoutStore.layout === 'vertical' }" @click="layoutStore.setLayout('vertical')">
            <div class="layout-preview vertical-preview"></div>
            <div>垂直布局</div>
          </div>
          <div class="layout-option" :class="{ active: layoutStore.layout === 'horizontal' }" @click="layoutStore.setLayout('horizontal')">
            <div class="layout-preview horizontal-preview"></div>
            <div>水平布局</div>
          </div>
        </div>
      </div>

      <!-- 主题模式 -->
      <div class="setting-block">
        <div class="setting-title">
          <BulbOutlined />
          <span>主题模式</span>
        </div>
        <div class="theme-mode">
          <div class="mode-item" :class="{ active: !themeStore.isDark }" @click="themeStore.isDark = false">
            <div class="mode-preview light" />
            <span>浅色</span>
          </div>
          <div class="mode-item" :class="{ active: themeStore.isDark }" @click="themeStore.isDark = true">
            <div class="mode-preview dark" />
            <span>深色</span>
          </div>
        </div>
      </div>

      <!-- 主题色 -->
      <div class="setting-block">
        <div class="setting-title">
          <BgColorsOutlined />
          <span>主题色</span>
        </div>
        <div class="setting-subtitle">系统主题色</div>
        <div class="color-list">
          <div v-for="color in presetColors" :key="color" class="color-block" :style="{ backgroundColor: color }" :class="{ active: themeStore.primaryColor === color }" @click="themeStore.setPrimaryColor(color)">
            <CheckOutlined v-if="themeStore.primaryColor === color" class="check-icon" />
          </div>
          <div class="color-block color-picker-block">
            <input type="color" class="color-picker" v-model="pickerColor" @change="handleColorPickerChange" />
            <span class="color-picker-icon">+</span>
          </div>
        </div>
        <div class="setting-subtitle">菜单栏颜色</div>
        <div class="color-list">
          <div v-for="color in menuColors" :key="color" class="color-block" :style="{ backgroundColor: color }" :class="{ active: menuColor === color }" @click="handleMenuColorChange(color)">
            <CheckOutlined v-if="menuColor === color" class="check-icon" />
          </div>
        </div>
      </div>

      <!-- 其他设置 -->
      <div class="setting-block">
        <div class="setting-title">
          <SettingOutlined />
          <span>其他设置</span>
        </div>
        <div class="setting-item">
          <span>折叠菜单</span>
          <a-switch v-model:checked="layoutStore.collapsed" size="small" />
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'
import { useLayoutStore } from '@/stores/layout'
import { generateColors } from '@/utils/colors'

const themeStore = useThemeStore()
const layoutStore = useLayoutStore()
const visible = ref(false)
const customColor = ref('')
const pickerColor = ref('#1677ff')
const isCompact = ref(false)
const isWeak = ref(false)
const menuColor = ref(localStorage.getItem('menuColor') || '#001529')

const presetColors = ['#1677ff', '#f5222d', '#fa8c16', '#52c41a', '#13c2c2', '#2f54eb', '#722ed1', '#eb2f96']
const menuColors = ['#001529', '#1f1f1f', '#0a1215', '#0c1f3d', '#1a1053']

const handleCustomColorChange = () => {
  if (/^#[0-9A-Fa-f]{6}$/.test(customColor.value)) {
    themeStore.setPrimaryColor(customColor.value)
  }
}

const handleMenuColorChange = (color) => {
  menuColor.value = color
  localStorage.setItem('menuColor', color)
  document.documentElement.style.setProperty('--menu-bg-color', color)
}

const handleColorPickerChange = () => {
  themeStore.setPrimaryColor(pickerColor.value)
}

// 初始化时确保主题色设置为默认值
onMounted(() => {
  document.documentElement.style.setProperty('--menu-bg-color', menuColor.value)

  // 确保主题色设置为默认值
  if (!themeStore.primaryColor) {
    themeStore.setPrimaryColor(presetColors[0])
  } else {
    generateColors(themeStore.primaryColor)
  }
})

// 监听主题变化
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

const show = () => {
  visible.value = true
}

const onClose = () => {
  visible.value = false
}

defineExpose({
  show
})
</script>
<style scoped>
@import './index.css';
.layout-options {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}

.layout-option {
  text-align: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.layout-option:hover {
  background: rgba(0, 0, 0, 0.04);
}

.layout-option.active {
  background: var(--ant-primary-1);
  color: var(--ant-primary-color);
}

.layout-preview {
  width: 80px;
  height: 50px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
  position: relative;
}

.vertical-preview::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 20%;
  height: 100%;
  background: #001529;
}

.horizontal-preview::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 20%;
  background: #001529;
}

.color-picker-block {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to right, #f5f5f5, #fff);
  border: 1px dashed #d9d9d9;
  overflow: hidden;
  transition: all 0.3s;
}

.color-picker-block:hover {
  border-color: var(--ant-primary-color);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.color-picker {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.color-picker-icon {
  font-size: 18px;
  font-weight: bold;
  color: #999;
  transition: all 0.3s;
}

.color-picker-block:hover .color-picker-icon {
  color: var(--ant-primary-color);
  transform: scale(1.2);
}
</style>

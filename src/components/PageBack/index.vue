<template>
  <div class="page-header" v-if="showBack">
    <div class="header-left">
      <a-button @click="handleBack" link class="back-btn">
        <left-outlined />
        {{ backText }}
      </a-button>
      <h2 class="title">{{ title }}</h2>
    </div>
    <div class="header-right" v-if="$slots.right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup>
import { LeftOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

// 定义 props
const props = defineProps({
  title: {
    type: String,
    default: '返回'
  },
  backText: {
    type: String,
    default: '返回'
  },
  backPath: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: true
  }
})

// 定义 emits
const emit = defineEmits(['back'])

const router = useRouter()

// 处理返回操作
const handleBack = () => {
  // 如果提供了自定义返回路径，则跳转到指定路径
  if (props.backPath) {
    router.push(props.backPath)
  } else {
    // 否则执行默认的返回操作
    router.back()
  }

  // 触发返回事件
  emit('back')
}
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  .back-btn {
    margin-left: 10px;
    border: 0;
    background: none;
    box-shadow: none;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  color: #606266;

  &:hover {
    color: #409eff;
  }
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
}
</style>

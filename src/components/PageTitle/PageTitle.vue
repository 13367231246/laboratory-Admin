<template>
  <div class="page-title">
    <div class="page-title-content">
      <!-- 返回按钮 -->
      <div v-if="showBack" class="page-title-back" @click="handleBack">
        <span class="back-icon">←</span>
      </div>

      <div class="page-title-main">
        <div class="page-title-header">
          <span v-if="icon" class="page-title-icon">{{ icon }}</span>
          <h1 v-if="title" class="page-title-heading">{{ title }}</h1>
        </div>
        <p v-if="description" class="page-title-description">{{ description }}</p>
      </div>
    </div>

    <!-- 右侧操作区域 -->
    <div v-if="$slots.right" class="page-title-right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineOptions({ name: 'PageTitle' })

const props = defineProps({
  // 页面图标
  icon: {
    type: String,
    default: ''
  },
  // 页面标题
  title: {
    type: String,
    default: ''
  },
  // 页面描述
  description: {
    type: String,
    default: ''
  },
  // 是否显示返回按钮
  showBack: {
    type: Boolean,
    default: false
  },
  // 自定义返回处理
  onBack: {
    type: Function,
    default: undefined
  }
})

const emit = defineEmits(['back'])
const router = useRouter()

/**
 * 处理返回操作
 */
const handleBack = () => {
  // 如果有自定义返回处理函数，优先使用
  if (props.onBack) {
    props.onBack()
  } else {
    // 触发事件给父组件处理
    emit('back')
    // 默认行为：返回上一页
    router.back()
  }
}
</script>
<style scoped lang="scss">
.page-title {
  display: flex;
  align-items: center;
  background-color: transparent;
  justify-content: space-between;
  padding: 24px;

  .page-title-back {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    cursor: pointer;
    flex-shrink: 0;

    .back-icon {
      color: #606266;
      font-size: 20px;
      font-weight: bold;
      transition: color 0.3s ease;
    }

    &:hover .back-icon {
      color: #1890ff;
    }
  }

  .page-title-main {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .page-title-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .page-title-icon {
    color: #1890ff;
    font-size: 20px;
    flex-shrink: 0;
  }

  .page-title-heading {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #262626;
    line-height: 1.2;
  }

  .page-title-description {
    margin: 0;
    font-size: 14px;
    color: #8c8c8c;
    line-height: 1.6;
  }

  .page-title-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
}

@media (max-width: 768px) {
  .page-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .page-title-content {
      width: 100%;
      flex-direction: column;
      align-items: flex-start;
    }

    .page-title-back {
      width: 36px;
      height: 36px;
    }

    .page-title-description {
      margin-left: 0; /* 移动端取消左边距 */
    }

    .page-title-right {
      width: 100%;
    }
  }
}
</style>

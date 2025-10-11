<template>
  <div class="custom-md-editor">
    <div class="editor-header" v-if="showSaveButton">
      <div class="header-left">
        <span class="editor-title">{{ title }}</span>
        <span class="save-status" v-if="hasUnsavedChanges">* 未保存</span>
      </div>
      <div class="header-right">
        <a-button type="primary" @click="handleSave" :loading="saving" :disabled="!hasUnsavedChanges"> 保存 </a-button>
      </div>
    </div>
    <MdEditor v-model="content" :toolbars="toolbars" :toolbarsExclude="toolbarsExclude" language="zh-CN" theme="light" previewTheme="github" codeTheme="github" @onUploadImg="handleUploadImg" :preview="!isMobile" :previewOnly="false" class="md-editor" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { updateFile } from '@/api/infra/file'
import { message } from 'ant-design-vue'

// 定义props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '文档编辑器'
  },
  showSaveButton: {
    type: Boolean,
    default: true
  }
})

// 定义emits
const emit = defineEmits(['update:modelValue', 'change', 'save'])

// 保存状态
const saving = ref(false)
const originalContent = ref('')
const hasUnsavedChanges = ref(false)

// 双向绑定的computed
const content = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    emit('change', value)
    // 检查是否有未保存的更改
    hasUnsavedChanges.value = value !== originalContent.value
  }
})

// 移动端状态
const isMobile = computed(() => props.isMobile)

// 监听内容变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (originalContent.value === '') {
      originalContent.value = newValue
    }
    hasUnsavedChanges.value = newValue !== originalContent.value
  },
  { immediate: true }
)

// Markdown 编辑器配置
const toolbars = computed(() => {
  const baseToolbars = [
    'bold',
    'underline',
    'italic',
    'strikeThrough',
    '-',
    'title',
    'sub',
    'sup',
    'quote',
    'unorderedList',
    'orderedList',
    'task',
    '-',
    'codeRow',
    'code',
    'link',
    'image',
    'table',
    'mermaid',
    'katex',
    '-',
    'revoke',
    'next',
    'save',
    '=',
    'pageFullscreen',
    'fullscreen',
    'catalog'
  ]

  // 移动端简化工具栏
  if (isMobile.value) {
    return ['bold', 'italic', 'underline', '-', 'title', 'quote', 'unorderedList', 'orderedList', '-', 'codeRow', 'link', 'image', '-', 'revoke', 'next']
  }

  return baseToolbars
})

const toolbarsExclude = ['github', 'htmlPreview']

// 图片上传处理
const handleUploadImg = async (files, callback) => {
  const res = await Promise.all(
    files.map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const uploadRes = await updateFile(formData)
        if (uploadRes.code === 0 && uploadRes.data) {
          // 构建完整的文件URL
          const fileUrl = uploadRes.data.url || uploadRes.data
          return `${import.meta.env.VITE_BASE_URL}/admin-api${fileUrl}`
        }
        throw new Error(uploadRes.msg || '上传失败')
      } catch (error) {
        message.error(`图片上传失败: ${error.message}`)
        return ''
      }
    })
  )

  callback(res.filter((url) => url)) // 过滤掉上传失败的图片
}

// 保存处理
const handleSave = async () => {
  if (!hasUnsavedChanges.value) {
    message.warning('没有需要保存的内容')
    return
  }

  try {
    saving.value = true
    // 触发保存事件，让父组件处理保存逻辑
    emit('save', content.value)
    // 更新原始内容
    originalContent.value = content.value
    hasUnsavedChanges.value = false
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.custom-md-editor {
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #fafbfc;
    border: 1px solid #e4e6ea;
    border-bottom: none;
    border-radius: 6px 6px 0 0;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .editor-title {
        font-size: 16px;
        font-weight: 600;
        color: #1d2129;
      }

      .save-status {
        font-size: 12px;
        color: #f56c6c;
        font-weight: 500;
      }
    }

    .header-right {
      .el-button {
        border-radius: 4px;
      }
    }
  }

  .md-editor {
    height: calc(100vh - 260px);

    :deep(.md-editor) {
      border: none;
      border-radius: 0;

      .md-editor-toolbar {
        border-bottom: 1px solid #e4e6ea;
        background: #fafbfc;
        padding: 8px 16px;

        .md-editor-toolbar-item {
          color: #4e5969;

          &:hover {
            background: #e5e6eb;
            color: #1d2129;
          }
        }
      }

      .md-editor-input-wrapper {
        .md-editor-input {
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.6;
          color: #1d2129;
          padding: 24px;

          &::placeholder {
            color: #c9cdd4;
          }
        }
      }

      .md-editor-preview-wrapper {
        padding: 0;

        .md-editor-preview {
          padding: 24px;
          color: #1d2129;
          line-height: 1.6;

          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            margin: 24px 0 16px 0;
            font-weight: 600;
            line-height: 1.4;
            color: #1d2129;
          }

          h1 {
            font-size: 28px;
          }
          h2 {
            font-size: 24px;
          }
          h3 {
            font-size: 20px;
          }

          p {
            margin: 16px 0;
            line-height: 1.6;
          }

          code {
            background: #f2f3f5;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 13px;
            color: #e74c3c;
          }

          pre {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 16px;
            margin: 16px 0;
            overflow-x: auto;

            code {
              background: transparent;
              padding: 0;
              color: #1d2129;
            }
          }

          blockquote {
            border-left: 4px solid #1e80ff;
            padding: 16px 20px;
            background: #f7f8fa;
            margin: 16px 0;
            color: #4e5969;
          }

          ul,
          ol {
            padding-left: 24px;
            margin: 16px 0;

            li {
              margin: 8px 0;
              line-height: 1.6;
            }
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;

            th,
            td {
              border: 1px solid #e4e6ea;
              padding: 12px 16px;
              text-align: left;
            }

            th {
              background: #f7f8fa;
              font-weight: 600;
            }
          }

          img {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            margin: 16px 0;
          }
        }
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .custom-md-editor {
    .md-editor {
      :deep(.md-editor) {
        .md-editor-toolbar {
          padding: 6px 12px;
          flex-wrap: wrap;
          gap: 4px;

          .md-editor-toolbar-item {
            padding: 6px 8px;
            font-size: 12px;

            &:hover {
              background: #e5e6eb;
            }
          }
        }

        .md-editor-input-wrapper {
          .md-editor-input {
            font-size: 13px;
            padding: 16px;
            line-height: 1.5;
          }
        }

        .md-editor-preview-wrapper {
          display: none; // 移动端隐藏预览
        }
      }
    }
  }
}
</style>

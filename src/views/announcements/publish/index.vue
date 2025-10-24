<template>
  <div class="announcements-container">
    <a-card :title="isEdit ? '编辑公告' : '发布新公告'" class="page-card">
      <a-form :model="formState" layout="vertical">
        <a-form-item label="标题">
          <a-input v-model:value="formState.title" placeholder="请输入公告标题" />
        </a-form-item>
        <a-form-item label="内容">
          <MarkdownEditor v-model="formState.content" @save="handleSave" />
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MarkdownEditor from '@/components/MarkdownEditor/index.vue'

const isEdit = ref(false)
const formState = ref({
  id: null,
  title: '最新优化',
  content: ''
})

onMounted(() => {
  formState.value.content = `
### 系统更新示例

#### 新功能
- **仪表盘优化**: 重新设计了UI，使其更具现代感。
- **性能提升**: 后端查询速度提升了20%。

#### Bug修复
- 修复了在特定浏览器下样式错乱的问题。

---

### 设备上新示例

我们很高兴地宣布，实验室新采购了一批 **[设备名称]**。

- **数量**: 10台
- **存放位置**: [实验室名称]
- **开放使用时间**: 2025-11-01

欢迎大家预约使用！
`
})
const handleSave = (content) => {
  // 清空原始内容
  originalContent.value = ''
}
</script>

<style scoped>
.announcements-container {
  padding: 24px;
}
.page-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>

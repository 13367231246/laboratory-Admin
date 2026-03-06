<template>
  <div class="document-list-container">
    <a-card title="协议管理" class="page-card">
      <template #extra>
        <a-button type="primary" @click="addDocument">
          <template #icon>
            <PlusOutlined />
          </template>
          新增文档
        </a-button>
      </template>
      <a-table :columns="columns" :data-source="documents" :loading="loading" :pagination="pagination" row-key="id"
        @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'doc_type'">
            <a-tag :color="getDocTypeColor(record.docType)">
              {{ getDocTypeName(record.docType) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'green' : 'orange'">
              {{ record.status === 1 ? '已发布' : '草稿' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'create_time'">
            {{ formatDate(record.createTime) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewDocument(record)">预览</a-button>
              <a-button type="link" size="small" @click="editDocument(record)">编辑</a-button>
              <a-button v-if="record.status === 0" type="link" size="small" @click="publishDocument(record.id)">
                发布
              </a-button>
              <a-button v-if="record.status === 1" type="link" size="small" @click="offlineDocument(record.id)">
                下线
              </a-button>
              <a-popconfirm title="确定要删除这篇文档吗？" @confirm="deleteDocument(record.id)">
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="viewModalVisible" :title="currentDocument.title" :footer="null" width="800px">
      <MarkdownView :content="currentDocument.content" />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  getDocumentListService,
  deleteDocumentService,
  publishDocumentService,
  offlineDocumentService
} from '@/api/document'
import MarkdownView from '@/components/MarkdownView/index.vue'

const router = useRouter()

const loading = ref(false)
const documents = ref([])
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total) => `共 ${total} 条`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

const columns = [
  { title: '标题', dataIndex: 'title', key: 'title' },
  { title: '文档类型', dataIndex: 'doc_type', key: 'doc_type', width: 120 },
  { title: '版本号', dataIndex: 'version', key: 'version', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'create_time', key: 'create_time', width: 180 },
  { title: '操作', key: 'action', width: 300 }
]

const viewModalVisible = ref(false)
const currentDocument = ref({})

const getDocTypeName = (type) => {
  const typeMap = {
    'protocol': '协议',
    'manual': '手册',
    'rule': '规则',
    'other': '其他'
  }
  return typeMap[type] || type
}

const getDocTypeColor = (type) => {
  const colorMap = {
    'protocol': 'blue',
    'manual': 'green',
    'rule': 'orange',
    'other': 'default'
  }
  return colorMap[type] || 'default'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadDocuments = async () => {
  loading.value = true
  const response = await getDocumentListService(pagination.value.current, pagination.value.pageSize)
  if (response.code === 0 && response.data) {
    documents.value = response.data.items || []
    pagination.value.total = response.data.total || 0
  }
  loading.value = false
}

const handleTableChange = (pag) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadDocuments()
}

const viewDocument = (document) => {
  currentDocument.value = document
  viewModalVisible.value = true
}

const addDocument = () => {
  router.push({ name: 'PublishAnnouncement' })
}

const editDocument = (document) => {
  router.push({ name: 'PublishAnnouncement', params: { id: document.id } })
}

const deleteDocument = async (id) => {
  const response = await deleteDocumentService(id)
  if (response.code === 0) {
    message.success('删除成功')
    loadDocuments()
  }
}

const publishDocument = async (id) => {
  const response = await publishDocumentService(id)
  if (response.code === 0) {
    message.success('发布成功')
    loadDocuments()
  }
}

const offlineDocument = async (id) => {
  const response = await offlineDocumentService(id)
  if (response.code === 0) {
    message.success('下线成功')
    loadDocuments()
  }
}

onMounted(() => {
  loadDocuments()
})
</script>

<style scoped>
.document-list-container {
  padding: 24px;
}

.page-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>

<template>
  <div class="notice-list-container">
    <a-card title="公告管理" class="page-card">
      <template #extra>
        <a-button type="primary" @click="addNotice">
          <template #icon>
            <PlusOutlined />
          </template>
          新增公告
        </a-button>
      </template>
      <a-table 
        :columns="columns" 
        :data-source="notices" 
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusName(record.status) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'createTime'">
            {{ formatDate(record.createTime) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewNotice(record)">预览</a-button>
              <a-button type="link" size="small" @click="editNotice(record)">编辑</a-button>
              <a-button 
                v-if="record.status === 0" 
                type="link" 
                size="small" 
                @click="publishNotice(record.id)"
              >
                发布
              </a-button>
              <a-button 
                v-if="record.status === 1" 
                type="link" 
                size="small" 
                @click="offlineNotice(record.id)"
              >
                下线
              </a-button>
              <a-popconfirm title="确定要删除这篇公告吗？" @confirm="deleteNotice(record.id)">
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="viewModalVisible" :title="currentNotice.title" :footer="null" width="800px">
      <MarkdownView :content="currentNotice.content" />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { 
  getNoticeListService, 
  deleteNoticeService, 
  publishNoticeService, 
  offlineNoticeService 
} from '@/api/notice'
import MarkdownView from '@/components/MarkdownView/index.vue'

const router = useRouter()

const loading = ref(false)
const notices = ref([])
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
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 300 }
]

const viewModalVisible = ref(false)
const currentNotice = ref({})

const getStatusName = (status) => {
  const statusMap = {
    0: '草稿',
    1: '已发布',
    2: '已下线'
  }
  return statusMap[status] || '未知'
}

const getStatusColor = (status) => {
  const colorMap = {
    0: 'orange',
    1: 'green',
    2: 'default'
  }
  return colorMap[status] || 'default'
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

const loadNotices = async () => {
  loading.value = true
  const response = await getNoticeListService(pagination.value.current, pagination.value.pageSize)
  if (response.code === 0 && response.data) {
    notices.value = response.data.items || []
    pagination.value.total = response.data.total || 0
  }
  loading.value = false
}

const handleTableChange = (pag) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadNotices()
}

const viewNotice = (notice) => {
  currentNotice.value = notice
  viewModalVisible.value = true
}

const addNotice = () => {
  router.push({ name: 'PublishNotice' })
}

const editNotice = (notice) => {
  router.push({ name: 'PublishNotice', params: { id: notice.id } })
}

const deleteNotice = async (id) => {
  const response = await deleteNoticeService(id)
  if (response.code === 0) {
    message.success('删除成功')
    loadNotices()
  }
}

const publishNotice = async (id) => {
  const response = await publishNoticeService(id)
  if (response.code === 0) {
    message.success('发布成功')
    loadNotices()
  }
}

const offlineNotice = async (id) => {
  const response = await offlineNoticeService(id)
  if (response.code === 0) {
    message.success('下线成功')
    loadNotices()
  }
}

onMounted(() => {
  loadNotices()
})
</script>

<style scoped>
.notice-list-container {
  padding: 24px;
}

.page-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>


<template>
  <div class="feedback-container">
    <a-card title="反馈处理" class="page-card">
      <!-- 统计卡片 -->
      <a-row :gutter="16" style="margin-bottom: 24px">
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic title="待处理" :value="feedbackStats.pending" :value-style="{ color: '#faad14' }">
              <template #prefix>
                <clock-circle-outlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic title="处理中" :value="feedbackStats.processing" :value-style="{ color: '#1890ff' }">
              <template #prefix>
                <loading-outlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic title="已解决" :value="feedbackStats.resolved" :value-style="{ color: '#52c41a' }">
              <template #prefix>
                <check-circle-outlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic title="满意度" :value="feedbackStats.satisfaction" suffix="%" :value-style="{ color: '#722ed1' }">
              <template #prefix>
                <heart-outlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>

      <!-- 搜索筛选 -->
      <div class="search-section">
        <a-input v-model:value="searchForm.title" placeholder="搜索反馈标题" allow-clear @change="handleSearch" class="search-input">
          <template #prefix>
            <search-outlined />
          </template>
        </a-input>

        <a-select v-model:value="searchForm.type" placeholder="选择类型" allow-clear @change="handleSearch" class="search-input">
          <a-select-option value="complaint">投诉</a-select-option>
          <a-select-option value="suggestion">建议</a-select-option>
          <a-select-option value="bug">故障报告</a-select-option>
          <a-select-option value="praise">表扬</a-select-option>
        </a-select>

        <a-select v-model:value="searchForm.status" placeholder="选择状态" allow-clear @change="handleSearch" class="search-input">
          <a-select-option value="pending">待处理</a-select-option>
          <a-select-option value="processing">处理中</a-select-option>
          <a-select-option value="resolved">已解决</a-select-option>
          <a-select-option value="closed">已关闭</a-select-option>
        </a-select>

        <a-button type="primary" @click="handleSearch">
          <search-outlined />
          搜索
        </a-button>
        <a-button style="margin-left: 8px" @click="handleReset"> 重置 </a-button>
      </div>

      <!-- 反馈列表 -->
      <a-table :columns="columns" :data-source="filteredFeedback" :pagination="pagination" :loading="loading" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeText(record.type) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ getPriorityText(record.priority) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'satisfaction'">
            <a-rate :value="record.satisfaction" disabled />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleView(record)"> 查看 </a-button>
              <a-button type="link" size="small" @click="handleReply(record)"> 回复 </a-button>
              <a-button v-if="record.status === 'pending'" type="link" size="small" @click="handleProcess(record)"> 处理 </a-button>
              <a-button v-if="record.status === 'processing'" type="link" size="small" @click="handleResolve(record)"> 解决 </a-button>
              <a-popconfirm title="确定要关闭该反馈吗？" @confirm="handleClose(record)">
                <a-button type="link" size="small" danger> 关闭 </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 反馈详情模态框 -->
    <a-modal v-model:open="viewModalVisible" title="反馈详情" width="800px" :footer="null">
      <div v-if="currentFeedback" class="feedback-detail">
        <a-descriptions :column="2">
          <a-descriptions-item label="反馈标题">{{ currentFeedback.title }}</a-descriptions-item>
          <a-descriptions-item label="反馈类型">
            <a-tag :color="getTypeColor(currentFeedback.type)">
              {{ getTypeText(currentFeedback.type) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="反馈人">{{ currentFeedback.submitter }}</a-descriptions-item>
          <a-descriptions-item label="联系方式">{{ currentFeedback.contact }}</a-descriptions-item>
          <a-descriptions-item label="优先级">
            <a-tag :color="getPriorityColor(currentFeedback.priority)">
              {{ getPriorityText(currentFeedback.priority) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(currentFeedback.status)">
              {{ getStatusText(currentFeedback.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="提交时间">{{ currentFeedback.createdAt }}</a-descriptions-item>
          <a-descriptions-item label="处理人">{{ currentFeedback.handler || '未分配' }}</a-descriptions-item>
        </a-descriptions>

        <div class="content-section">
          <h4>反馈内容：</h4>
          <div class="feedback-content">{{ currentFeedback.content }}</div>
        </div>

        <div v-if="currentFeedback.replies && currentFeedback.replies.length > 0" class="replies-section">
          <h4>处理记录：</h4>
          <a-timeline>
            <a-timeline-item v-for="reply in currentFeedback.replies" :key="reply.id">
              <div class="reply-item">
                <div class="reply-header">
                  <span class="reply-author">{{ reply.author }}</span>
                  <span class="reply-time">{{ reply.time }}</span>
                </div>
                <div class="reply-content">{{ reply.content }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>
      </div>
    </a-modal>

    <!-- 回复反馈模态框 -->
    <a-modal v-model:open="replyModalVisible" title="回复反馈" @ok="handleReplyOk" @cancel="handleReplyCancel">
      <a-form ref="replyFormRef" :model="replyData" :rules="replyRules" layout="vertical">
        <a-form-item label="回复内容" name="content">
          <a-textarea v-model:value="replyData.content" placeholder="请输入回复内容" :rows="4" />
        </a-form-item>
        <a-form-item label="处理状态" name="status">
          <a-select v-model:value="replyData.status">
            <a-select-option value="processing">处理中</a-select-option>
            <a-select-option value="resolved">已解决</a-select-option>
            <a-select-option value="closed">已关闭</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, ClockCircleOutlined, LoadingOutlined, CheckCircleOutlined, HeartOutlined } from '@ant-design/icons-vue'

const loading = ref(false)
const viewModalVisible = ref(false)
const replyModalVisible = ref(false)
const replyFormRef = ref()
const currentFeedback = ref(null)

// 搜索表单
const searchForm = reactive({
  title: '',
  type: '',
  status: ''
})

// 数据
const feedback = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 反馈统计
const feedbackStats = reactive({
  pending: 0,
  processing: 0,
  resolved: 0,
  satisfaction: 0
})

// 回复数据
const replyData = reactive({
  content: '',
  status: 'processing'
})

// 表格列配置
const columns = [
  {
    title: '反馈标题',
    dataIndex: 'title',
    key: 'title',
    width: 200
  },
  {
    title: '类型',
    key: 'type',
    width: 100
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 100
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '反馈人',
    dataIndex: 'submitter',
    key: 'submitter',
    width: 120
  },
  {
    title: '满意度',
    key: 'satisfaction',
    width: 120
  },
  {
    title: '提交时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 120
  },
  {
    title: '操作',
    key: 'action',
    width: 200
  }
]

// 回复表单验证规则
const replyRules = {
  content: [{ required: true, message: '请输入回复内容' }],
  status: [{ required: true, message: '请选择处理状态' }]
}

// 获取类型颜色
const getTypeColor = (type) => {
  const colors = {
    complaint: 'red',
    suggestion: 'blue',
    bug: 'orange',
    praise: 'green'
  }
  return colors[type] || 'default'
}

// 获取类型文本
const getTypeText = (type) => {
  const texts = {
    complaint: '投诉',
    suggestion: '建议',
    bug: '故障报告',
    praise: '表扬'
  }
  return texts[type] || type
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    processing: 'blue',
    resolved: 'green',
    closed: 'gray'
  }
  return colors[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    closed: '已关闭'
  }
  return texts[status] || status
}

// 获取优先级颜色
const getPriorityColor = (priority) => {
  const colors = {
    low: 'green',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
  }
  return colors[priority] || 'default'
}

// 获取优先级文本
const getPriorityText = (priority) => {
  const texts = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return texts[priority] || priority
}

// 筛选后的反馈数据
const filteredFeedback = computed(() => {
  let result = feedback.value

  if (searchForm.title) {
    result = result.filter((item) => item.title.toLowerCase().includes(searchForm.title.toLowerCase()))
  }

  if (searchForm.type) {
    result = result.filter((item) => item.type === searchForm.type)
  }

  if (searchForm.status) {
    result = result.filter((item) => item.status === searchForm.status)
  }

  return result
})

// 加载反馈数据
const loadFeedback = async () => {
  loading.value = true
  try {
    // 模拟数据
    feedback.value = [
      {
        id: 1,
        title: '实验室设备故障',
        type: 'bug',
        priority: 'high',
        status: 'pending',
        submitter: '张老师',
        contact: '138****8888',
        content: '化学实验室A的显微镜出现故障，无法正常使用，请尽快维修。',
        satisfaction: 0,
        createdAt: '2024-01-15',
        handler: null,
        replies: []
      },
      {
        id: 2,
        title: '建议增加实验室开放时间',
        type: 'suggestion',
        priority: 'medium',
        status: 'processing',
        submitter: '李同学',
        contact: '139****9999',
        content: '建议将实验室开放时间延长到晚上10点，方便学生进行实验。',
        satisfaction: 0,
        createdAt: '2024-01-10',
        handler: '王管理员',
        replies: [
          {
            id: 1,
            author: '王管理员',
            time: '2024-01-12',
            content: '感谢您的建议，我们正在考虑延长开放时间。'
          }
        ]
      },
      {
        id: 3,
        title: '实验室环境很好',
        type: 'praise',
        priority: 'low',
        status: 'resolved',
        submitter: '刘同学',
        contact: '137****7777',
        content: '实验室环境整洁，设备齐全，使用体验很好。',
        satisfaction: 5,
        createdAt: '2024-01-08',
        handler: '李管理员',
        replies: [
          {
            id: 1,
            author: '李管理员',
            time: '2024-01-09',
            content: '谢谢您的反馈，我们会继续保持良好的实验室环境。'
          }
        ]
      }
    ]

    // 计算统计
    updateStats()
    pagination.total = feedback.value.length
  } catch (error) {
    message.error('加载反馈数据失败')
  } finally {
    loading.value = false
  }
}

// 更新统计
const updateStats = () => {
  feedbackStats.pending = feedback.value.filter((item) => item.status === 'pending').length
  feedbackStats.processing = feedback.value.filter((item) => item.status === 'processing').length
  feedbackStats.resolved = feedback.value.filter((item) => item.status === 'resolved').length

  const totalSatisfaction = feedback.value.filter((item) => item.satisfaction > 0).reduce((sum, item) => sum + item.satisfaction, 0)
  const satisfactionCount = feedback.value.filter((item) => item.satisfaction > 0).length
  feedbackStats.satisfaction = satisfactionCount > 0 ? Math.round((totalSatisfaction / satisfactionCount) * 20) : 0
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    title: '',
    type: '',
    status: ''
  })
  handleSearch()
}

// 表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

// 查看反馈
const handleView = (record) => {
  currentFeedback.value = record
  viewModalVisible.value = true
}

// 回复反馈
const handleReply = (record) => {
  currentFeedback.value = record
  replyModalVisible.value = true
  Object.assign(replyData, {
    content: '',
    status: record.status === 'pending' ? 'processing' : record.status
  })
}

// 处理反馈
const handleProcess = (record) => {
  record.status = 'processing'
  record.handler = '当前管理员'
  updateStats()
  message.success('反馈已开始处理')
}

// 解决反馈
const handleResolve = (record) => {
  record.status = 'resolved'
  updateStats()
  message.success('反馈已标记为已解决')
}

// 关闭反馈
const handleClose = (record) => {
  record.status = 'closed'
  updateStats()
  message.success('反馈已关闭')
}

// 回复确认
const handleReplyOk = async () => {
  try {
    await replyFormRef.value.validate()

    if (currentFeedback.value) {
      const reply = {
        id: Date.now(),
        author: '当前管理员',
        time: new Date().toISOString().split('T')[0],
        content: replyData.content
      }

      if (!currentFeedback.value.replies) {
        currentFeedback.value.replies = []
      }
      currentFeedback.value.replies.push(reply)

      currentFeedback.value.status = replyData.status
      updateStats()
      message.success('回复成功')
      replyModalVisible.value = false
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 回复取消
const handleReplyCancel = () => {
  replyModalVisible.value = false
  replyFormRef.value?.resetFields()
}

onMounted(() => {
  loadFeedback()
})
</script>

<style scoped>
.feedback-container {
  padding: 24px;
}

.page-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-card {
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-section {
  margin-bottom: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 6px;
}

.feedback-detail {
  max-height: 600px;
  overflow-y: auto;
}

.content-section {
  margin-top: 24px;
}

.feedback-content {
  padding: 16px;
  background-color: #fafafa;
  border-radius: 6px;
  white-space: pre-wrap;
  line-height: 1.6;
}

.replies-section {
  margin-top: 24px;
}

.reply-item {
  margin-bottom: 16px;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.reply-content {
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  line-height: 1.5;
}

.search-section {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 6px;
}
.search-input {
  width: 240px;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f5f5f5;
}
</style>

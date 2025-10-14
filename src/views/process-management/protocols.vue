<template>
  <div class="protocols-container">
    <a-card title="协议管理" class="page-card">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showAddModal">
            <plus-outlined />
            发布协议
          </a-button>
          <a-button @click="handleTemplate">
            <file-text-outlined />
            协议模板
          </a-button>
        </a-space>
      </template>

      <!-- 搜索筛选 -->
      <div class="search-section">
        <a-input v-model:value="searchForm.title" placeholder="搜索协议标题" allow-clear @change="handleSearch" class="search-input">
          <template #prefix>
            <search-outlined />
          </template>
        </a-input>

        <a-select v-model:value="searchForm.type" placeholder="选择类型" allow-clear @change="handleSearch" class="search-input">
          <a-select-option value="usage">使用协议</a-select-option>
          <a-select-option value="safety">安全协议</a-select-option>
          <a-select-option value="maintenance">维护协议</a-select-option>
          <a-select-option value="emergency">应急协议</a-select-option>
        </a-select>

        <a-select v-model:value="searchForm.status" placeholder="选择状态" allow-clear @change="handleSearch" class="search-input">
          <a-select-option value="draft">草稿</a-select-option>
          <a-select-option value="published">已发布</a-select-option>
        </a-select>

        <a-button type="primary" @click="handleSearch">
          <search-outlined />
          搜索
        </a-button>
        <a-button style="margin-left: 8px" @click="handleReset"> 重置 </a-button>
      </div>

      <!-- 协议列表 -->
      <a-table :columns="columns" :data-source="filteredProtocols" :pagination="pagination" :loading="loading" row-key="id" @change="handleTableChange">
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
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleView(record)"> 查看 </a-button>
              <a-button type="link" size="small" @click="handleEdit(record)"> 编辑 </a-button>
              <a-button v-if="record.status === 'draft'" type="link" size="small" @click="handlePublish(record)"> 发布 </a-button>
              <a-popconfirm title="确定要删除该协议吗？" @confirm="handleDelete(record)">
                <a-button type="link" size="small" danger> 删除 </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 添加/编辑协议模态框 -->
    <a-modal v-model:open="modalVisible" :title="isEdit ? '编辑协议' : '发布协议'" width="1000px" @ok="handleModalOk" @cancel="handleModalCancel">
      <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="协议标题" name="title">
              <a-input v-model:value="formData.title" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="协议类型" name="type">
              <a-select v-model:value="formData.type">
                <a-select-option value="usage">使用协议</a-select-option>
                <a-select-option value="safety">安全协议</a-select-option>
                <a-select-option value="maintenance">维护协议</a-select-option>
                <a-select-option value="emergency">应急协议</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="优先级" name="priority">
              <a-select v-model:value="formData.priority">
                <a-select-option value="low">低</a-select-option>
                <a-select-option value="medium">中</a-select-option>
                <a-select-option value="high">高</a-select-option>
                <a-select-option value="urgent">紧急</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="适用范围" name="scope">
              <a-select v-model:value="formData.scope" mode="multiple">
                <a-select-option value="all">全部实验室</a-select-option>
                <a-select-option value="chemistry">化学实验室</a-select-option>
                <a-select-option value="physics">物理实验室</a-select-option>
                <a-select-option value="biology">生物实验室</a-select-option>
                <a-select-option value="computer">计算机实验室</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="协议内容" name="content">
          <a-textarea v-model:value="formData.content" placeholder="请输入协议内容" :rows="8" />
        </a-form-item>

        <a-form-item label="附件" name="attachments">
          <a-upload v-model:file-list="fileList" :before-upload="beforeUpload" multiple>
            <a-button>
              <upload-outlined />
              上传附件
            </a-button>
          </a-upload>
        </a-form-item>

        <a-form-item label="生效时间" name="effectiveDate">
          <a-date-picker v-model:value="formData.effectiveDate" style="width: 100%" />
        </a-form-item>

        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="formData.remark" placeholder="请输入备注信息" :rows="2" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 协议详情模态框 -->
    <a-modal v-model:open="viewModalVisible" title="协议详情" width="800px" :footer="null">
      <div v-if="currentProtocol" class="protocol-detail">
        <a-descriptions :column="2">
          <a-descriptions-item label="协议标题">{{ currentProtocol.title }}</a-descriptions-item>
          <a-descriptions-item label="协议类型">
            <a-tag :color="getTypeColor(currentProtocol.type)">
              {{ getTypeText(currentProtocol.type) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="优先级">
            <a-tag :color="getPriorityColor(currentProtocol.priority)">
              {{ getPriorityText(currentProtocol.priority) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(currentProtocol.status)">
              {{ getStatusText(currentProtocol.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="适用范围">{{ currentProtocol.scope.join(', ') }}</a-descriptions-item>
          <a-descriptions-item label="生效时间">{{ currentProtocol.effectiveDate }}</a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ currentProtocol.createdAt }}</a-descriptions-item>
          <a-descriptions-item label="更新时间">{{ currentProtocol.updatedAt }}</a-descriptions-item>
        </a-descriptions>

        <div class="content-section">
          <h4>协议内容：</h4>
          <div class="protocol-content">{{ currentProtocol.content }}</div>
        </div>

        <div v-if="currentProtocol.attachments && currentProtocol.attachments.length > 0" class="attachments-section">
          <h4>附件：</h4>
          <a-list :data-source="currentProtocol.attachments" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <a :href="item.url" target="_blank">{{ item.name }}</a>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { PlusOutlined, SearchOutlined, FileTextOutlined, UploadOutlined } from '@ant-design/icons-vue'

const loading = ref(false)
const modalVisible = ref(false)
const viewModalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const fileList = ref([])
const currentProtocol = ref(null)

// 搜索表单
const searchForm = reactive({
  title: '',
  type: '',
  status: ''
})

// 表格数据
const protocols = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 表格列配置
const columns = [
  {
    title: '协议标题',
    dataIndex: 'title',
    key: 'title',
    width: 200
  },
  {
    title: '类型',
    key: 'type',
    width: 120
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
    title: '适用范围',
    dataIndex: 'scope',
    key: 'scope',
    width: 150
  },
  {
    title: '生效时间',
    dataIndex: 'effectiveDate',
    key: 'effectiveDate',
    width: 120
  },
  {
    title: '创建时间',
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

// 表单数据
const formData = reactive({
  title: '',
  type: '',
  priority: 'medium',
  scope: ['all'],
  content: '',
  effectiveDate: null,
  remark: ''
})

// 表单验证规则
const formRules = {
  title: [{ required: true, message: '请输入协议标题' }],
  type: [{ required: true, message: '请选择协议类型' }],
  priority: [{ required: true, message: '请选择优先级' }],
  scope: [{ required: true, message: '请选择适用范围' }],
  content: [{ required: true, message: '请输入协议内容' }],
  effectiveDate: [{ required: true, message: '请选择生效时间' }]
}

// 获取类型颜色
const getTypeColor = (type) => {
  const colors = {
    usage: 'blue',
    safety: 'red',
    maintenance: 'orange',
    emergency: 'purple'
  }
  return colors[type] || 'default'
}

// 获取类型文本
const getTypeText = (type) => {
  const texts = {
    usage: '使用协议',
    safety: '安全协议',
    maintenance: '维护协议',
    emergency: '应急协议'
  }
  return texts[type] || type
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    draft: 'orange',
    published: 'green',
    archived: 'gray'
  }
  return colors[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    draft: '草稿',
    published: '已发布'
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

// 筛选后的协议数据
const filteredProtocols = computed(() => {
  let result = protocols.value

  if (searchForm.title) {
    result = result.filter((protocol) => protocol.title.toLowerCase().includes(searchForm.title.toLowerCase()))
  }

  if (searchForm.type) {
    result = result.filter((protocol) => protocol.type === searchForm.type)
  }

  if (searchForm.status) {
    result = result.filter((protocol) => protocol.status === searchForm.status)
  }

  return result
})

// 加载协议数据
const loadProtocols = async () => {
  loading.value = true
  try {
    // 模拟数据
    protocols.value = [
      {
        id: 1,
        title: '实验室安全使用协议',
        type: 'safety',
        priority: 'high',
        status: 'published',
        scope: ['all'],
        content: '为了确保实验室安全，所有使用者必须遵守以下安全协议...',
        effectiveDate: '2024-01-01',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        attachments: [{ name: '安全协议.pdf', url: '/files/safety-protocol.pdf' }]
      },
      {
        id: 2,
        title: '设备维护保养协议',
        type: 'maintenance',
        priority: 'medium',
        status: 'published',
        scope: ['chemistry', 'physics'],
        content: '设备维护保养是确保实验室设备正常运行的重要措施...',
        effectiveDate: '2024-01-15',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-15',
        attachments: []
      },
      {
        id: 3,
        title: '应急处理预案',
        type: 'emergency',
        priority: 'urgent',
        status: 'draft',
        scope: ['all'],
        content: '在发生紧急情况时，请按照以下预案进行处理...',
        effectiveDate: '2024-02-01',
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20',
        attachments: []
      }
    ]
    pagination.total = protocols.value.length
  } catch (error) {
    message.error('加载协议数据失败')
  } finally {
    loading.value = false
  }
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

// 显示添加模态框
const showAddModal = () => {
  isEdit.value = false
  modalVisible.value = true
  fileList.value = []
  Object.assign(formData, {
    title: '',
    type: '',
    priority: 'medium',
    scope: ['all'],
    content: '',
    effectiveDate: null,
    remark: ''
  })
}

// 查看协议
const handleView = (record) => {
  currentProtocol.value = record
  viewModalVisible.value = true
}

// 编辑协议
const handleEdit = (record) => {
  isEdit.value = true
  modalVisible.value = true
  Object.assign(formData, {
    ...record,
    effectiveDate: dayjs(record.effectiveDate)
  })
  fileList.value = record.attachments || []
}

// 发布协议
const handlePublish = (record) => {
  record.status = 'published'
  message.success('协议发布成功')
}

// 删除协议
const handleDelete = (record) => {
  const index = protocols.value.findIndex((protocol) => protocol.id === record.id)
  if (index > -1) {
    protocols.value.splice(index, 1)
    message.success('协议删除成功')
  }
}

// 协议模板
const handleTemplate = () => {
  message.info('协议模板功能')
}

// 上传前处理
const beforeUpload = (file) => {
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('文件大小不能超过 10MB!')
    return false
  }
  return false // 阻止自动上传
}

// 模态框确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()

    if (isEdit.value) {
      // 编辑协议
      const index = protocols.value.findIndex((protocol) => protocol.id === formData.id)
      if (index > -1) {
        Object.assign(protocols.value[index], {
          ...formData,
          effectiveDate: formData.effectiveDate ? formData.effectiveDate.format('YYYY-MM-DD') : null,
          updatedAt: new Date().toISOString().split('T')[0],
          attachments: fileList.value
        })
        message.success('协议更新成功')
      }
    } else {
      // 添加协议
      const newProtocol = {
        ...formData,
        id: Date.now(),
        status: 'draft',
        effectiveDate: formData.effectiveDate ? formData.effectiveDate.format('YYYY-MM-DD') : null,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        attachments: fileList.value
      }
      protocols.value.unshift(newProtocol)
      message.success('协议添加成功')
    }

    modalVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 模态框取消
const handleModalCancel = () => {
  modalVisible.value = false
  formRef.value?.resetFields()
  fileList.value = []
}

onMounted(() => {
  loadProtocols()
})
</script>

<style scoped>
.protocols-container {
  padding: 24px;
}

.page-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.protocol-detail {
  max-height: 600px;
  overflow-y: auto;
}

.content-section {
  margin-top: 24px;
}

.protocol-content {
  padding: 16px;
  background-color: #fafafa;
  border-radius: 6px;
  white-space: pre-wrap;
  line-height: 1.6;
}

.attachments-section {
  margin-top: 24px;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f5f5f5;
}
</style>

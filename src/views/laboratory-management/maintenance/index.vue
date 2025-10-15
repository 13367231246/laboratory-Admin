<template>
  <div class="maintenance-container">
    <a-card title="维护管理" class="page-card">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showAddModal">
            <plus-outlined />
            添加维护任务
          </a-button>
          <a-button @click="handleScheduleMaintenance">
            <calendar-outlined />
            安排维护
          </a-button>
        </a-space>
      </template>

      <!-- 统计卡片 -->
      <a-row :gutter="16" style="margin-bottom: 24px">
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic title="待维护" :value="maintenanceStats.pending" :value-style="{ color: '#faad14' }">
              <template #prefix>
                <clock-circle-outlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic title="进行中" :value="maintenanceStats.inProgress" :value-style="{ color: '#1890ff' }">
              <template #prefix>
                <loading-outlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic title="已完成" :value="maintenanceStats.completed" :value-style="{ color: '#52c41a' }">
              <template #prefix>
                <check-circle-outlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic title="超期" :value="maintenanceStats.overdue" :value-style="{ color: '#f5222d' }">
              <template #prefix>
                <exclamation-circle-outlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>

      <!-- 搜索筛选 -->
      <div class="search-section">
        <a-input v-model:value="searchForm.title" placeholder="搜索维护任务" allow-clear @change="handleSearch" class="search-input">
          <template #prefix>
            <search-outlined />
          </template>
        </a-input>

        <a-select v-model:value="searchForm.status" placeholder="选择状态" allow-clear @change="handleSearch" class="search-input">
          <a-select-option value="pending">待维护</a-select-option>
          <a-select-option value="inProgress">进行中</a-select-option>
          <a-select-option value="completed">已完成</a-select-option>
          <a-select-option value="overdue">超期</a-select-option>
        </a-select>

        <a-select v-model:value="searchForm.priority" placeholder="选择优先级" allow-clear @change="handleSearch" class="search-input">
          <a-select-option value="low">低</a-select-option>
          <a-select-option value="medium">中</a-select-option>
          <a-select-option value="high">高</a-select-option>
          <a-select-option value="urgent">紧急</a-select-option>
        </a-select>

        <a-button type="primary" @click="handleSearch">
          <search-outlined />
          搜索
        </a-button>
        <a-button style="margin-left: 8px" @click="handleReset"> 重置 </a-button>
      </div>

      <!-- 维护任务列表 -->
      <a-table :columns="columns" :data-source="filteredMaintenance" :pagination="pagination" :loading="loading" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeText(record.type) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ getPriorityText(record.priority) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'progress'">
            <a-progress :percent="record.progress" :show-info="false" size="small" />
            <span style="margin-left: 8px">{{ record.progress }}%</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleView(record)"> 查看 </a-button>
              <a-button type="link" size="small" @click="handleEdit(record)"> 编辑 </a-button>
              <a-button v-if="record.status === 'pending'" type="link" size="small" @click="handleStart(record)"> 开始 </a-button>
              <a-button v-if="record.status === 'inProgress'" type="link" size="small" @click="handleComplete(record)"> 完成 </a-button>
              <a-popconfirm title="确定要删除该维护任务吗？" @confirm="handleDelete(record)">
                <a-button type="link" size="small" danger> 删除 </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 添加/编辑维护任务模态框 -->
    <a-modal v-model:open="modalVisible" :title="isEdit ? '编辑维护任务' : '添加维护任务'" width="800px" @ok="handleModalOk" @cancel="handleModalCancel">
      <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="任务标题" name="title">
              <a-input v-model:value="formData.title" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="维护类型" name="type">
              <a-select v-model:value="formData.type">
                <a-select-option value="routine">常规维护</a-select-option>
                <a-select-option value="repair">故障维修</a-select-option>
                <a-select-option value="cleaning">清洁保养</a-select-option>
                <a-select-option value="inspection">安全检查</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="关联实验室" name="laboratoryId">
              <a-select v-model:value="formData.laboratoryId">
                <a-select-option v-for="lab in laboratories" :key="lab.id" :value="lab.id">
                  {{ lab.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="关联设备" name="equipmentId">
              <a-select v-model:value="formData.equipmentId">
                <a-select-option v-for="equipment in filteredEquipment" :key="equipment.id" :value="equipment.id">
                  {{ equipment.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="负责人" name="assignee">
              <a-input v-model:value="formData.assignee" />
            </a-form-item>
          </a-col>
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
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="计划开始时间" name="plannedStartDate">
              <a-date-picker v-model:value="formData.plannedStartDate" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="计划完成时间" name="plannedEndDate">
              <a-date-picker v-model:value="formData.plannedEndDate" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="维护内容" name="description">
          <a-textarea v-model:value="formData.description" placeholder="请详细描述维护内容" :rows="4" />
        </a-form-item>

        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="formData.remark" placeholder="请输入备注信息" :rows="2" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { PlusOutlined, SearchOutlined, CalendarOutlined, ClockCircleOutlined, LoadingOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { mockApi } from '@/api/mockData'

const loading = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

// 搜索表单
const searchForm = reactive({
  title: '',
  status: '',
  type: ''
})

// 数据
const laboratories = ref([])
const equipment = ref([])
const maintenance = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 维护统计
const maintenanceStats = reactive({
  pending: 0,
  inProgress: 0,
  completed: 0,
  overdue: 0
})

// 表格列配置
const columns = [
  {
    title: '任务标题',
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
    title: '负责人',
    dataIndex: 'assignee',
    key: 'assignee',
    width: 120
  },

  {
    title: '计划时间',
    dataIndex: 'plannedStartDate',
    key: 'plannedStartDate',
    width: 150
  },
  {
    title: '状态',
    key: 'status',
    width: 100
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
  laboratoryId: '',
  equipmentId: '',
  assignee: '',
  priority: 'medium',
  plannedStartDate: null,
  plannedEndDate: null,
  description: '',
  remark: ''
})

// 表单验证规则
const formRules = {
  title: [{ required: true, message: '请输入任务标题' }],
  type: [{ required: true, message: '请选择维护类型' }],
  laboratoryId: [{ required: true, message: '请选择关联实验室' }],
  assignee: [{ required: true, message: '请输入负责人' }],
  priority: [{ required: true, message: '请选择优先级' }],
  plannedStartDate: [{ required: true, message: '请选择计划开始时间' }],
  plannedEndDate: [{ required: true, message: '请选择计划完成时间' }]
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    inProgress: 'blue',
    completed: 'green',
    overdue: 'red'
  }
  return colors[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    pending: '待维护',
    inProgress: '进行中',
    completed: '已完成',
    overdue: '超期'
  }
  return texts[status] || status
}

// 获取类型颜色
const getTypeColor = (type) => {
  const colors = {
    routine: 'blue',
    repair: 'red',
    cleaning: 'green',
    inspection: 'orange'
  }
  return colors[type] || 'default'
}

// 获取类型文本
const getTypeText = (type) => {
  const texts = {
    routine: '常规维护',
    repair: '故障维修',
    cleaning: '清洁保养',
    inspection: '安全检查'
  }
  return texts[type] || type
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

// 筛选后的维护数据
const filteredMaintenance = computed(() => {
  let result = maintenance.value

  if (searchForm.title) {
    result = result.filter((item) => item.title.toLowerCase().includes(searchForm.title.toLowerCase()))
  }

  if (searchForm.status) {
    result = result.filter((item) => item.status === searchForm.status)
  }

  if (searchForm.type) {
    result = result.filter((item) => item.type === searchForm.type)
  }

  return result
})

// 筛选后的设备数据
const filteredEquipment = computed(() => {
  if (!formData.laboratoryId) return equipment.value
  return equipment.value.filter((item) => item.laboratoryId === formData.laboratoryId)
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 加载实验室数据
    const labsRes = await mockApi.getLaboratories()
    laboratories.value = labsRes.data

    // 加载设备数据
    const equipmentRes = await mockApi.getEquipment()
    equipment.value = equipmentRes.data

    // 生成维护任务数据
    maintenance.value = [
      {
        id: 1,
        title: '化学实验室A设备维护',
        type: 'routine',
        status: 'pending',
        priority: 'medium',
        assignee: '张师傅',
        progress: 0,
        plannedStartDate: '2024-01-15',
        plannedEndDate: '2024-01-16',
        laboratoryId: 1,
        equipmentId: 1,
        description: '定期维护化学实验设备',
        remark: '注意安全防护'
      },
      {
        id: 2,
        title: '物理实验室B设备故障维修',
        type: 'repair',
        status: 'inProgress',
        priority: 'high',
        assignee: '李师傅',
        progress: 60,
        plannedStartDate: '2024-01-10',
        plannedEndDate: '2024-01-12',
        laboratoryId: 2,
        equipmentId: 2,
        description: '修复示波器故障',
        remark: '需要更换零件'
      },
      {
        id: 3,
        title: '生物实验室C清洁保养',
        type: 'cleaning',
        status: 'completed',
        priority: 'low',
        assignee: '王师傅',
        progress: 100,
        plannedStartDate: '2024-01-08',
        plannedEndDate: '2024-01-08',
        laboratoryId: 3,
        equipmentId: 3,
        description: '清洁实验室环境',
        remark: '已完成'
      }
    ]

    // 计算统计
    updateStats()
    pagination.total = maintenance.value.length
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 更新统计
const updateStats = () => {
  maintenanceStats.pending = maintenance.value.filter((item) => item.status === 'pending').length
  maintenanceStats.inProgress = maintenance.value.filter((item) => item.status === 'inProgress').length
  maintenanceStats.completed = maintenance.value.filter((item) => item.status === 'completed').length
  maintenanceStats.overdue = maintenance.value.filter((item) => item.status === 'overdue').length
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    title: '',
    status: '',
    type: ''
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
  Object.assign(formData, {
    title: '',
    type: '',
    laboratoryId: '',
    equipmentId: '',
    assignee: '',
    priority: 'medium',
    plannedStartDate: null,
    plannedEndDate: null,
    description: '',
    remark: ''
  })
}

// 查看任务
const handleView = (record) => {
  message.info(`查看维护任务：${record.title}`)
}

// 编辑任务
const handleEdit = (record) => {
  isEdit.value = true
  modalVisible.value = true
  Object.assign(formData, {
    ...record,
    plannedStartDate: dayjs(record.plannedStartDate),
    plannedEndDate: dayjs(record.plannedEndDate)
  })
}

// 开始任务
const handleStart = (record) => {
  record.status = 'inProgress'
  record.progress = 10
  updateStats()
  message.success('维护任务已开始')
}

// 完成任务
const handleComplete = (record) => {
  record.status = 'completed'
  record.progress = 100
  updateStats()
  message.success('维护任务已完成')
}

// 删除任务
const handleDelete = (record) => {
  const index = maintenance.value.findIndex((item) => item.id === record.id)
  if (index > -1) {
    maintenance.value.splice(index, 1)
    updateStats()
    message.success('维护任务删除成功')
  }
}

// 安排维护
const handleScheduleMaintenance = () => {
  message.info('安排维护功能')
}

// 模态框确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()

    if (isEdit.value) {
      // 编辑任务
      const index = maintenance.value.findIndex((item) => item.id === formData.id)
      if (index > -1) {
        Object.assign(maintenance.value[index], {
          ...formData,
          plannedStartDate: formData.plannedStartDate ? formData.plannedStartDate.format('YYYY-MM-DD') : null,
          plannedEndDate: formData.plannedEndDate ? formData.plannedEndDate.format('YYYY-MM-DD') : null
        })
        message.success('维护任务更新成功')
      }
    } else {
      // 添加任务
      const newTask = {
        ...formData,
        id: Date.now(),
        status: 'pending',
        progress: 0,
        plannedStartDate: formData.plannedStartDate ? formData.plannedStartDate.format('YYYY-MM-DD') : null,
        plannedEndDate: formData.plannedEndDate ? formData.plannedEndDate.format('YYYY-MM-DD') : null
      }
      maintenance.value.unshift(newTask)
      updateStats()
      message.success('维护任务添加成功')
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
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.maintenance-container {
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

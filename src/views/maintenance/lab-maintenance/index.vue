<template>
  <div class="lab-maintenance-container">
    <a-card title="维护列表" class="page-card">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showAddModal">
            <plus-outlined />
            添加维护任务
          </a-button>
        </a-space>
      </template>

      <!-- 统计卡片 -->
      <a-row :gutter="16" style="margin-bottom: 24px">
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic title="待维护" :value="maintenanceStats.waiting" :value-style="{ color: '#faad14' }">
              <template #prefix>
                <clock-circle-outlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="stat-card">
            <a-statistic title="进行中" :value="maintenanceStats.repairing" :value-style="{ color: '#1890ff' }">
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
            <a-statistic title="不需要维护" :value="maintenanceStats.noNeed" :value-style="{ color: '#8c8c8c' }">
              <template #prefix>
                <exclamation-circle-outlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>

      <!-- 搜索筛选 -->
      <div class="search-section">
        <a-input v-model:value="searchForm.recordNo" placeholder="搜索维修单号" allow-clear @change="handleSearch" class="search-input">
          <template #prefix>
            <search-outlined />
          </template>
        </a-input>

        <a-select v-model:value="searchForm.status" placeholder="选择状态" allow-clear @change="handleSearch" class="search-input">
          <a-select-option value="waiting">待维护</a-select-option>
          <a-select-option value="repairing">进行中</a-select-option>
          <a-select-option value="completed">已完成</a-select-option>
          <a-select-option value="noNeed">不需要维护</a-select-option>
        </a-select>

        <a-select v-model:value="searchForm.issueType" placeholder="选择问题类型" allow-clear @change="handleSearch" class="search-input">
          <a-select-option value="clean">清洁</a-select-option>
          <a-select-option value="repair">维修</a-select-option>
          <a-select-option value="accident">事故</a-select-option>
          <a-select-option value="other">其他</a-select-option>
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
          <template v-else-if="column.key === 'issueType'">
            <a-tag :color="getIssueTypeColor(record.issueType)">
              {{ getIssueTypeText(record.issueType) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'laboratory'">
            <a-tag color="blue">{{ getLaboratoryName(record.laboratoryId) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'assignedTeacherId'">
            {{ getTeacherLabel(record.assignedTeacherId) }}
          </template>
          <template v-else-if="column.key === 'createTime'">
            {{ formatDateTime(record.createTime) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="showAssignTeacherModal(record)"> 指派教师 </a-button>
              <a-button v-if="isInProgressStatus(record.status)" type="link" size="small" @click="handleComplete(record)"> 完成 </a-button>
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
            <a-form-item label="实验室" name="laboratoryId">
              <a-select v-model:value="formData.laboratoryId" allow-clear placeholder="选择实验室（可选）">
                <a-select-option v-for="lab in laboratories" :key="lab.id" :value="lab.id">
                  {{ lab.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="设备" name="equipmentId">
              <a-select v-model:value="formData.equipmentId" allow-clear placeholder="选择设备（可选）" show-search :filter-option="filterEquipmentOption">
                <a-select-option v-for="eq in equipmentOptions" :key="eq.id" :value="eq.id">
                  {{ eq.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="维护类型" name="issueType">
          <a-radio-group v-model:value="formData.issueType">
            <a-radio value="clean">清洁</a-radio>
            <a-radio value="repair">维修</a-radio>
            <a-radio value="accident">事故</a-radio>
            <a-radio value="other">其他</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="问题描述" name="description">
          <a-textarea v-model:value="formData.description" placeholder="请详细描述问题" :rows="4" />
        </a-form-item>

        <a-form-item label="图片" name="photos">
          <a-textarea v-model:value="formData.photos" placeholder="可填写图片URL（多个用逗号分隔）" :rows="2" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="assignTeacherVisible" title="指派维修教师" @ok="handleAssignTeacherOk" @cancel="handleAssignTeacherCancel">
      <a-form layout="vertical">
        <a-form-item label="选择教师" required>
          <a-select v-model:value="assignTeacherId" placeholder="请选择教师" show-search :filter-option="filterTeacherOption">
            <a-select-option v-for="t in teacherOptions" :key="t.id" :value="t.id">
              {{ t.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined, ClockCircleOutlined, LoadingOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { mockApi } from '@/api/mockData'
import { listTeachersService } from '@/api/usermanage'
import { listAllMaintenanceRecordService, assignMaintenanceTeacherService, startMaintenanceRepairService, getMaintenanceSummaryService, applyMaintenanceService, deleteMaintenanceRecordService } from '@/api/maintenanceRecord'
import { listAllEquipmentService, getEquipmentByLaboratoryIdService } from '@/api/equipment'

const loading = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const assignTeacherVisible = ref(false)
const assignTeacherId = ref(null)
const assignRecordId = ref(null)
const teacherOptions = ref([])

const equipmentOptions = ref([])

// 搜索表单
const searchForm = reactive({
  recordNo: '',
  status: '',
  issueType: ''
})

// 数据
const laboratories = ref([])
const maintenance = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 维护统计
const maintenanceStats = reactive({
  waiting: 0,
  repairing: 0,
  completed: 0,
  noNeed: 0
})

// 表格列配置
const columns = [
  {
    title: '维修单号',
    dataIndex: 'recordNo',
    key: 'recordNo',
    width: 160
  },
  {
    title: '问题类型',
    key: 'issueType',
    width: 100
  },
  {
    title: '实验室',
    key: 'laboratory',
    width: 150
  },
  {
    title: '报修角色',
    dataIndex: 'reporterRole',
    key: 'reporterRole',
    width: 100
  },
  {
    title: '维修教师',
    key: 'assignedTeacherId',
    width: 160
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 160
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
  laboratoryId: null,
  equipmentId: null,
  issueType: 'clean',
  description: '',
  photos: ''
})

// 表单验证规则
const formRules = {
  laboratoryId: [
    {
      validator: () => {
        if (formData.laboratoryId || formData.equipmentId) return Promise.resolve()
        return Promise.reject(new Error('实验室/设备请至少选择一项'))
      },
      trigger: 'change'
    }
  ],
  equipmentId: [
    {
      validator: () => {
        if (formData.laboratoryId || formData.equipmentId) return Promise.resolve()
        return Promise.reject(new Error('实验室/设备请至少选择一项'))
      },
      trigger: 'change'
    }
  ],
  issueType: [{ required: true, message: '请选择维护类型' }],
  description: [{ required: true, message: '请输入问题描述' }]
}

// 获取状态颜色
const getStatusColor = (status) => {
  const normalized = normalizeStatus(status)
  const colors = {
    waiting: 'orange',
    repairing: 'blue',
    completed: 'green',
    noNeed: 'default'
  }
  return colors[normalized] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const normalized = normalizeStatus(status)
  const texts = {
    waiting: '待维护',
    repairing: '进行中',
    completed: '已完成',
    noNeed: '不需要维护'
  }
  return texts[normalized] || status
}

function formatDateTime(val) {
  if (!val) return '-'
  const d = new Date(val)
  return Number.isNaN(d.getTime()) ? val : d.toLocaleString('zh-CN', { dateStyle: 'short', timeStyle: 'short' })
}

function normalizeStatus(status) {
  const map = {
    0: 'waiting',
    1: 'repairing',
    2: 'completed',
    3: 'noNeed'
  }
  return map[status] ?? status
}

function isInProgressStatus(status) {
  const normalized = normalizeStatus(status)
  return normalized === 'repairing'
}

const filterEquipmentOption = (input, option) => {
  const text = option?.children?.toString?.() ?? ''
  return text.toLowerCase().includes((input || '').toLowerCase())
}

// 获取类型颜色
const getIssueTypeColor = (type) => {
  const colors = {
    clean: 'green',
    repair: 'red',
    accident: 'orange',
    other: 'blue'
  }
  return colors[type] || 'default'
}

// 获取类型文本
const getIssueTypeText = (type) => {
  const texts = {
    clean: '清洁',
    repair: '维修',
    accident: '事故',
    other: '其他'
  }
  return texts[type] || type
}

// 获取实验室名称
const getLaboratoryName = (laboratoryId) => {
  const lab = laboratories.value.find((l) => l.id === laboratoryId)
  return lab ? lab.name : '未知实验室'
}

// 筛选后的维护数据
const filteredMaintenance = computed(() => {
  let result = maintenance.value

  if (searchForm.recordNo) {
    result = result.filter((item) => (item.recordNo || '').toLowerCase().includes(searchForm.recordNo.toLowerCase()))
  }

  if (searchForm.status) {
    result = result.filter((item) => normalizeStatus(item.status) === searchForm.status)
  }

  if (searchForm.issueType) {
    result = result.filter((item) => item.issueType === searchForm.issueType)
  }

  return result
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 加载实验室数据
    const labsRes = await mockApi.getLaboratories()
    laboratories.value = labsRes.data

    const res = await listAllMaintenanceRecordService(pagination.current, pagination.pageSize)
    if (res && res.code === 0 && res.data) {
      const data = res.data
      maintenance.value = data.items ?? data.list ?? []
      pagination.total = data.total ?? 0
    }

    await refreshSummary()
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadEquipmentOptions = async () => {
  const res = await listAllEquipmentService('')
  if (res && res.code === 0 && res.data) {
    const list = res.data ?? []
    equipmentOptions.value = list.map((eq) => {
      const label = [eq.equipmentName, eq.assetNumber].filter(Boolean).join(' / ')
      return { id: eq.id, label: label || String(eq.id) }
    })
  }
}

// 根据选择的实验室动态加载设备
const loadEquipmentByLaboratory = async (laboratoryId) => {
  if (!laboratoryId) {
    // 如果没有选择实验室，清空设备选项
    equipmentOptions.value = []
    formData.equipmentId = null
    return
  }

  try {
    const res = await getEquipmentByLaboratoryIdService(laboratoryId)
    if (res && res.code === 0 && res.data) {
      const list = res.data ?? []
      equipmentOptions.value = list.map((eq) => {
        const label = [eq.equipmentName, eq.assetNumber].filter(Boolean).join(' / ')
        return { id: eq.id, label: label || String(eq.id) }
      })
      // 清空已选择的设备，因为设备列表已更新
      formData.equipmentId = null
    }
  } catch (error) {
    message.error('加载设备列表失败')
    equipmentOptions.value = []
    formData.equipmentId = null
  }
}

const refreshSummary = async () => {
  const res = await getMaintenanceSummaryService()
  if (res && res.code === 0 && res.data) {
    maintenanceStats.waiting = res.data.waiting ?? 0
    maintenanceStats.repairing = res.data.repairing ?? 0
    maintenanceStats.completed = res.data.completed ?? 0
    maintenanceStats.noNeed = res.data.noNeed ?? 0
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    recordNo: '',
    status: '',
    issueType: ''
  })
  handleSearch()
}

// 表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// 显示添加模态框
const showAddModal = () => {
  isEdit.value = false
  modalVisible.value = true
  Object.assign(formData, {
    laboratoryId: null,
    equipmentId: null,
    issueType: 'clean',
    description: '',
    photos: ''
  })
}

// 编辑任务
const handleEdit = (record) => {
  message.info('暂不支持编辑')
}

// 开始任务
const handleStart = (record) => {
  startMaintenanceRepairService(record.id)
    .then(() => {
      message.success('维护任务已开始')
      loadData()
    })
    .catch(() => {})
}

// 完成任务
const handleComplete = (record) => {
  record.status = 'completed'
  record.progress = 100
  updateStats()
  message.success('维护任务已完成')
}

// 删除任务
const handleDelete = async (record) => {
  try {
    const res = await deleteMaintenanceRecordService(record.id)
    if (res && res.code === 0) {
      message.success('维护任务删除成功')
      loadData()
      await refreshSummary()
    }
  } catch (error) {
    message.error('删除失败')
  }
}

const filterTeacherOption = (input, option) => {
  const text = option?.children?.toString?.() ?? ''
  return text.toLowerCase().includes((input || '').toLowerCase())
}

const loadTeacherOptions = async () => {
  const res = await listTeachersService(1, 1000)
  if (res && res.code === 0 && res.data) {
    const data = res.data
    const list = data.items ?? data.list ?? []
    teacherOptions.value = list.map((t) => {
      const label = [t.realName, t.nickname, t.username].filter(Boolean).join(' / ')
      return { id: t.id, label: label || String(t.id) }
    })
  }
}

const getTeacherLabel = (teacherId) => {
  if (!teacherId) return '-'
  const found = teacherOptions.value.find((t) => t.id === teacherId)
  return found ? found.label : String(teacherId)
}

const showAssignTeacherModal = async (record) => {
  assignRecordId.value = record.id
  assignTeacherId.value = null
  assignTeacherVisible.value = true
  try {
    await loadTeacherOptions()
  } catch (e) {
    message.error('加载教师列表失败')
  }
}

const handleAssignTeacherOk = () => {
  if (!assignRecordId.value) return
  if (!assignTeacherId.value) {
    message.warning('请选择教师')
    return
  }
  assignMaintenanceTeacherService(assignRecordId.value, assignTeacherId.value)
    .then(() => {
      message.success('指派成功')
      assignTeacherVisible.value = false
      loadData()
    })
    .catch(() => {})
}

const handleAssignTeacherCancel = () => {
  assignTeacherVisible.value = false
}
// 模态框确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()

    const payload = {
      laboratoryId: formData.laboratoryId || null,
      equipmentId: formData.equipmentId || null,
      issueType: formData.issueType,
      description: formData.description,
      photos: formData.photos || null
    }

    await applyMaintenanceService(payload)
    message.success('维护任务添加成功')
    modalVisible.value = false
    loadData()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 模态框取消
const handleModalCancel = () => {
  modalVisible.value = false
  formRef.value?.resetFields()
  // 清空设备选项，避免影响下次打开
  equipmentOptions.value = []
}

onMounted(() => {
  loadData()
  loadTeacherOptions().catch(() => {})
  // 初始不加载设备，等待用户选择实验室
})

// 监听实验室选择变化，动态加载设备
watch(
  () => formData.laboratoryId,
  (newLaboratoryId) => {
    loadEquipmentByLaboratory(newLaboratoryId)
  },
  { immediate: false }
)
</script>

<style scoped>
.lab-maintenance-container {
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

<template>
  <div class="equipment-container">
    <a-card title="设备管理" class="page-card">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showAddModal">
            <plus-outlined />
            添加设备
          </a-button>
        </a-space>
      </template>

      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="equipment" tab="设备列表">
          <div class="search-section">
            <a-input v-model:value="searchForm.name" placeholder="搜索设备名称" allow-clear @change="handleSearch" class="search-input">
              <template #prefix>
                <search-outlined />
              </template>
            </a-input>

            <a-button type="primary" @click="handleSearch">
              <search-outlined />
              搜索
            </a-button>
            <a-button style="margin-left: 8px" @click="handleReset"> 重置 </a-button>
          </div>

          <a-table :columns="columns" :data-source="filteredEquipment" :pagination="pagination" :loading="loading" row-key="id" @change="handleTableChange">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status === 1 ? 'green' : 'red'">
                  {{ record.status === 1 ? '正常' : '禁用' }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="handleEdit(record)"> 编辑 </a-button>
                  <a-popconfirm title="确定要删除该设备吗？" @confirm="handleDelete(record)">
                    <a-button type="link" size="small" danger> 删除 </a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="application" tab="设备申请">
          <a-table :columns="applicationColumns" :data-source="applications" row-key="id" :loading="applicationLoading" :pagination="applicationPagination" @change="handleApplicationTableChange">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="getApplicationStatusColor(record.status)">
                  {{ getApplicationStatusText(record.status) }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'reviewComment'">
                {{ record.reviewComment || '-' }}
              </template>
              <template v-else-if="column.key === 'createTime'">
                {{ formatDateTime(record.createTime) }}
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="showApplicationDetails(record)">详情</a-button>
                  <template v-if="record.status === 0">
                    <a-popconfirm title="确定通过此申请吗？" @confirm="handleApplicationApprove(record)">
                      <a-button type="link" size="small">通过</a-button>
                    </a-popconfirm>
                    <a-button type="link" size="small" danger @click="showApplicationRejectModal(record)">拒绝</a-button>
                  </template>
                  <a-popconfirm title="确定删除此申请记录吗？" @confirm="handleApplicationDelete(record)">
                    <a-button type="link" size="small" danger>删除</a-button>
                  </a-popconfirm>
                </a-space>
              </template>
              <template v-else>
                {{ record[column.dataIndex] ?? '-' }}
              </template>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 添加/编辑设备模态框 -->
    <a-modal v-model:open="modalVisible" :title="isEdit ? '编辑设备' : '添加设备'" width="800px" @ok="handleModalOk" @cancel="handleModalCancel">
      <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="资产编号" name="assetNumber">
              <a-input v-model:value="formData.assetNumber" :disabled="isEdit" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="设备名称" name="equipmentName">
              <a-input v-model:value="formData.equipmentName" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="设备类型" name="equipmentType">
              <a-input v-model:value="formData.equipmentType" placeholder="请输入设备类型" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="生产厂家" name="manufacturer">
              <a-input v-model:value="formData.manufacturer" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="型号" name="model">
              <a-input v-model:value="formData.model" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="价格" name="price">
              <a-input-number v-model:value="formData.price" :min="0" :precision="2" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="购买日期" name="purchaseDate">
              <a-date-picker v-model:value="formData.purchaseDate" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态" name="status">
              <a-radio-group v-model:value="formData.status">
                <a-radio :value="1">正常</a-radio>
                <a-radio :value="0">禁用</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="总数" name="quantity">
              <a-input-number v-model:value="formData.quantity" :min="1" :max="9999" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="可用数量" name="availableQuantity">
              <a-input-number v-model:value="formData.availableQuantity" :min="0" :max="formData.quantity" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="设备描述" name="description">
          <a-textarea v-model:value="formData.description" placeholder="请输入设备描述" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="applicationDetailsVisible" title="申请详情" :footer="null" width="640">
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="申请人">{{ currentApplication.applicant || '-' }}</a-descriptions-item>
        <a-descriptions-item label="设备名称">{{ currentApplication.equipmentName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="数量">{{ currentApplication.quantity ?? '-' }}</a-descriptions-item>
        <a-descriptions-item label="使用类型">{{ currentApplication.usageType || '-' }}</a-descriptions-item>
        <a-descriptions-item label="使用时间">{{ currentApplication.usageTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="联系方式">{{ currentApplication.contact || '-' }}</a-descriptions-item>
        <a-descriptions-item label="使用目的">{{ currentApplication.purpose || '-' }}</a-descriptions-item>
        <a-descriptions-item label="特殊要求">{{ currentApplication.specialRequirements || '-' }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getApplicationStatusColor(currentApplication.status)">
            {{ getApplicationStatusText(currentApplication.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="审核意见">{{ currentApplication.reviewComment || '-' }}</a-descriptions-item>
        <a-descriptions-item label="审核时间">{{ formatDateTime(currentApplication.reviewTime) }}</a-descriptions-item>
        <a-descriptions-item label="申请时间">{{ formatDateTime(currentApplication.createTime) }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <a-modal v-model:open="applicationRejectVisible" title="拒绝申请" @ok="handleApplicationReject" :okButtonProps="{ disabled: !applicationRejectReason.trim() }">
      <a-form-item label="审核意见" required>
        <a-textarea v-model:value="applicationRejectReason" placeholder="请输入拒绝原因（必填）" :rows="4" />
      </a-form-item>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { PlusOutlined, SearchOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import { getEquipmentListService, getEquipmentByIdService, createEquipmentService, updateEquipmentService, deleteEquipmentService } from '@/api/equipment'
import { listAllEquipmentApplicationService, approveEquipmentApplicationService, rejectEquipmentApplicationService, adminDeleteEquipmentApplicationService } from '@/api/equipmentApplication'

const loading = ref(false)
const activeTab = ref('equipment')
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const categoryFormRef = ref()

// 搜索表单
const searchForm = reactive({
  name: ''
})

// 分类表单数据
const categoryFormData = reactive({
  name: ''
})

// 分类表单验证规则
const categoryFormRules = {
  name: [{ required: true, message: '请输入分类名称' }]
}

// 数据
const equipment = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const applicationLoading = ref(false)
const applications = ref([])
const applicationPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

const applicationDetailsVisible = ref(false)
const applicationRejectVisible = ref(false)
const currentApplication = ref({})
const applicationRejectReason = ref('')

// 表格列配置
const columns = [
  {
    title: '设备名称',
    dataIndex: 'equipmentName',
    key: 'equipmentName',
    width: 150
  },
  {
    title: '资产编号',
    dataIndex: 'assetNumber',
    key: 'assetNumber',
    width: 150
  },
  {
    title: '设备类型',
    dataIndex: 'equipmentType',
    key: 'equipmentType',
    width: 120
  },
  {
    title: '生产厂家',
    dataIndex: 'manufacturer',
    key: 'manufacturer',
    width: 120
  },
  {
    title: '型号',
    dataIndex: 'model',
    key: 'model',
    width: 120
  },
  {
    title: '总数',
    dataIndex: 'quantity',
    key: 'quantity',
    width: 80
  },
  {
    title: '可用数量',
    dataIndex: 'availableQuantity',
    key: 'availableQuantity',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80
  },
  {
    title: '操作',
    key: 'action',
    width: 200
  }
]

const applicationColumns = [
  { title: '申请人', dataIndex: 'applicant', key: 'applicant', width: 120 },
  { title: '设备名称', dataIndex: 'equipmentName', key: 'equipmentName', width: 150 },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
  { title: '用途', dataIndex: 'purpose', key: 'purpose', ellipsis: true },
  { title: '状态', key: 'status', width: 90 },
  { title: '审核意见', key: 'reviewComment', width: 120, ellipsis: true },
  { title: '申请时间', key: 'createTime', width: 160 },
  { title: '操作', key: 'action', width: 220, fixed: 'right' }
]

// 表单数据
const formData = reactive({
  id: null,
  assetNumber: '',
  equipmentName: '',
  equipmentType: '',
  model: '',
  manufacturer: '',
  purchaseDate: null,
  price: null,
  quantity: 1,
  availableQuantity: 1,
  status: 1,
  description: ''
})

// 表单验证规则
const formRules = {
  assetNumber: [{ required: true, message: '请输入资产编号' }],
  equipmentName: [{ required: true, message: '请输入设备名称' }],
  equipmentType: [{ required: true, message: '请选择设备类型' }],
  manufacturer: [{ required: true, message: '请输入生产厂家' }],
  quantity: [{ required: true, message: '请输入设备数量' }]
}

// 格式化日期
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

function formatDateTime(val) {
  if (!val) return '-'
  const d = new Date(val)
  return Number.isNaN(d.getTime()) ? val : d.toLocaleString('zh-CN', { dateStyle: 'short', timeStyle: 'short' })
}

const getApplicationStatusColor = (status) => {
  const map = { 0: 'orange', 1: 'green', 2: 'red' }
  return map[status] ?? 'default'
}

const getApplicationStatusText = (status) => {
  const map = { 0: '待审核', 1: '已批准', 2: '已拒绝' }
  return map[status] ?? '-'
}

// 筛选后的设备数据
const filteredEquipment = computed(() => {
  let result = equipment.value

  if (searchForm.name) {
    result = result.filter((item) => item.equipmentName?.toLowerCase().includes(searchForm.name.toLowerCase()))
  }

  return result
})

// 加载数据
const loadData = async () => {
  loading.value = true
  const response = await getEquipmentListService(pagination.current, pagination.pageSize)
  if (response.code === 0 && response.data) {
    equipment.value = response.data.items || []
    pagination.total = response.data.total || 0
  }
  loading.value = false
}

const fetchApplications = () => {
  applicationLoading.value = true
  listAllEquipmentApplicationService(applicationPagination.current, applicationPagination.pageSize)
    .then((res) => {
      if (res && res.code === 0 && res.data) {
        const data = res.data
        applications.value = data.items ?? data.list ?? []
        applicationPagination.total = data.total ?? 0
      }
    })
    .catch(() => {})
    .finally(() => {
      applicationLoading.value = false
    })
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: ''
  })
  handleSearch()
}

// 表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

const handleApplicationTableChange = (pag) => {
  applicationPagination.current = pag.current
  applicationPagination.pageSize = pag.pageSize
  fetchApplications()
}

// 显示添加模态框
const showAddModal = () => {
  isEdit.value = false
  modalVisible.value = true
  Object.assign(formData, {
    id: null,
    assetNumber: '',
    equipmentName: '',
    equipmentType: '',
    model: '',
    manufacturer: '',
    purchaseDate: null,
    price: null,
    quantity: 1,
    availableQuantity: 1,
    status: 1,
    description: ''
  })
}

// 编辑设备
const handleEdit = async (record) => {
  isEdit.value = true
  modalVisible.value = true

  const response = await getEquipmentByIdService(record.id)
  if (response.code === 0 && response.data) {
    Object.assign(formData, {
      id: response.data.id,
      assetNumber: response.data.assetNumber,
      equipmentName: response.data.equipmentName,
      equipmentType: response.data.equipmentType,
      model: response.data.model || '',
      manufacturer: response.data.manufacturer || '',
      purchaseDate: response.data.purchaseDate ? dayjs(response.data.purchaseDate) : null,
      price: response.data.price || null,
      quantity: response.data.quantity || 1,
      availableQuantity: response.data.availableQuantity || 1,
      status: response.data.status !== undefined ? response.data.status : 1,
      description: response.data.description || ''
    })
  }
}

// 删除设备
const handleDelete = async (record) => {
  Modal.confirm({
    title: '确定要删除该设备吗？',
    content: `删除后无法恢复，确定要删除设备"${record.equipmentName}"吗？`,
    onOk: async () => {
      const response = await deleteEquipmentService(record.id)
      if (response.code === 0) {
        message.success('设备删除成功')
        loadData()
      }
    }
  })
}
// 模态框确认
const handleModalOk = async () => {
  await formRef.value.validate()

  const submitData = {
    ...formData,
    purchaseDate: formData.purchaseDate ? formData.purchaseDate.format('YYYY-MM-DD') : null
  }

  const response = isEdit.value ? await updateEquipmentService(submitData) : await createEquipmentService(submitData)

  if (response.code === 0) {
    message.success(isEdit.value ? '设备更新成功' : '设备添加成功')
    modalVisible.value = false
    loadData()
  }
}

// 模态框取消
const handleModalCancel = () => {
  modalVisible.value = false
  formRef.value?.resetFields()
}

const showApplicationDetails = (record) => {
  currentApplication.value = { ...record }
  applicationDetailsVisible.value = true
}

const handleApplicationApprove = (record) => {
  approveEquipmentApplicationService(record.id)
    .then(() => {
      message.success('已通过')
      fetchApplications()
    })
    .catch(() => {})
}

const showApplicationRejectModal = (record) => {
  currentApplication.value = record
  applicationRejectReason.value = ''
  applicationRejectVisible.value = true
}

const handleApplicationReject = () => {
  const id = currentApplication.value.id
  const comment = applicationRejectReason.value.trim()
  if (!comment) {
    message.warning('请填写拒绝原因')
    return
  }
  rejectEquipmentApplicationService(id, comment)
    .then(() => {
      message.success('已拒绝')
      applicationRejectVisible.value = false
      fetchApplications()
    })
    .catch(() => {})
}

const handleApplicationDelete = (record) => {
  adminDeleteEquipmentApplicationService(record.id)
    .then(() => {
      message.success('已删除')
      fetchApplications()
    })
    .catch(() => {})
}

onMounted(() => {
  loadData()
  fetchApplications()
})
</script>

<style scoped>
.equipment-container {
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

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f5f5f5;
}
</style>

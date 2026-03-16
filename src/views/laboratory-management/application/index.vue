<template>
  <div class="application-container">
    <a-card title="申请列表" class="page-card">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="lab" tab="实验室申请">
          <a-table :columns="labColumns" :data-source="labApplications" row-key="id" :loading="loading" :pagination="pagination" @change="handleTableChange">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'applicantRole'">
                {{ record.applicantRole === 'teacher' ? '教师' : '学生' }}
              </template>
              <template v-else-if="column.key === 'purpose'">
                {{ record.purpose || '-' }}
              </template>
              <template v-else-if="column.key === 'courseClass'">
                {{ [record.courseName, record.className].filter(Boolean).join(' / ') || '-' }}
              </template>
              <template v-else-if="column.key === 'timeRange'">
                {{ formatTimeRange(record.startTime, record.endTime) }}
              </template>
              <template v-else-if="column.key === 'status'">
                <a-tag :color="getStatusColor(record.status)">
                  {{ getStatusText(record.status) }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="showDetails(record)">详情</a-button>
                  <template v-if="record.status === 0">
                    <a-popconfirm title="确定通过此申请吗？" @confirm="handleApprove(record)">
                      <a-button type="link" size="small">通过</a-button>
                    </a-popconfirm>
                    <a-button type="link" size="small" danger @click="showRejectModal(record)">拒绝</a-button>
                  </template>
                  <a-popconfirm title="确定删除此申请记录吗？" @confirm="handleDelete(record)">
                    <a-button type="link" size="small" danger>删除</a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="equipment" tab="设备申请">
          <a-table :columns="equipmentColumns" :data-source="equipmentApplications" row-key="id" :loading="equipmentLoading" :pagination="equipmentPagination" @change="handleEquipmentTableChange">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="getEquipmentStatusColor(record.status)">
                  {{ getEquipmentStatusText(record.status) }}
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
                  <a-button type="link" size="small" @click="showEquipmentDetails(record)">详情</a-button>
                  <template v-if="record.status === 0">
                    <a-popconfirm title="确定通过此申请吗？" @confirm="handleEquipmentApprove(record)">
                      <a-button type="link" size="small">通过</a-button>
                    </a-popconfirm>
                    <a-button type="link" size="small" danger @click="showEquipmentRejectModal(record)">拒绝</a-button>
                  </template>
                  <a-popconfirm title="确定删除此申请记录吗？" @confirm="handleEquipmentDelete(record)">
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

    <a-modal v-model:open="detailsVisible" title="申请详情" :footer="null" width="640">
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="实验室名称">{{ currentApplication.labName }}</a-descriptions-item>
        <a-descriptions-item label="房间号">{{ currentApplication.labNumber }}</a-descriptions-item>
        <a-descriptions-item label="位置">{{ currentApplication.location || '-' }}</a-descriptions-item>
        <a-descriptions-item label="申请人">{{ currentApplication.applicantRealName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="角色">{{ currentApplication.applicantRole === 'teacher' ? '教师' : '学生' }}</a-descriptions-item>
        <a-descriptions-item label="电话">{{ currentApplication.applicantPhone || '-' }}</a-descriptions-item>
        <a-descriptions-item label="目的">{{ currentApplication.purpose }}</a-descriptions-item>
        <a-descriptions-item v-if="currentApplication.courseName" label="课程">{{ currentApplication.courseName || '-' }}</a-descriptions-item>
        <a-descriptions-item v-if="currentApplication.className" label="班级">{{ currentApplication.className || '-' }}</a-descriptions-item>
        <a-descriptions-item label="人数">{{ currentApplication.studentCount ?? '-' }}</a-descriptions-item>
        <a-descriptions-item label="开始时间">{{ formatDateTime(currentApplication.startTime) }}</a-descriptions-item>
        <a-descriptions-item label="结束时间">{{ formatDateTime(currentApplication.endTime) }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(currentApplication.status)">{{ getStatusText(currentApplication.status) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item v-if="currentApplication.reviewComment" label="审核意见">{{ currentApplication.reviewComment || '-' }}</a-descriptions-item>
        <a-descriptions-item v-if="currentApplication.reviewTime" label="审核时间">{{ formatDateTime(currentApplication.reviewTime) }}</a-descriptions-item>
        <a-descriptions-item label="申请时间">{{ formatDateTime(currentApplication.createTime) }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <a-modal v-model:open="equipmentDetailsVisible" title="申请详情" :footer="null" width="640">
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="申请人">{{ currentEquipmentApplication.applicantRealName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="设备">{{ currentEquipmentApplication.equipmentName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="数量">{{ currentEquipmentApplication.quantity ?? '-' }}</a-descriptions-item>
        <a-descriptions-item label="电话">{{ currentEquipmentApplication.applicantPhone || '-' }}</a-descriptions-item>
        <a-descriptions-item label="目的">{{ currentEquipmentApplication.purpose || '-' }}</a-descriptions-item>
        <a-descriptions-item label="特殊要求">{{ currentEquipmentApplication.specialRequirements || '无' }}</a-descriptions-item>
        <a-descriptions-item label="开始时间">{{ currentEquipmentApplication.startTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="结束时间">{{ currentEquipmentApplication.endTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getEquipmentStatusColor(currentEquipmentApplication.status)">
            {{ getEquipmentStatusText(currentEquipmentApplication.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item v-if="currentApplication.reviewComment" label="审核意见">{{ currentEquipmentApplication.reviewComment || '-' }}</a-descriptions-item>
        <a-descriptions-item v-if="currentApplication.reviewTime" label="审核时间">{{ formatDateTime(currentEquipmentApplication.reviewTime) }}</a-descriptions-item>
        <a-descriptions-item label="申请时间">{{ formatDateTime(currentEquipmentApplication.createTime) }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <a-modal v-model:open="rejectVisible" title="拒绝申请" @ok="handleReject" :okButtonProps="{ disabled: !rejectReason.trim() }">
      <a-form-item label="审核意见" required>
        <a-textarea v-model:value="rejectReason" placeholder="请输入拒绝原因（必填）" :rows="4" />
      </a-form-item>
    </a-modal>

    <a-modal v-model:open="equipmentRejectVisible" title="拒绝申请" @ok="handleEquipmentReject" :okButtonProps="{ disabled: !equipmentRejectReason.trim() }">
      <a-form-item label="审核意见" required>
        <a-textarea v-model:value="equipmentRejectReason" placeholder="请输入拒绝原因（必填）" :rows="4" />
      </a-form-item>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { listAllLabApplicationService, approveLabApplicationService, rejectLabApplicationService, adminDeleteLabApplicationService } from '@/api/labApplication'
import { listAllEquipmentApplicationService, approveEquipmentApplicationService, rejectEquipmentApplicationService, adminDeleteEquipmentApplicationService } from '@/api/equipmentApplication'

const activeTab = ref('lab')
const loading = ref(false)
const labApplications = ref([])

const equipmentLoading = ref(false)
const equipmentApplications = ref([])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

const equipmentPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

const detailsVisible = ref(false)
const rejectVisible = ref(false)
const currentApplication = ref({})
const rejectReason = ref('')

const equipmentDetailsVisible = ref(false)
const equipmentRejectVisible = ref(false)
const currentEquipmentApplication = ref({})
const equipmentRejectReason = ref('')

const labColumns = [
  { title: '姓名', dataIndex: 'applicantRealName', key: 'applicantRealName', width: 90 },
  { title: '实验室', dataIndex: 'labName', key: 'labName' },
  { title: '房间号', dataIndex: 'labNumber', key: 'labNumber', width: 90 },
  { title: '地址', dataIndex: 'location', key: 'location', ellipsis: true },
  { title: '角色', key: 'applicantRole', width: 60 },
  { title: '使用目的', key: 'purpose', width: 100 },
  { title: '课程/班级', key: 'courseClass', width: 120 },
  { title: '人数', dataIndex: 'studentCount', key: 'studentCount', width: 70 },
  { title: '使用时间', key: 'timeRange', width: 180 },
  { title: '状态', key: 'status', width: 90 },
  { title: '操作', key: 'action', width: 220, fixed: 'right' }
]

const equipmentColumns = [
  { title: '申请人', dataIndex: 'applicantRealName', key: 'applicantRealName', width: 120 },
  { title: '设备名称', dataIndex: 'equipmentName', key: 'equipmentName', width: 150 },
  { title: '设备类型', dataIndex: 'equipmentType', key: 'equipmentType', width: 150 },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
  { title: '用途', dataIndex: 'purpose', key: 'purpose', ellipsis: true },
  { title: '状态', key: 'status', width: 90 },
  { title: '申请时间', key: 'createTime', width: 160 },
  { title: '操作', key: 'action', width: 220, fixed: 'right' }
]

// 状态：0-待审核，1-已批准，2-已拒绝，3-使用中，4-已完成，5-已取消
const getStatusColor = (status) => {
  const map = { 0: 'orange', 1: 'green', 2: 'red', 3: 'blue', 4: 'default', 5: 'default' }
  return map[status] ?? 'default'
}

const getStatusText = (status) => {
  const map = { 0: '待审核', 1: '已批准', 2: '已拒绝', 3: '使用中', 4: '已完成', 5: '已取消' }
  return map[status] ?? '-'
}

function formatDateTime(val) {
  if (!val) return '-'
  const d = new Date(val)
  return Number.isNaN(d.getTime()) ? val : d.toLocaleString('zh-CN', { dateStyle: 'short', timeStyle: 'short' })
}

function formatTimeRange(start, end) {
  if (!start || !end) return '-'
  return `${formatDateTime(start)} ~ ${formatDateTime(end)}`
}

const fetchData = () => {
  loading.value = true
  listAllLabApplicationService(pagination.current, pagination.pageSize)
    .then((res) => {
      if (res && res.code === 0 && res.data) {
        const data = res.data
        labApplications.value = data.items ?? data.list ?? []
        pagination.total = data.total ?? 0
      }
    })
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
}

const fetchEquipmentData = () => {
  equipmentLoading.value = true
  listAllEquipmentApplicationService(equipmentPagination.current, equipmentPagination.pageSize)
    .then((res) => {
      if (res && res.code === 0 && res.data) {
        const data = res.data
        equipmentApplications.value = data.items ?? data.list ?? []
        equipmentPagination.total = data.total ?? 0
      }
    })
    .catch(() => {})
    .finally(() => {
      equipmentLoading.value = false
    })
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
}

const handleEquipmentTableChange = (pag) => {
  equipmentPagination.current = pag.current
  equipmentPagination.pageSize = pag.pageSize
  fetchEquipmentData()
}

const showDetails = (record) => {
  currentApplication.value = { ...record }
  detailsVisible.value = true
}

const handleApprove = (record) => {
  approveLabApplicationService(record.id)
    .then(() => {
      message.success('已通过')
      fetchData()
    })
    .catch(() => {})
}

const showRejectModal = (record) => {
  currentApplication.value = record
  rejectReason.value = ''
  rejectVisible.value = true
}

const handleReject = () => {
  const id = currentApplication.value.id
  const comment = rejectReason.value.trim()
  if (!comment) {
    message.warning('请填写拒绝原因')
    return
  }
  rejectLabApplicationService(id, comment)
    .then(() => {
      message.success('已拒绝')
      rejectVisible.value = false
      fetchData()
    })
    .catch(() => {})
}

const handleDelete = (record) => {
  adminDeleteLabApplicationService(record.id)
    .then(() => {
      message.success('已删除')
      fetchData()
    })
    .catch(() => {})
}

const getEquipmentStatusColor = (status) => {
  const map = { 0: 'orange', 1: 'green', 2: 'red' }
  return map[status] ?? 'default'
}

const getEquipmentStatusText = (status) => {
  const map = { 0: '待审核', 1: '已批准', 2: '已拒绝' }
  return map[status] ?? '-'
}

const showEquipmentDetails = (record) => {
  currentEquipmentApplication.value = { ...record }
  equipmentDetailsVisible.value = true
}

const handleEquipmentApprove = (record) => {
  approveEquipmentApplicationService(record.id)
    .then(() => {
      message.success('已通过')
      fetchEquipmentData()
    })
    .catch(() => {})
}

const showEquipmentRejectModal = (record) => {
  currentEquipmentApplication.value = record
  equipmentRejectReason.value = ''
  equipmentRejectVisible.value = true
}

const handleEquipmentReject = () => {
  const id = currentEquipmentApplication.value.id
  const comment = equipmentRejectReason.value.trim()
  if (!comment) {
    message.warning('请填写拒绝原因')
    return
  }
  rejectEquipmentApplicationService(id, comment)
    .then(() => {
      message.success('已拒绝')
      equipmentRejectVisible.value = false
      fetchEquipmentData()
    })
    .catch(() => {})
}

const handleEquipmentDelete = (record) => {
  adminDeleteEquipmentApplicationService(record.id)
    .then(() => {
      message.success('已删除')
      fetchEquipmentData()
    })
    .catch(() => {})
}

onMounted(() => {
  fetchData()
})

watch(
  () => activeTab.value,
  (tab) => {
    if (tab === 'equipment' && equipmentApplications.value.length === 0) {
      fetchEquipmentData()
    }
  }
)
</script>

<style scoped>
.application-container {
  padding: 24px;
}

.page-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>

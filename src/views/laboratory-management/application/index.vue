<template>
  <div class="application-container">
    <a-card title="申请列表" class="page-card">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="lab" tab="实验室申请">
          <a-table :columns="labColumns" :data-source="labApplications" row-key="id" :loading="loading">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'usageType'">
                {{ record.usageType === 'course' ? '课程' : '个人' }}
              </template>
              <template v-else-if="column.key === 'status'">
                <a-tag :color="getStatusColor(record.status)">
                  {{ getStatusText(record.status) }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="showDetails(record, 'lab')">详情</a-button>
                  <a-popconfirm title="确定要通过此申请吗？" @confirm="handleApprove(record)">
                    <a-button type="link" size="small">通过</a-button>
                  </a-popconfirm>
                  <a-button type="link" size="small" danger @click="showRejectModal(record)">拒绝</a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="equipment" tab="设备申请">
          <a-table :columns="equipmentColumns" :data-source="equipmentApplications" row-key="id" :loading="loading">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'usageType'">
                {{ record.usageType === 'course' ? '课程' : '个人' }}
              </template>
              <template v-else-if="column.key === 'status'">
                <a-tag :color="getStatusColor(record.status)">
                  {{ getStatusText(record.status) }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="showDetails(record, 'equipment')">详情</a-button>
                  <a-popconfirm title="确定要通过此申请吗？" @confirm="handleApprove(record)">
                    <a-button type="link" size="small">通过</a-button>
                  </a-popconfirm>
                  <a-button type="link" size="small" danger @click="showRejectModal(record)">拒绝</a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <a-modal v-model:open="detailsVisible" title="申请详情" :footer="null">
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="申请人">{{ currentApplication.applicant }}</a-descriptions-item>
        <a-descriptions-item label="联系方式">{{ currentApplication.contact }}</a-descriptions-item>
        <a-descriptions-item label="使用目的">{{ currentApplication.purpose }}</a-descriptions-item>
        <a-descriptions-item label="特殊要求">{{ currentApplication.specialRequirements || '无' }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <a-modal v-model:open="rejectVisible" title="拒绝申请" @ok="handleReject">
      <a-textarea v-model:value="rejectReason" placeholder="请输入拒绝原因" :rows="4" />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { mockApi } from '@/api/mockData'

const activeTab = ref('lab')
const loading = ref(false)
const labApplications = ref([])
const equipmentApplications = ref([])

const detailsVisible = ref(false)
const rejectVisible = ref(false)
const currentApplication = ref({})
const rejectReason = ref('')

const labColumns = [
  { title: '申请人', dataIndex: 'applicant', key: 'applicant' },
  { title: '使用类型', key: 'usageType' },
  { title: '实验室名', dataIndex: 'labName', key: 'labName' },
  { title: '所需设备', dataIndex: 'requiredEquipment', key: 'requiredEquipment' },
  { title: '使用时间', dataIndex: 'usageTime', key: 'usageTime' },
  { title: '预计人数', dataIndex: 'peopleCount', key: 'peopleCount' },
  { title: '联系方式', dataIndex: 'contact', key: 'contact' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'action' }
]

const equipmentColumns = [
  { title: '申请人', dataIndex: 'applicant', key: 'applicant' },
  { title: '使用类型', key: 'usageType' },
  { title: '设备名', dataIndex: 'equipmentName', key: 'equipmentName' },
  { title: '所属实验室', dataIndex: 'labName', key: 'labName' },
  { title: '使用时间', dataIndex: 'usageTime', key: 'usageTime' },
  { title: '数量', dataIndex: 'quantity', key: 'quantity' },
  { title: '联系方式', dataIndex: 'contact', key: 'contact' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'action' }
]

const getStatusColor = (status) => {
  if (status === 'approved') return 'green'
  if (status === 'rejected') return 'red'
  return 'orange'
}

const getStatusText = (status) => {
  if (status === 'approved') return '已通过'
  if (status === 'rejected') return '已拒绝'
  return '待审批'
}

const fetchData = async () => {
  loading.value = true
  try {
    const [labRes, equipmentRes] = await Promise.all([mockApi.getLabApplications(), mockApi.getEquipmentApplications()])
    labApplications.value = labRes.data
    equipmentApplications.value = equipmentRes.data
  } catch (error) {
    message.error('加载申请数据失败')
  } finally {
    loading.value = false
  }
}

const showDetails = (record) => {
  currentApplication.value = record
  detailsVisible.value = true
}

const handleApprove = (record) => {
  record.status = 'approved'
  message.success('申请已通过')
}

const showRejectModal = (record) => {
  currentApplication.value = record
  rejectVisible.value = true
  rejectReason.value = ''
}

const handleReject = () => {
  currentApplication.value.status = 'rejected'
  message.success('申请已拒绝')
  rejectVisible.value = false
}

onMounted(() => {
  fetchData()
})
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

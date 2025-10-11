<template>
  <div class="schedule-container">
    <a-card title="时间调整" class="page-card">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showAddModal">
            <plus-outlined />
            添加时间规则
          </a-button>
          <a-button @click="handleBatchAdjust">
            <setting-outlined />
            批量调整
          </a-button>
        </a-space>
      </template>

      <!-- 时间规则列表 -->
      <a-table :columns="columns" :data-source="timeRules" :pagination="pagination" :loading="loading" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">
              {{ getTypeText(record.type) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'green' : 'red'">
              {{ record.status === 'active' ? '启用' : '禁用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'timeSlots'">
            <a-space wrap>
              <a-tag v-for="slot in record.timeSlots" :key="slot" color="blue">
                {{ slot }}
              </a-tag>
            </a-space>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)"> 编辑 </a-button>
              <a-button type="link" size="small" @click="handleToggleStatus(record)">
                {{ record.status === 'active' ? '禁用' : '启用' }}
              </a-button>
              <a-popconfirm title="确定要删除该时间规则吗？" @confirm="handleDelete(record)">
                <a-button type="link" size="small" danger> 删除 </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 时间表预览 -->
    <a-card title="时间表预览" class="page-card" style="margin-top: 24px">
      <div class="schedule-preview">
        <a-calendar v-model:value="selectedDate" :fullscreen="false">
          <template #dateCellRender="{ current }">
            <div class="date-cell">
              <div class="date-info">
                <div class="date-number">{{ current.date() }}</div>
                <div class="date-slots">
                  <a-tag v-for="slot in getDateSlots(current)" :key="slot" size="small" color="blue">
                    {{ slot }}
                  </a-tag>
                </div>
              </div>
            </div>
          </template>
        </a-calendar>
      </div>
    </a-card>

    <!-- 添加/编辑时间规则模态框 -->
    <a-modal v-model:open="modalVisible" :title="isEdit ? '编辑时间规则' : '添加时间规则'" width="800px" @ok="handleModalOk" @cancel="handleModalCancel">
      <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="规则名称" name="name">
              <a-input v-model:value="formData.name" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="规则类型" name="type">
              <a-select v-model:value="formData.type">
                <a-select-option value="semester">学期时间</a-select-option>
                <a-select-option value="holiday">节假日</a-select-option>
                <a-select-option value="exam">考试时间</a-select-option>
                <a-select-option value="maintenance">维护时间</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开始日期" name="startDate">
              <a-date-picker v-model:value="formData.startDate" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="结束日期" name="endDate">
              <a-date-picker v-model:value="formData.endDate" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="适用实验室" name="laboratories">
          <a-select v-model:value="formData.laboratories" mode="multiple" placeholder="选择适用实验室">
            <a-select-option v-for="lab in laboratories" :key="lab.id" :value="lab.id">
              {{ lab.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="时间段设置" name="timeSlots">
          <div class="time-slots-config">
            <a-row :gutter="8">
              <a-col :span="6" v-for="slot in timeSlotOptions" :key="slot.value">
                <a-checkbox :checked="formData.timeSlots.includes(slot.value)" @change="(e) => handleTimeSlotChange(slot.value, e.target.checked)">
                  {{ slot.label }}
                </a-checkbox>
              </a-col>
            </a-row>
          </div>
        </a-form-item>

        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio value="active">启用</a-radio>
            <a-radio value="inactive">禁用</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="formData.remark" placeholder="请输入备注信息" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 批量调整模态框 -->
    <a-modal v-model:open="batchModalVisible" title="批量时间调整" width="600px" @ok="handleBatchOk" @cancel="handleBatchCancel">
      <a-form ref="batchFormRef" :model="batchData" :rules="batchRules" layout="vertical">
        <a-form-item label="调整类型" name="adjustType">
          <a-select v-model:value="batchData.adjustType">
            <a-select-option value="extend">延长开放时间</a-select-option>
            <a-select-option value="shorten">缩短开放时间</a-select-option>
            <a-select-option value="close">临时关闭</a-select-option>
            <a-select-option value="maintenance">维护时间</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="适用实验室" name="laboratories">
          <a-select v-model:value="batchData.laboratories" mode="multiple" placeholder="选择实验室">
            <a-select-option v-for="lab in laboratories" :key="lab.id" :value="lab.id">
              {{ lab.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="调整时间" name="adjustTime">
          <a-range-picker v-model:value="batchData.adjustTime" style="width: 100%" />
        </a-form-item>

        <a-form-item label="调整说明" name="description">
          <a-textarea v-model:value="batchData.description" placeholder="请输入调整说明" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { PlusOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { mockApi } from '@/api/mockData'

const loading = ref(false)
const modalVisible = ref(false)
const batchModalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const batchFormRef = ref()
const selectedDate = ref(dayjs())

// 数据
const laboratories = ref([])
const timeRules = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 时间段选项
const timeSlotOptions = [
  { value: '08:00-10:00', label: '08:00-10:00' },
  { value: '10:00-12:00', label: '10:00-12:00' },
  { value: '14:00-16:00', label: '14:00-16:00' },
  { value: '16:00-18:00', label: '16:00-18:00' },
  { value: '19:00-21:00', label: '19:00-21:00' },
  { value: '21:00-23:00', label: '21:00-23:00' }
]

// 表格列配置
const columns = [
  {
    title: '规则名称',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '类型',
    key: 'type',
    width: 120
  },
  {
    title: '适用实验室',
    dataIndex: 'laboratories',
    key: 'laboratories',
    width: 200
  },
  {
    title: '时间段',
    key: 'timeSlots',
    width: 200
  },
  {
    title: '有效期',
    dataIndex: 'validPeriod',
    key: 'validPeriod',
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
  name: '',
  type: '',
  startDate: null,
  endDate: null,
  laboratories: [],
  timeSlots: [],
  status: 'active',
  remark: ''
})

// 批量调整数据
const batchData = reactive({
  adjustType: '',
  laboratories: [],
  adjustTime: null,
  description: ''
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入规则名称' }],
  type: [{ required: true, message: '请选择规则类型' }],
  startDate: [{ required: true, message: '请选择开始日期' }],
  endDate: [{ required: true, message: '请选择结束日期' }],
  laboratories: [{ required: true, message: '请选择适用实验室' }],
  timeSlots: [{ required: true, message: '请选择时间段' }]
}

// 批量调整验证规则
const batchRules = {
  adjustType: [{ required: true, message: '请选择调整类型' }],
  laboratories: [{ required: true, message: '请选择适用实验室' }],
  adjustTime: [{ required: true, message: '请选择调整时间' }]
}

// 获取类型颜色
const getTypeColor = (type) => {
  const colors = {
    semester: 'blue',
    holiday: 'red',
    exam: 'orange',
    maintenance: 'purple'
  }
  return colors[type] || 'default'
}

// 获取类型文本
const getTypeText = (type) => {
  const texts = {
    semester: '学期时间',
    holiday: '节假日',
    exam: '考试时间',
    maintenance: '维护时间'
  }
  return texts[type] || type
}

// 获取实验室名称
const getLaboratoryName = (laboratoryId) => {
  const lab = laboratories.value.find((l) => l.id === laboratoryId)
  return lab ? lab.name : '未知'
}

// 获取日期时间段
const getDateSlots = (date) => {
  const dateStr = date.format('YYYY-MM-DD')
  const rules = timeRules.value.filter((rule) => rule.status === 'active' && date.isAfter(dayjs(rule.startDate).subtract(1, 'day')) && date.isBefore(dayjs(rule.endDate).add(1, 'day')))

  if (rules.length === 0) return []

  const slots = new Set()
  rules.forEach((rule) => {
    rule.timeSlots.forEach((slot) => slots.add(slot))
  })

  return Array.from(slots)
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 加载实验室数据
    const labsRes = await mockApi.getLaboratories()
    laboratories.value = labsRes.data

    // 生成时间规则数据
    timeRules.value = [
      {
        id: 1,
        name: '春季学期时间',
        type: 'semester',
        startDate: '2024-02-01',
        endDate: '2024-07-31',
        laboratories: [1, 2, 3],
        timeSlots: ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00'],
        status: 'active',
        remark: '春季学期正常开放时间',
        validPeriod: '2024-02-01 至 2024-07-31'
      },
      {
        id: 2,
        name: '寒假时间',
        type: 'holiday',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        laboratories: [1, 2, 3],
        timeSlots: ['14:00-16:00'],
        status: 'active',
        remark: '寒假期间缩短开放时间',
        validPeriod: '2024-01-15 至 2024-02-15'
      },
      {
        id: 3,
        name: '期末考试时间',
        type: 'exam',
        startDate: '2024-06-15',
        endDate: '2024-06-30',
        laboratories: [1, 2, 3],
        timeSlots: ['08:00-12:00', '14:00-18:00'],
        status: 'active',
        remark: '期末考试期间延长开放时间',
        validPeriod: '2024-06-15 至 2024-06-30'
      }
    ]
    pagination.total = timeRules.value.length
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
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
    name: '',
    type: '',
    startDate: null,
    endDate: null,
    laboratories: [],
    timeSlots: [],
    status: 'active',
    remark: ''
  })
}

// 编辑时间规则
const handleEdit = (record) => {
  isEdit.value = true
  modalVisible.value = true
  Object.assign(formData, {
    ...record,
    startDate: dayjs(record.startDate),
    endDate: dayjs(record.endDate)
  })
}

// 切换状态
const handleToggleStatus = (record) => {
  record.status = record.status === 'active' ? 'inactive' : 'active'
  message.success(`时间规则已${record.status === 'active' ? '启用' : '禁用'}`)
}

// 删除时间规则
const handleDelete = (record) => {
  const index = timeRules.value.findIndex((rule) => rule.id === record.id)
  if (index > -1) {
    timeRules.value.splice(index, 1)
    message.success('时间规则删除成功')
  }
}

// 批量调整
const handleBatchAdjust = () => {
  batchModalVisible.value = true
  Object.assign(batchData, {
    adjustType: '',
    laboratories: [],
    adjustTime: null,
    description: ''
  })
}

// 时间段选择变化
const handleTimeSlotChange = (slot, checked) => {
  if (checked) {
    if (!formData.timeSlots.includes(slot)) {
      formData.timeSlots.push(slot)
    }
  } else {
    const index = formData.timeSlots.indexOf(slot)
    if (index > -1) {
      formData.timeSlots.splice(index, 1)
    }
  }
}

// 模态框确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()

    if (isEdit.value) {
      // 编辑时间规则
      const index = timeRules.value.findIndex((rule) => rule.id === formData.id)
      if (index > -1) {
        Object.assign(timeRules.value[index], {
          ...formData,
          startDate: formData.startDate ? formData.startDate.format('YYYY-MM-DD') : null,
          endDate: formData.endDate ? formData.endDate.format('YYYY-MM-DD') : null,
          validPeriod: `${formData.startDate ? formData.startDate.format('YYYY-MM-DD') : ''} 至 ${formData.endDate ? formData.endDate.format('YYYY-MM-DD') : ''}`
        })
        message.success('时间规则更新成功')
      }
    } else {
      // 添加时间规则
      const newRule = {
        ...formData,
        id: Date.now(),
        startDate: formData.startDate ? formData.startDate.format('YYYY-MM-DD') : null,
        endDate: formData.endDate ? formData.endDate.format('YYYY-MM-DD') : null,
        validPeriod: `${formData.startDate ? formData.startDate.format('YYYY-MM-DD') : ''} 至 ${formData.endDate ? formData.endDate.format('YYYY-MM-DD') : ''}`
      }
      timeRules.value.unshift(newRule)
      message.success('时间规则添加成功')
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

// 批量调整确认
const handleBatchOk = async () => {
  try {
    await batchFormRef.value.validate()

    const startDate = batchData.adjustTime[0].format('YYYY-MM-DD')
    const endDate = batchData.adjustTime[1].format('YYYY-MM-DD')

    // 创建批量调整规则
    const newRule = {
      id: Date.now(),
      name: `批量调整-${batchData.adjustType}`,
      type: 'maintenance',
      startDate,
      endDate,
      laboratories: batchData.laboratories,
      timeSlots: batchData.adjustType === 'close' ? [] : ['08:00-18:00'],
      status: 'active',
      remark: batchData.description,
      validPeriod: `${startDate} 至 ${endDate}`
    }

    timeRules.value.unshift(newRule)
    message.success('批量调整完成')
    batchModalVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 批量调整取消
const handleBatchCancel = () => {
  batchModalVisible.value = false
  batchFormRef.value?.resetFields()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.schedule-container {
  padding: 24px;
}

.page-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.schedule-preview {
  padding: 16px;
}

.date-cell {
  padding: 4px;
}

.date-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.date-number {
  font-weight: 500;
  margin-bottom: 4px;
}

.date-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  justify-content: center;
}

.time-slots-config {
  padding: 16px;
  background-color: #fafafa;
  border-radius: 6px;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f5f5f5;
}

:deep(.ant-calendar-date) {
  height: auto;
  min-height: 80px;
}
</style>

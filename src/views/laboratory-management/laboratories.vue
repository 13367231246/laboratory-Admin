<template>
  <div class="laboratories-container">
    <a-card title="实验室管理" class="page-card">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showAddModal">
            <plus-outlined />
            添加实验室
          </a-button>
          <a-button @click="handleBatchImport">
            <upload-outlined />
            批量导入
          </a-button>
        </a-space>
      </template>

      <!-- 搜索筛选 -->
      <div class="search-section">
        <a-input v-model:value="searchForm.name" placeholder="搜索实验室名称" allow-clear @change="handleSearch" class="search-input">
          <template #prefix>
            <search-outlined />
          </template>
        </a-input>

        <a-select v-model:value="searchForm.status" placeholder="选择状态" allow-clear @change="handleSearch" class="search-input">
          <a-select-option value="available">可用</a-select-option>
          <a-select-option value="maintenance">维护中</a-select-option>
          <a-select-option value="closed">关闭</a-select-option>
        </a-select>

        <a-select v-model:value="searchForm.type" placeholder="选择类型" allow-clear @change="handleSearch" class="search-input">
          <a-select-option value="chemistry">化学</a-select-option>
          <a-select-option value="physics">物理</a-select-option>
          <a-select-option value="biology">生物</a-select-option>
          <a-select-option value="computer">计算机</a-select-option>
        </a-select>

        <a-button type="primary" @click="handleSearch">
          <search-outlined />
          搜索
        </a-button>
        <a-button style="margin-left: 8px" @click="handleReset"> 重置 </a-button>
      </div>

      <!-- 实验室列表 -->
      <a-table :columns="columns" :data-source="filteredLaboratories" :pagination="pagination" :loading="loading" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'image'">
            <a-image
              :src="record.image || '/default-lab.jpg'"
              :width="60"
              :height="40"
              :preview="false"
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'capacity'">
            <a-progress :percent="(record.currentUsers / record.capacity) * 100" :show-info="false" size="small" />
            <span style="margin-left: 8px">{{ record.currentUsers }}/{{ record.capacity }}</span>
          </template>
          <template v-else-if="column.key === 'equipment'">
            <a-space wrap>
              <a-tag v-for="it in getEquipmentListWithCounts(record.equipment, record.equipmentCounts).slice(0, 2)" :key="it.name" color="blue"> {{ it.name }} x{{ it.count }} </a-tag>
              <a-tag v-if="getEquipmentListWithCounts(record.equipment, record.equipmentCounts).length > 2" color="default"> +{{ getEquipmentListWithCounts(record.equipment, record.equipmentCounts).length - 2 }} </a-tag>
            </a-space>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)"> 编辑 </a-button>
              <a-popconfirm :title="`确定要${record.status === 'available' ? '关闭' : '启用'}该实验室吗？`" @confirm="handleToggleStatus(record)">
                <a-button type="link" size="small" :danger="record.status === 'available'">
                  {{ record.status === 'available' ? '关闭' : '启用' }}
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 添加/编辑实验室模态框 -->
    <a-modal v-model:open="modalVisible" :title="isEdit ? '编辑实验室' : '添加实验室'" width="800px" @ok="handleModalOk" @cancel="handleModalCancel">
      <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="实验室名称" name="name">
              <a-input v-model:value="formData.name" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="实验室编号" name="code">
              <a-input v-model:value="formData.code" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="位置" name="location">
              <a-input v-model:value="formData.location" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="容量" name="capacity">
              <a-input-number v-model:value="formData.capacity" :min="1" :max="100" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="类型" name="type">
              <a-select v-model:value="formData.type">
                <a-select-option value="chemistry">化学实验室</a-select-option>
                <a-select-option value="physics">物理实验室</a-select-option>
                <a-select-option value="biology">生物实验室</a-select-option>
                <a-select-option value="computer">计算机实验室</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态" name="status">
              <a-select v-model:value="formData.status">
                <a-select-option value="available">可用</a-select-option>
                <a-select-option value="maintenance">维护中</a-select-option>
                <a-select-option value="closed">关闭</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="设备列表" name="equipment">
          <a-select v-model:value="formData.equipment" mode="tags" placeholder="输入设备名称，按回车添加" style="width: 100%">
            <a-select-option v-for="item in equipmentOptions" :key="item" :value="item">
              {{ item }}
            </a-select-option>
          </a-select>
          <a-form-item-rest>
            <div v-if="formData.equipment.length" style="margin-top: 8px; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px">
              <div v-for="name in formData.equipment" :key="name" style="display: flex; align-items: center; gap: 8px">
                <a-tag color="blue">{{ name }}</a-tag>
                <span>数量</span>
                <a-input-number :value="formData.equipmentCounts[name]" :min="1" :max="9999" style="width: 100px" @update:value="(val) => (formData.equipmentCounts[name] = Number(val) || 1)" />
              </div>
            </div>
          </a-form-item-rest>
        </a-form-item>

        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="formData.description" placeholder="请输入实验室描述" :rows="3" />
        </a-form-item>

        <a-form-item label="图片" name="image">
          <a-upload v-model:file-list="fileList" list-type="picture-card" :before-upload="beforeUpload" @preview="handlePreview">
            <div v-if="fileList.length < 1">
              <plus-outlined />
              <div style="margin-top: 8px">上传图片</div>
            </div>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 图片预览模态框 -->
    <a-modal v-model:open="previewVisible" :footer="null">
      <img alt="preview" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { mockApi } from '@/api/mockData'

const loading = ref(false)
const modalVisible = ref(false)
const previewVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const fileList = ref([])
const previewImage = ref('')

// 搜索表单
const searchForm = reactive({
  name: '',
  status: '',
  type: ''
})

// 表格数据
const laboratories = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 设备选项
const equipmentOptions = ['显微镜', '离心机', '电子天平', '示波器', '万用表', '信号发生器', '培养箱', '分光光度计', 'pH计', '恒温箱', '干燥箱', '超净工作台']

// 表格列配置
const columns = [
  {
    title: '图片',
    key: 'image',
    width: 80
  },
  {
    title: '实验室名称',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '位置',
    dataIndex: 'location',
    key: 'location',
    width: 120
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 100
  },
  {
    title: '容量',
    key: 'capacity',
    width: 120
  },
  {
    title: '设备',
    key: 'equipment',
    width: 200
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
  code: '',
  location: '',
  capacity: 30,
  type: '',
  status: 'available',
  equipment: [],
  equipmentCounts: {},
  description: '',
  image: ''
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入实验室名称' }],
  code: [{ required: true, message: '请输入实验室编号' }],
  location: [{ required: true, message: '请输入位置' }],
  capacity: [{ required: true, message: '请输入容量' }],
  type: [{ required: true, message: '请选择类型' }],
  status: [{ required: true, message: '请选择状态' }]
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    available: 'green',
    maintenance: 'orange',
    closed: 'red'
  }
  return colors[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    available: '可用',
    maintenance: '维护中',
    closed: '关闭'
  }
  return texts[status] || status
}

// 筛选后的实验室数据
const filteredLaboratories = computed(() => {
  let result = laboratories.value

  if (searchForm.name) {
    result = result.filter((lab) => lab.name.toLowerCase().includes(searchForm.name.toLowerCase()))
  }

  if (searchForm.status) {
    result = result.filter((lab) => lab.status === searchForm.status)
  }

  if (searchForm.type) {
    result = result.filter((lab) => lab.type === searchForm.type)
  }

  return result
})

// 加载实验室数据
const loadLaboratories = async () => {
  loading.value = true
  try {
    const response = await mockApi.getLaboratories()
    laboratories.value = response.data.map((lab) => ({
      ...lab,
      type: lab.name.includes('化学') ? 'chemistry' : lab.name.includes('物理') ? 'physics' : lab.name.includes('生物') ? 'biology' : 'computer',
      currentUsers: Math.floor(Math.random() * lab.capacity),
      image: ''
    }))
    pagination.total = laboratories.value.length
  } catch (error) {
    message.error('加载实验室数据失败')
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
    name: '',
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
  fileList.value = []
  Object.assign(formData, {
    name: '',
    code: '',
    location: '',
    capacity: 30,
    type: '',
    status: 'available',
    equipment: [],
    equipmentCounts: {},
    description: '',
    image: ''
  })
}

// 编辑实验室
const handleEdit = (record) => {
  isEdit.value = true
  modalVisible.value = true
  // 兼容旧数据：若没有 equipmentCounts，基于 equipment 生成计数
  const counts =
    record.equipmentCounts && Object.keys(record.equipmentCounts).length
      ? { ...record.equipmentCounts }
      : (() => {
          const map = new Map()
          ;(Array.isArray(record.equipment) ? record.equipment : []).forEach((name) => {
            map.set(name, (map.get(name) || 0) + 1)
          })
          return Object.fromEntries(map.entries())
        })()
  Object.assign(formData, {
    ...record,
    equipment: Array.isArray(record.equipment) ? record.equipment : [],
    equipmentCounts: counts
  })
  fileList.value = record.image ? [{ url: record.image }] : []
}

// 切换状态
const handleToggleStatus = (record) => {
  const newStatus = record.status === 'available' ? 'closed' : 'available'
  record.status = newStatus
  message.success(`实验室 ${record.name} 已${newStatus === 'available' ? '启用' : '关闭'}`)
}

// 批量导入
const handleBatchImport = () => {
  message.info('批量导入功能')
}

// 上传前处理
const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
    return false
  }
  return false // 阻止自动上传
}

// 预览图片
const handlePreview = (file) => {
  previewImage.value = file.url || file.thumbUrl
  previewVisible.value = true
}

// 模态框确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()

    if (isEdit.value) {
      // 编辑实验室
      const index = laboratories.value.findIndex((lab) => lab.id === formData.id)
      if (index > -1) {
        Object.assign(laboratories.value[index], {
          ...formData,
          equipment: [...formData.equipment],
          equipmentCounts: { ...formData.equipmentCounts }
        })
        message.success('实验室更新成功')
      }
    } else {
      // 添加实验室
      const newLab = {
        ...formData,
        id: Date.now(),
        currentUsers: 0,
        image: fileList.value[0]?.url || '',
        equipment: [...formData.equipment],
        equipmentCounts: { ...formData.equipmentCounts }
      }
      laboratories.value.unshift(newLab)
      message.success('实验室添加成功')
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
  loadLaboratories()
})

// 选中设备变化时，自动维护数量（新增默认 1，移除同步删除）
watch(
  () => formData.equipment,
  (newList) => {
    // 添加默认数量
    for (const name of newList) {
      if (!(name in formData.equipmentCounts)) formData.equipmentCounts[name] = 1
    }
    // 延迟清理未选中的键，避免与控件更新时机冲突
    nextTick(() => {
      Object.keys(formData.equipmentCounts).forEach((k) => {
        if (!newList.includes(k)) delete formData.equipmentCounts[k]
      })
    })
  },
  { deep: true }
)

// 将设备数组或计数对象转换为带数量的列表
const getEquipmentListWithCounts = (equipment, equipmentCounts) => {
  if (equipmentCounts && Object.keys(equipmentCounts).length > 0) {
    return Object.entries(equipmentCounts).map(([name, count]) => ({ name, count }))
  }
  const map = new Map()
  ;(Array.isArray(equipment) ? equipment : []).forEach((name) => {
    map.set(name, (map.get(name) || 0) + 1)
  })
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }))
}
</script>

<style scoped>
.laboratories-container {
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

:deep(.ant-upload-select-picture-card) {
  width: 100px;
  height: 100px;
}
</style>

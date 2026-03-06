<template>
  <div class="laboratories-container">
    <a-card title="实验室管理" class="page-card">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showAddModal">
            <plus-outlined />
            添加实验室
          </a-button>
          <a-button @click="downloadTemplate">
            <download-outlined />
            下载模板
          </a-button>
          <a-button @click="handleBatchImport">
            <upload-outlined />
            批量导入
          </a-button>
        </a-space>
      </template>

      <!-- 搜索筛选 -->
      <div class="search-section">
        <a-input v-model:value="searchForm.name" placeholder="搜索实验室名称" allow-clear @change="handleSearch"
          class="search-input">
          <template #prefix>
            <search-outlined />
          </template>
        </a-input>

        <a-select v-model:value="searchForm.type" placeholder="选择类型" allow-clear @change="handleSearch"
          class="search-input">
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
      <a-table :columns="columns" :data-source="filteredLaboratories" :pagination="pagination" :loading="loading"
        row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '正常' : '禁用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm :title="`确定要${record.status === 1 ? '禁用' : '启用'}该实验室吗？`"
                @confirm="handleToggleStatus(record)">
                <a-button type="link" size="small" :danger="record.status === 1">
                  {{ record.status === 1 ? '禁用' : '启用' }}
                </a-button>
              </a-popconfirm>
              <a-popconfirm title="确定要删除该实验室吗？" @confirm="handleDelete(record)">
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 添加/编辑实验室模态框 -->
    <a-modal v-model:open="modalVisible" :title="isEdit ? '编辑实验室' : '添加实验室'" width="900px" @ok="handleModalOk"
      @cancel="handleModalCancel">
      <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="实验室名称" name="labName">
              <a-input v-model:value="formData.labName" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="房间号" name="labNumber">
              <a-input v-model:value="formData.labNumber" :disabled="isEdit" />
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
              <a-input-number v-model:value="formData.capacity" :min="1" :max="1000" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="面积（平方米）" name="area">
              <a-input-number v-model:value="formData.area" :min="0" :precision="2" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="设备总数" name="equipmentCount">
              <a-input-number v-model:value="formData.equipmentCount" :min="0" style="width: 100%" disabled />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="状态" name="status">
              <a-radio-group v-model:value="formData.status">
                <a-radio :value="1">正常</a-radio>
                <a-radio :value="0">禁用</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="所属学院" name="colleges">
          <a-select v-model:value="formData.colleges" mode="multiple" placeholder="请选择学院" style="width: 100%">
            <a-select-option v-for="college in collegeOptions" :key="college.id" :value="college.id">
              {{ college.collegeName }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="formData.description" placeholder="请输入实验室描述" :rows="3" />
        </a-form-item>

        <a-form-item label="设备列表">
          <a-select v-model:value="selectedEquipmentIds" mode="multiple" show-search :filter-option="false"
            :options="equipmentSelectOptions" placeholder="输入设备名称搜索并选择" @search="handleEquipmentSearch"
            style="width: 100%" />

          <div v-if="selectedEquipmentIds.length" class="selected-equipment-list">
            <div v-for="id in selectedEquipmentIds" :key="id" class="selected-equipment-item">
              <span class="equip-info">
                {{ getEquipmentById(id)?.equipmentName || '未知设备' }}
                /
                {{ getEquipmentById(id)?.model || '-' }}
                /
                {{ getEquipmentById(id)?.manufacturer || '-' }}
                （可用：{{ getEquipmentById(id)?.availableQuantity ?? '-' }}）
              </span>
              <a-input-number :min="0" :max="getEquipmentById(id)?.availableQuantity || 9999"
                :value="selectedEquipment[id] || 0"
                @update:value="(val) => onSelectEquipmentCount(getEquipmentById(id) || { id }, val)"
                style="width: 120px; margin-left: 8px" />
            </div>
          </div>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import {
  getLaboratoryListService,
  getLaboratoryByIdService,
  createLaboratoryService,
  updateLaboratoryService,
  deleteLaboratoryService
} from '@/api/laboratory'
import { getAllCollegesService } from '@/api/college'
import { listAllEquipmentService } from '@/api/equipment'

const loading = ref(false)
const modalVisible = ref(false)
const previewVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const categoryFormRef = ref()
const previewImage = ref('')

// 搜索表单
const searchForm = reactive({
  name: '',
  type: ''
})

// 分类表单数据
const categoryFormData = reactive({
  name: ''
})

// 分类表单验证规则
const categoryFormRules = {
  name: [{ required: true, message: '请输入分类名称' }]
}

// 表格数据
const laboratories = ref([])
const collegeOptions = ref([])
// 设备选择相关
const equipmentSearchName = ref('')
const equipmentList = ref([])
const selectedEquipment = reactive({})
const selectedEquipmentIds = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total) => `共 ${total} 条`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

// 表格列配置
const columns = [
  {
    title: '实验室名称',
    dataIndex: 'labName',
    key: 'labName',
    width: 150
  },
  {
    title: '房间号',
    dataIndex: 'labNumber',
    key: 'labNumber',
    width: 120
  },
  {
    title: '位置',
    dataIndex: 'location',
    key: 'location',
    width: 120
  },
  {
    title: '容量',
    dataIndex: 'capacity',
    key: 'capacity',
    width: 100
  },
  {
    title: '面积',
    dataIndex: 'area',
    key: 'area',
    width: 100
  },
  {
    title: '设备数量',
    dataIndex: 'equipmentCount',
    key: 'equipmentCount',
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
    width: 250
  }
]

// 表单数据
const formData = reactive({
  id: null,
  labName: '',
  labNumber: '',
  location: '',
  capacity: 30,
  area: null,
  equipmentCount: 0,
  colleges: [],
  status: 1,
  description: ''
})

// 表单验证规则
const formRules = {
  labName: [{ required: true, message: '请输入实验室名称' }],
  labNumber: [{ required: true, message: '请输入房间号' }],
  location: [{ required: true, message: '请输入位置' }],
  capacity: [{ required: true, message: '请输入容量' }]
}

// 筛选后的实验室数据
const filteredLaboratories = computed(() => {
  let result = laboratories.value

  if (searchForm.name) {
    result = result.filter((lab) =>
      lab.labName?.toLowerCase().includes(searchForm.name.toLowerCase())
    )
  }

  if (searchForm.type) {
    result = result.filter((lab) => lab.type === searchForm.type)
  }

  return result
})

// 加载学院数据
const loadColleges = async () => {
  const response = await getAllCollegesService()
  if (response.code === 0 && response.data) {
    collegeOptions.value = response.data || []
  }
}

// 加载实验室数据
const loadLaboratories = async () => {
  loading.value = true
  const response = await getLaboratoryListService(pagination.current, pagination.pageSize)
  if (response.code === 0 && response.data) {
    laboratories.value = response.data.items || []
    pagination.total = response.data.total || 0
  }
  loading.value = false
}

// 加载设备列表（不分页，可按名称模糊搜索）
const loadEquipmentList = async () => {
  const response = await listAllEquipmentService(equipmentSearchName.value || undefined)
  if (response.code === 0 && response.data) {
    equipmentList.value = response.data || []
  }
}

// 重置已选设备数量
const resetSelectedEquipment = () => {
  Object.keys(selectedEquipment).forEach((k) => delete selectedEquipment[k])
  selectedEquipmentIds.value = []
}

// 根据 selectedEquipment 自动计算设备总数
const updateEquipmentCount = () => {
  let total = 0
  Object.values(selectedEquipment).forEach((val) => {
    const num = Number(val)
    if (!Number.isNaN(num) && num > 0) {
      total += num
    }
  })
  formData.equipmentCount = total
}

// 选择设备数量
const onSelectEquipmentCount = (record, value) => {
  const v = Number(value) || 0
  const equip = getEquipmentById(record.id)
  const max = equip && typeof equip.availableQuantity === 'number'
    ? equip.availableQuantity
    : Infinity

  if (v > max) {
    message.warning('选择数量不能超过可用数量')
    if (max === Infinity || max <= 0) {
      delete selectedEquipment[record.id]
    } else {
      selectedEquipment[record.id] = max
    }
    updateEquipmentCount()
    return
  }

  // 数量可以为 0，表示该设备仍存在但数量为 0
  selectedEquipment[record.id] = v
  updateEquipmentCount()
}

// 下拉选项：设备名称 / 型号 / 厂商 / 可用数量
const equipmentSelectOptions = computed(() =>
  (equipmentList.value || []).map((e) => ({
    label: `${e.equipmentName} / ${e.model || ''} / ${e.manufacturer || ''}（可用：${e.availableQuantity}）`,
    value: e.id
  }))
)

// 根据 ID 获取设备对象
const getEquipmentById = (id) => {
  return (equipmentList.value || []).find((e) => e.id === id) || null
}

// 下拉实时搜索
const handleEquipmentSearch = (value) => {
  equipmentSearchName.value = value
  loadEquipmentList()
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    type: ''
  })
  handleSearch()
}

// 表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadLaboratories()
}

// 显示添加模态框
const showAddModal = () => {
  isEdit.value = false
  modalVisible.value = true
  resetSelectedEquipment()
  equipmentSearchName.value = ''
  equipmentList.value = []
  Object.assign(formData, {
    id: null,
    labName: '',
    labNumber: '',
    location: '',
    capacity: 30,
    area: null,
    equipmentCount: 0,
    colleges: [],
    status: 1,
    description: ''
  })
}

// 编辑实验室
const handleEdit = async (record) => {
  isEdit.value = true
  modalVisible.value = true

  const response = await getLaboratoryByIdService(record.id)
  if (response.code === 0 && response.data) {
    const data = response.data
    let collegesRaw = data.colleges
    let collegesArray = []

    if (typeof collegesRaw === 'string' && collegesRaw) {
      collegesArray = JSON.parse(collegesRaw)
    } else if (Array.isArray(collegesRaw)) {
      collegesArray = collegesRaw
    }

    // 解析学院
    Object.assign(formData, {
      id: data.id,
      labName: data.labName || '',
      labNumber: data.labNumber || '',
      location: data.location || '',
      capacity: data.capacity || 30,
      area: data.area || null,
      equipmentCount: data.equipmentCount || 0,
      // 表单中使用学院 ID 数组
      colleges: Array.isArray(collegesArray) ? collegesArray.map((c) => (typeof c === 'object' ? c.id : c)) : [],
      status: data.status !== undefined ? data.status : 1,
      description: data.description || ''
    })

    // 解析设备列表，恢复已选设备数量
    resetSelectedEquipment()
    let equipmentListRaw = data.equipmentList
    if (typeof equipmentListRaw === 'string' && equipmentListRaw) {
      const arr = JSON.parse(equipmentListRaw)
      if (Array.isArray(arr)) {
        arr.forEach((item) => {
          if (item && item.id != null && item.count != null) {
            selectedEquipment[item.id] = item.count
          }
        })
      }
    }

    // 加载所有设备，用于反查已有设备的完整信息（名称/型号/厂商/可用数等）
    const eqRes = await listAllEquipmentService()
    if (eqRes.code === 0 && eqRes.data) {
      equipmentList.value = eqRes.data || []
    } else {
      equipmentList.value = []
    }

    // 根据已选设备 ID 初始化下拉多选的值
    selectedEquipmentIds.value = Object.keys(selectedEquipment).map((id) => Number(id))
    updateEquipmentCount()

    // 不自动搜索关键字，等待用户输入；但下拉会根据已选 ID 正确显示标签
    equipmentSearchName.value = ''
  }
}

// 切换状态
const handleToggleStatus = async (record) => {
  const newStatus = record.status === 1 ? 0 : 1
  const updateData = {
    ...record,
    status: newStatus
  }
  const response = await updateLaboratoryService(updateData)
  if (response.code === 0) {
    message.success(`实验室 ${record.labName} 已${newStatus === 1 ? '启用' : '禁用'}`)
    loadLaboratories()
  }
}

// 删除实验室
const handleDelete = async (record) => {
  const response = await deleteLaboratoryService(record.id)
  if (response.code === 0) {
    message.success('实验室删除成功')
    loadLaboratories()
  }
}

// 下载模板
const downloadTemplate = () => {
  message.success('正在下载实验室导入模板.xlsx')
  // 这里应该实现真实的下载逻辑
}

// 批量导入
const handleBatchImport = () => {
  message.info('批量导入功能')
}
// 模态框确认
const handleModalOk = async () => {
  await formRef.value.validate()

  // 将学院 ID 数组转换为包含 id/name 的对象数组，并序列化为 JSON 字符串
  const collegesObjects = Array.isArray(formData.colleges)
    ? formData.colleges.map((id) => {
      const found = collegeOptions.value.find((c) => c.id === id)
      if (found) {
        return {
          id: found.id,
          name: found.collegeName
        }
      }
      return { id }
    })
    : []

  // 生成设备列表对象（与设备表字段保持一致）
  const equipmentObjects = []
  const list = equipmentList.value || []
  Object.entries(selectedEquipment).forEach(([idStr, count]) => {
    const id = Number(idStr)
    const num = Number(count)
    const found = list.find((e) => e.id === id)
    if (found) {
      equipmentObjects.push({
        id: found.id,
        equipmentName: found.equipmentName,
        model: found.model || '',
        manufacturer: found.manufacturer || '',
        availableQuantity: found.availableQuantity,
        count: num
      })
    } else {
      equipmentObjects.push({ id, count: num })
    }
  })

  const submitData = {
    ...formData,
    // 后端期望 JSON 字符串，这里序列化为包含 id/name 的对象数组
    colleges: collegesObjects.length > 0 ? JSON.stringify(collegesObjects) : '[]',
    equipmentList: equipmentObjects.length > 0 ? JSON.stringify(equipmentObjects) : '[]'
  }

  const response = isEdit.value
    ? await updateLaboratoryService(submitData)
    : await createLaboratoryService(submitData)

  if (response.code === 0) {
    message.success(isEdit.value ? '实验室更新成功' : '实验室添加成功')
    modalVisible.value = false
    loadLaboratories()
  }
}

// 模态框取消
const handleModalCancel = () => {
  modalVisible.value = false
  formRef.value?.resetFields()
}

onMounted(() => {
  loadColleges()
  loadLaboratories()
})

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

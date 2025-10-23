<template>
  <div class="equipment-container">
    <a-card title="设备管理" class="page-card">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showAddModal">
            <plus-outlined />
            添加设备
          </a-button>
          <a-button @click="downloadTemplate">
            <download-outlined />
            下载模板
          </a-button>
          <a-button @click="handleBatchImport">
            <upload-outlined />
            批量导入
          </a-button>

          <a-button @click="showCategoryModal">
            <plus-outlined />
            新增分类
          </a-button>
        </a-space>
      </template>

      <!-- 搜索筛选 -->
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

      <!-- 设备列表 -->
      <a-table :columns="columns" :data-source="filteredEquipment" :pagination="pagination" :loading="loading" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'laboratory'">
            <a-tag color="blue">{{ getLaboratoryName(record.laboratoryId) }}</a-tag>
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
    </a-card>

    <!-- 添加/编辑设备模态框 -->
    <a-modal v-model:open="modalVisible" :title="isEdit ? '编辑设备' : '添加设备'" width="800px" @ok="handleModalOk" @cancel="handleModalCancel">
      <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="设备名称" name="name">
              <a-input v-model:value="formData.name" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="设备编号" name="code">
              <a-input v-model:value="formData.code" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="设备类型" name="type">
              <a-select v-model:value="formData.type">
                <a-select-option value="optical">光学设备</a-select-option>
                <a-select-option value="measurement">测量设备</a-select-option>
                <a-select-option value="separation">分离设备</a-select-option>
                <a-select-option value="heating">加热设备</a-select-option>
                <a-select-option value="computer">计算机设备</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="品牌" name="brand">
              <a-input v-model:value="formData.brand" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="型号" name="model">
              <a-input v-model:value="formData.model" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="设备数量" name="quantity">
              <a-input-number v-model:value="formData.quantity" :min="1" :max="9999" style="width: 100%" />
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
            <a-form-item label="保修期（月）" name="warrantyMonths">
              <a-input-number v-model:value="formData.warrantyMonths" :min="0" :max="120" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="设备描述" name="description">
          <a-textarea v-model:value="formData.description" placeholder="请输入设备描述" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 新增分类模态框 -->
    <a-modal v-model:open="categoryModalVisible" title="新增分类" @ok="handleCategoryOk" @cancel="handleCategoryCancel">
      <a-form ref="categoryFormRef" :model="categoryFormData" :rules="categoryFormRules" layout="vertical">
        <a-form-item label="分类名称" name="name">
          <a-input v-model:value="categoryFormData.name" placeholder="请输入分类名称" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { PlusOutlined, SearchOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import { mockApi } from '@/api/mockData'

const loading = ref(false)
const modalVisible = ref(false)
const categoryModalVisible = ref(false)
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
const laboratories = ref([])
const equipment = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 表格列配置
const columns = [
  {
    title: '设备名称',
    dataIndex: 'name',
    key: 'name',
    width: 150
  },
  {
    title: '设备编号',
    dataIndex: 'code',
    key: 'code',
    width: 120
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 100
  },
  {
    title: '品牌',
    dataIndex: 'brand',
    key: 'brand',
    width: 100
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    key: 'quantity',
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
  type: '',
  brand: '',
  model: '',
  quantity: 1,
  purchaseDate: null,
  warrantyMonths: 12,
  description: ''
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入设备名称' }],
  code: [{ required: true, message: '请输入设备编号' }],
  type: [{ required: true, message: '请选择设备类型' }],
  brand: [{ required: true, message: '请输入品牌' }],
  quantity: [{ required: true, message: '请输入设备数量' }]
}

// 筛选后的设备数据
const filteredEquipment = computed(() => {
  let result = equipment.value

  if (searchForm.name) {
    result = result.filter((item) => item.name.toLowerCase().includes(searchForm.name.toLowerCase()))
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

    // 加载设备数据
    const equipmentRes = await mockApi.getEquipment()
    equipment.value = equipmentRes.data.map((item) => ({
      ...item,
      code: `EQ${String(item.id).padStart(4, '0')}`,
      brand: '品牌A',
      model: 'Model-001',
      purchaseDate: dayjs('2023-01-01'),
      warrantyMonths: 24,
      maintenanceCycle: 90,
      lastMaintenance: '2024-01-01',
      nextMaintenance: '2024-04-01',
      description: '设备描述信息'
    }))
    pagination.total = equipment.value.length
  } catch (error) {
    message.error('加载数据失败')
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
    name: ''
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
    name: '',
    code: '',
    type: '',
    brand: '',
    model: '',
    quantity: 1,
    purchaseDate: null,
    warrantyMonths: 12,
    description: ''
  })
}

// 编辑设备
const handleEdit = (record) => {
  isEdit.value = true
  modalVisible.value = true
  Object.assign(formData, {
    ...record,
    purchaseDate: dayjs(record.purchaseDate)
  })
}

// 删除设备
const handleDelete = (record) => {
  const index = equipment.value.findIndex((item) => item.id === record.id)
  if (index > -1) {
    equipment.value.splice(index, 1)
    message.success('设备删除成功')
  }
}

// 批量导入
const handleBatchImport = () => {
  message.info('批量导入功能')
}

// 下载模板
const downloadTemplate = () => {
  message.success('正在下载设备导入模板.xlsx')
  // 这里应该实现真实的下载逻辑
}

// 显示分类模态框
const showCategoryModal = () => {
  categoryModalVisible.value = true
  Object.assign(categoryFormData, {
    name: ''
  })
}

// 分类模态框确认
const handleCategoryOk = async () => {
  try {
    await categoryFormRef.value.validate()
    message.success('分类添加成功')
    categoryModalVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 分类模态框取消
const handleCategoryCancel = () => {
  categoryModalVisible.value = false
  categoryFormRef.value?.resetFields()
}

// 模态框确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()

    if (isEdit.value) {
      // 编辑设备
      const index = equipment.value.findIndex((item) => item.id === formData.id)
      if (index > -1) {
        Object.assign(equipment.value[index], {
          ...formData,
          purchaseDate: formData.purchaseDate ? formData.purchaseDate.format('YYYY-MM-DD') : null
        })
        message.success('设备更新成功')
      }
    } else {
      // 添加设备
      const newEquipment = {
        ...formData,
        id: Date.now(),
        purchaseDate: formData.purchaseDate ? formData.purchaseDate.format('YYYY-MM-DD') : null,
        lastMaintenance: dayjs().format('YYYY-MM-DD'),
        nextMaintenance: dayjs().add(formData.maintenanceCycle, 'day').format('YYYY-MM-DD')
      }
      equipment.value.unshift(newEquipment)
      message.success('设备添加成功')
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

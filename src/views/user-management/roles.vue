<template>
  <div class="roles-container">
    <a-card title="角色分配" class="page-card">
      <template #extra>
        <a-button type="primary" @click="showAssignModal">
          <plus-outlined />
          分配角色
        </a-button>
      </template>

      <!-- 搜索筛选 -->
      <div class="search-section">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-input
              v-model:value="searchForm.username"
              placeholder="搜索用户"
              allow-clear
              @change="handleSearch"
            >
              <template #prefix>
                <search-outlined />
              </template>
            </a-input>
          </a-col>
          <a-col :span="6">
            <a-select
              v-model:value="searchForm.role"
              placeholder="选择角色"
              allow-clear
              @change="handleSearch"
            >
              <a-select-option value="admin">管理员</a-select-option>
              <a-select-option value="teacher">教师</a-select-option>
              <a-select-option value="student">学生</a-select-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-select
              v-model:value="searchForm.laboratory"
              placeholder="选择实验室"
              allow-clear
              @change="handleSearch"
            >
              <a-select-option v-for="lab in laboratories" :key="lab.id" :value="lab.id">
                {{ lab.name }}
              </a-select-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-button type="primary" @click="handleSearch">
              <search-outlined />
              搜索
            </a-button>
            <a-button style="margin-left: 8px" @click="handleReset">
              重置
            </a-button>
          </a-col>
        </a-row>
      </div>

      <!-- 角色分配列表 -->
      <a-table
        :columns="columns"
        :data-source="filteredAssignments"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'user'">
            <div class="user-info">
              <a-avatar :src="record.user.avatar" :size="32">
                {{ record.user.nickname?.charAt(0) }}
              </a-avatar>
              <div class="user-details">
                <div class="username">{{ record.user.nickname }}</div>
                <div class="user-role">{{ getRoleText(record.user.role) }}</div>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'laboratory'">
            <a-tag color="blue">{{ record.laboratory.name }}</a-tag>
          </template>
          <template v-else-if="column.key === 'permissions'">
            <a-space wrap>
              <a-tag v-for="permission in record.permissions" :key="permission" color="green">
                {{ getPermissionText(permission) }}
              </a-tag>
            </a-space>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'green' : 'red'">
              {{ record.status === 'active' ? '有效' : '无效' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-popconfirm
                :title="`确定要${record.status === 'active' ? '禁用' : '启用'}该分配吗？`"
                @confirm="handleToggleStatus(record)"
              >
                <a-button type="link" size="small" :danger="record.status === 'active'">
                  {{ record.status === 'active' ? '禁用' : '启用' }}
                </a-button>
              </a-popconfirm>
              <a-popconfirm
                title="确定要删除该分配吗？"
                @confirm="handleDelete(record)"
              >
                <a-button type="link" size="small" danger>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 分配角色模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑分配' : '分配角色'"
      width="800px"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="选择用户" name="userId">
              <a-select
                v-model:value="formData.userId"
                placeholder="请选择用户"
                show-search
                :filter-option="filterUserOption"
              >
                <a-select-option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.nickname }} ({{ user.username }})
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="选择实验室" name="laboratoryId">
              <a-select
                v-model:value="formData.laboratoryId"
                placeholder="请选择实验室"
                show-search
                :filter-option="filterLabOption"
              >
                <a-select-option v-for="lab in laboratories" :key="lab.id" :value="lab.id">
                  {{ lab.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="权限设置" name="permissions">
          <a-checkbox-group v-model:value="formData.permissions">
            <a-row>
              <a-col :span="8" v-for="permission in permissionOptions" :key="permission.value">
                <a-checkbox :value="permission.value">
                  {{ permission.label }}
                </a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-form-item>

        <a-form-item label="有效期" name="expiryDate">
          <a-date-picker
            v-model:value="formData.expiryDate"
            placeholder="选择有效期（可选）"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="备注" name="remark">
          <a-textarea
            v-model:value="formData.remark"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { 
  PlusOutlined, 
  SearchOutlined 
} from '@ant-design/icons-vue'
import { mockApi } from '@/api/mockData'

const loading = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

// 搜索表单
const searchForm = reactive({
  username: '',
  role: '',
  laboratory: ''
})

// 数据
const users = ref([])
const laboratories = ref([])
const assignments = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 表格列配置
const columns = [
  {
    title: '用户',
    key: 'user',
    width: 200
  },
  {
    title: '实验室',
    key: 'laboratory',
    width: 150
  },
  {
    title: '权限',
    key: 'permissions',
    width: 300
  },
  {
    title: '有效期',
    dataIndex: 'expiryDate',
    key: 'expiryDate',
    width: 120
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '分配时间',
    dataIndex: 'assignedAt',
    key: 'assignedAt',
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
  userId: '',
  laboratoryId: '',
  permissions: [],
  expiryDate: null,
  remark: ''
})

// 表单验证规则
const formRules = {
  userId: [{ required: true, message: '请选择用户' }],
  laboratoryId: [{ required: true, message: '请选择实验室' }],
  permissions: [{ required: true, message: '请选择权限' }]
}

// 权限选项
const permissionOptions = [
  { value: 'view', label: '查看' },
  { value: 'edit', label: '编辑' },
  { value: 'delete', label: '删除' },
  { value: 'schedule', label: '排课' },
  { value: 'maintenance', label: '维护' },
  { value: 'report', label: '报告' }
]

// 获取角色文本
const getRoleText = (role) => {
  const texts = {
    admin: '管理员',
    teacher: '教师',
    student: '学生'
  }
  return texts[role] || role
}

// 获取权限文本
const getPermissionText = (permission) => {
  const texts = {
    view: '查看',
    edit: '编辑',
    delete: '删除',
    schedule: '排课',
    maintenance: '维护',
    report: '报告'
  }
  return texts[permission] || permission
}

// 筛选后的分配数据
const filteredAssignments = computed(() => {
  let result = assignments.value

  if (searchForm.username) {
    result = result.filter(assignment => 
      assignment.user.nickname.toLowerCase().includes(searchForm.username.toLowerCase())
    )
  }

  if (searchForm.role) {
    result = result.filter(assignment => assignment.user.role === searchForm.role)
  }

  if (searchForm.laboratory) {
    result = result.filter(assignment => assignment.laboratory.id === searchForm.laboratory)
  }

  return result
})

// 用户筛选
const filterUserOption = (input, option) => {
  return option.children.toLowerCase().includes(input.toLowerCase())
}

// 实验室筛选
const filterLabOption = (input, option) => {
  return option.children.toLowerCase().includes(input.toLowerCase())
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 加载用户数据
    const usersRes = await mockApi.getUsers()
    users.value = usersRes.data

    // 加载实验室数据
    const labsRes = await mockApi.getLaboratories()
    laboratories.value = labsRes.data

    // 生成分配数据
    assignments.value = [
      {
        id: 1,
        user: users.value[1], // 张老师
        laboratory: laboratories.value[0], // 化学实验室A
        permissions: ['view', 'edit', 'schedule'],
        expiryDate: '2024-12-31',
        status: 'active',
        assignedAt: '2024-01-01',
        remark: '负责化学实验教学'
      },
      {
        id: 2,
        user: users.value[2], // 李同学
        laboratory: laboratories.value[1], // 物理实验室B
        permissions: ['view'],
        expiryDate: '2024-06-30',
        status: 'active',
        assignedAt: '2024-01-15',
        remark: '物理实验研究'
      }
    ]
    pagination.total = assignments.value.length
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
    username: '',
    role: '',
    laboratory: ''
  })
  handleSearch()
}

// 表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

// 显示分配模态框
const showAssignModal = () => {
  isEdit.value = false
  modalVisible.value = true
  Object.assign(formData, {
    userId: '',
    laboratoryId: '',
    permissions: [],
    expiryDate: null,
    remark: ''
  })
}

// 编辑分配
const handleEdit = (record) => {
  isEdit.value = true
  modalVisible.value = true
  Object.assign(formData, {
    userId: record.user.id,
    laboratoryId: record.laboratory.id,
    permissions: record.permissions,
    expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null,
    remark: record.remark
  })
}

// 切换状态
const handleToggleStatus = (record) => {
  const newStatus = record.status === 'active' ? 'inactive' : 'active'
  record.status = newStatus
  message.success(`分配已${newStatus === 'active' ? '启用' : '禁用'}`)
}

// 删除分配
const handleDelete = (record) => {
  const index = assignments.value.findIndex(assignment => assignment.id === record.id)
  if (index > -1) {
    assignments.value.splice(index, 1)
    message.success('分配删除成功')
  }
}

// 模态框确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    
    const user = users.value.find(u => u.id === formData.userId)
    const laboratory = laboratories.value.find(l => l.id === formData.laboratoryId)
    
    if (isEdit.value) {
      // 编辑分配
      const index = assignments.value.findIndex(assignment => assignment.id === formData.id)
      if (index > -1) {
        Object.assign(assignments.value[index], {
          user,
          laboratory,
          permissions: formData.permissions,
          expiryDate: formData.expiryDate ? formData.expiryDate.format('YYYY-MM-DD') : null,
          remark: formData.remark
        })
        message.success('分配更新成功')
      }
    } else {
      // 添加分配
      const newAssignment = {
        id: Date.now(),
        user,
        laboratory,
        permissions: formData.permissions,
        expiryDate: formData.expiryDate ? formData.expiryDate.format('YYYY-MM-DD') : null,
        status: 'active',
        assignedAt: new Date().toISOString().split('T')[0],
        remark: formData.remark
      }
      assignments.value.unshift(newAssignment)
      message.success('分配成功')
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
.roles-container {
  padding: 24px;
}

.page-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-section {
  margin-bottom: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 6px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 500;
  color: #262626;
}

.user-role {
  font-size: 12px;
  color: #8c8c8c;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f5f5f5;
}
</style>

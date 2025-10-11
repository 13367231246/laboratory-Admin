<template>
  <div class="accounts-container">
    <a-card title="账号管理" class="page-card">
      <template #extra>
        <a-button type="primary" @click="showAddModal">
          <plus-outlined />
          添加账号
        </a-button>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-section">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-input
              v-model:value="searchForm.username"
              placeholder="搜索用户名"
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
              v-model:value="searchForm.status"
              placeholder="选择状态"
              allow-clear
              @change="handleSearch"
            >
              <a-select-option value="active">活跃</a-select-option>
              <a-select-option value="inactive">禁用</a-select-option>
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

      <!-- 用户列表 -->
      <a-table
        :columns="columns"
        :data-source="filteredUsers"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="record.avatar" :size="32">
              {{ record.nickname?.charAt(0) }}
            </a-avatar>
          </template>
          <template v-else-if="column.key === 'role'">
            <a-tag :color="getRoleColor(record.role)">
              {{ getRoleText(record.role) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'green' : 'red'">
              {{ record.status === 'active' ? '活跃' : '禁用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-button type="link" size="small" @click="handleResetPassword(record)">
                重置密码
              </a-button>
              <a-popconfirm
                :title="`确定要${record.status === 'active' ? '禁用' : '启用'}该用户吗？`"
                @confirm="handleToggleStatus(record)"
              >
                <a-button type="link" size="small" :danger="record.status === 'active'">
                  {{ record.status === 'active' ? '禁用' : '启用' }}
                </a-button>
              </a-popconfirm>
              <a-popconfirm
                title="确定要删除该用户吗？"
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

    <!-- 添加/编辑用户模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑用户' : '添加用户'"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="formData.username" :disabled="isEdit" />
        </a-form-item>
        <a-form-item label="昵称" name="nickname">
          <a-input v-model:value="formData.nickname" />
        </a-form-item>
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="formData.email" />
        </a-form-item>
        <a-form-item label="手机号" name="phone">
          <a-input v-model:value="formData.phone" />
        </a-form-item>
        <a-form-item label="角色" name="role">
          <a-select v-model:value="formData.role">
            <a-select-option value="admin">管理员</a-select-option>
            <a-select-option value="teacher">教师</a-select-option>
            <a-select-option value="student">学生</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="部门" name="department">
          <a-input v-model:value="formData.department" />
        </a-form-item>
        <a-form-item v-if="!isEdit" label="密码" name="password">
          <a-input-password v-model:value="formData.password" />
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
  status: ''
})

// 表格数据
const users = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 表格列配置
const columns = [
  {
    title: '头像',
    dataIndex: 'avatar',
    key: 'avatar',
    width: 80
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: '昵称',
    dataIndex: 'nickname',
    key: 'nickname'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role'
  },
  {
    title: '部门',
    dataIndex: 'department',
    key: 'department'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt'
  },
  {
    title: '操作',
    key: 'action',
    width: 200
  }
]

// 表单数据
const formData = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  role: '',
  department: '',
  password: ''
})

// 表单验证规则
const formRules = {
  username: [{ required: true, message: '请输入用户名' }],
  nickname: [{ required: true, message: '请输入昵称' }],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入正确的邮箱格式' }
  ],
  role: [{ required: true, message: '请选择角色' }],
  password: [{ required: true, message: '请输入密码' }]
}

// 获取角色颜色
const getRoleColor = (role) => {
  const colors = {
    admin: 'red',
    teacher: 'blue',
    student: 'green'
  }
  return colors[role] || 'default'
}

// 获取角色文本
const getRoleText = (role) => {
  const texts = {
    admin: '管理员',
    teacher: '教师',
    student: '学生'
  }
  return texts[role] || role
}

// 筛选后的用户数据
const filteredUsers = computed(() => {
  let result = users.value

  if (searchForm.username) {
    result = result.filter(user => 
      user.username.toLowerCase().includes(searchForm.username.toLowerCase())
    )
  }

  if (searchForm.role) {
    result = result.filter(user => user.role === searchForm.role)
  }

  if (searchForm.status) {
    result = result.filter(user => user.status === searchForm.status)
  }

  return result
})

// 加载用户数据
const loadUsers = async () => {
  loading.value = true
  try {
    const response = await mockApi.getUsers()
    users.value = response.data.map(user => ({
      ...user,
      email: `${user.username}@example.com`,
      phone: '138****8888',
      department: user.department || '未分配',
      status: 'active',
      createdAt: '2024-01-01'
    }))
    pagination.total = users.value.length
  } catch (error) {
    message.error('加载用户数据失败')
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
    status: ''
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
    username: '',
    nickname: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    password: ''
  })
}

// 编辑用户
const handleEdit = (record) => {
  isEdit.value = true
  modalVisible.value = true
  Object.assign(formData, record)
}

// 重置密码
const handleResetPassword = (record) => {
  message.success(`已重置用户 ${record.username} 的密码为：123456`)
}

// 切换状态
const handleToggleStatus = (record) => {
  const newStatus = record.status === 'active' ? 'inactive' : 'active'
  record.status = newStatus
  message.success(`用户 ${record.username} 已${newStatus === 'active' ? '启用' : '禁用'}`)
}

// 删除用户
const handleDelete = (record) => {
  const index = users.value.findIndex(user => user.id === record.id)
  if (index > -1) {
    users.value.splice(index, 1)
    message.success('用户删除成功')
  }
}

// 模态框确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    
    if (isEdit.value) {
      // 编辑用户
      const index = users.value.findIndex(user => user.id === formData.id)
      if (index > -1) {
        Object.assign(users.value[index], formData)
        message.success('用户更新成功')
      }
    } else {
      // 添加用户
      const newUser = {
        ...formData,
        id: Date.now(),
        avatar: '',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      }
      users.value.unshift(newUser)
      message.success('用户添加成功')
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
  loadUsers()
})
</script>

<style scoped>
.accounts-container {
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

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f5f5f5;
}
</style>

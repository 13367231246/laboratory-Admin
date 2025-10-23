<template>
  <div class="teachers-container">
    <a-card title="教师管理" class="page-card">
      <template #extra>
        <a-button type="primary" @click="showAddModal">
          <plus-outlined />
          添加教师
        </a-button>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-section">
        <a-input v-model:value="searchForm.username" placeholder="搜索用户名" allow-clear @change="handleSearch" class="search-input">
          <template #prefix>
            <search-outlined />
          </template>
        </a-input>

        <a-input v-model:value="searchForm.nickname" placeholder="搜索昵称" allow-clear @change="handleSearch" class="search-input">
          <template #prefix>
            <search-outlined />
          </template>
        </a-input>

        <a-select v-model:value="searchForm.status" placeholder="选择状态" allow-clear @change="handleSearch" class="search-input">
          <a-select-option value="active">活跃</a-select-option>
          <a-select-option value="inactive">禁用</a-select-option>
        </a-select>

        <a-button type="primary" @click="handleSearch">
          <search-outlined />
          搜索
        </a-button>
        <a-button style="margin-left: 8px" @click="handleReset"> 重置 </a-button>
      </div>

      <!-- 教师列表 -->
      <a-table :columns="columns" :data-source="filteredTeachers" :pagination="pagination" :loading="loading" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="record.avatar" :size="32">
              {{ record.nickname?.charAt(0) }}
            </a-avatar>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'green' : 'red'">
              {{ record.status === 'active' ? '活跃' : '禁用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)"> 编辑 </a-button>
              <a-button type="link" size="small" @click="handleResetPassword(record)"> 重置密码 </a-button>
              <a-popconfirm :title="`确定要${record.status === 'active' ? '禁用' : '启用'}该教师吗？`" @confirm="handleToggleStatus(record)">
                <a-button type="link" size="small" :danger="record.status === 'active'">
                  {{ record.status === 'active' ? '禁用' : '启用' }}
                </a-button>
              </a-popconfirm>
              <a-popconfirm title="确定要删除该教师吗？" @confirm="handleDelete(record)">
                <a-button type="link" size="small" danger> 删除 </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 添加/编辑教师模态框 -->
    <a-modal v-model:open="modalVisible" :title="isEdit ? '编辑教师' : '添加教师'" @ok="handleModalOk" @cancel="handleModalCancel">
      <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
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
        <a-form-item label="工号" name="teacherId">
          <a-input v-model:value="formData.teacherId" />
        </a-form-item>
        <a-form-item label="部门" name="department">
          <a-input v-model:value="formData.department" />
        </a-form-item>
        <a-form-item label="职称" name="title">
          <a-select v-model:value="formData.title">
            <a-select-option value="professor">教授</a-select-option>
            <a-select-option value="associate_professor">副教授</a-select-option>
            <a-select-option value="lecturer">讲师</a-select-option>
            <a-select-option value="assistant">助教</a-select-option>
          </a-select>
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
import { PlusOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { mockApi } from '@/api/mockData'

const loading = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

// 搜索表单
const searchForm = reactive({
  username: '',
  nickname: '',
  status: ''
})

// 表格数据
const teachers = ref([])
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
    title: '工号',
    dataIndex: 'teacherId',
    key: 'teacherId'
  },
  {
    title: '部门',
    dataIndex: 'department',
    key: 'department'
  },
  {
    title: '职称',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
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
  teacherId: '',
  department: '',
  title: '',
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
  teacherId: [{ required: true, message: '请输入工号' }],
  department: [{ required: true, message: '请输入部门' }],
  title: [{ required: true, message: '请选择职称' }],
  password: [{ required: true, message: '请输入密码' }]
}

// 获取职称文本
const getTitleText = (title) => {
  const texts = {
    professor: '教授',
    associate_professor: '副教授',
    lecturer: '讲师',
    assistant: '助教'
  }
  return texts[title] || title
}

// 筛选后的教师数据
const filteredTeachers = computed(() => {
  let result = teachers.value

  if (searchForm.username) {
    result = result.filter((teacher) => teacher.username.toLowerCase().includes(searchForm.username.toLowerCase()))
  }

  if (searchForm.nickname) {
    result = result.filter((teacher) => teacher.nickname.toLowerCase().includes(searchForm.nickname.toLowerCase()))
  }

  if (searchForm.status) {
    result = result.filter((teacher) => teacher.status === searchForm.status)
  }

  return result
})

// 加载教师数据
const loadTeachers = async () => {
  loading.value = true
  try {
    const response = await mockApi.getUsers()
    // 筛选出教师用户
    teachers.value = response.data
      .filter((user) => user.role === 'teacher')
      .map((user) => ({
        ...user,
        email: `${user.username}@teacher.com`,
        phone: '138****8888',
        teacherId: `T${user.id.toString().padStart(6, '0')}`,
        department: '计算机学院',
        title: 'lecturer',
        status: 'active',
        createdAt: '2024-01-01'
      }))
    pagination.total = teachers.value.length
  } catch (error) {
    message.error('加载教师数据失败')
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
    nickname: '',
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
    teacherId: '',
    department: '',
    title: '',
    password: ''
  })
}

// 编辑教师
const handleEdit = (record) => {
  isEdit.value = true
  modalVisible.value = true
  Object.assign(formData, record)
}

// 重置密码
const handleResetPassword = (record) => {
  message.success(`已重置教师 ${record.username} 的密码为：123456`)
}

// 切换状态
const handleToggleStatus = (record) => {
  const newStatus = record.status === 'active' ? 'inactive' : 'active'
  record.status = newStatus
  message.success(`教师 ${record.username} 已${newStatus === 'active' ? '启用' : '禁用'}`)
}

// 删除教师
const handleDelete = (record) => {
  const index = teachers.value.findIndex((teacher) => teacher.id === record.id)
  if (index > -1) {
    teachers.value.splice(index, 1)
    message.success('教师删除成功')
  }
}

// 模态框确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()

    if (isEdit.value) {
      // 编辑教师
      const index = teachers.value.findIndex((teacher) => teacher.id === formData.id)
      if (index > -1) {
        Object.assign(teachers.value[index], formData)
        message.success('教师信息更新成功')
      }
    } else {
      // 添加教师
      const newTeacher = {
        ...formData,
        id: Date.now(),
        avatar: '',
        role: 'teacher',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      }
      teachers.value.unshift(newTeacher)
      message.success('教师添加成功')
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
  loadTeachers()
})
</script>

<style scoped>
.teachers-container {
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

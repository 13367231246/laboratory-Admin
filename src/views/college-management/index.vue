<template>
    <div class="college-container">
        <a-card title="学院管理" class="page-card">
            <template #extra>
                <a-button type="primary" @click="showAddModal">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    新增学院
                </a-button>
            </template>

            <!-- 搜索和筛选 -->
            <div class="search-section">
                <a-input v-model:value="searchForm.collegeName" placeholder="搜索学院名称" allow-clear @change="handleSearch"
                    class="search-input">
                    <template #prefix>
                        <SearchOutlined />
                    </template>
                </a-input>

                <a-input v-model:value="searchForm.collegeCode" placeholder="搜索学院代码" allow-clear @change="handleSearch"
                    class="search-input">
                    <template #prefix>
                        <SearchOutlined />
                    </template>
                </a-input>

                <a-button type="primary" @click="handleSearch">
                    <SearchOutlined />
                    搜索
                </a-button>
                <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
            </div>

            <!-- 学院列表 -->
            <a-table :columns="columns" :data-source="filteredColleges" :pagination="pagination" :loading="loading"
                row-key="id" @change="handleTableChange">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'createTime'">
                        {{ formatDate(record.createTime) }}
                    </template>
                    <template v-if="column.key === 'action'">
                        <a-space>
                            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
                            <a-popconfirm title="确定要删除该学院吗？" @confirm="handleDelete(record)">
                                <a-button type="link" size="small" danger>删除</a-button>
                            </a-popconfirm>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </a-card>

        <!-- 添加/编辑学院模态框 -->
        <a-modal v-model:open="modalVisible" :title="isEdit ? '编辑学院' : '添加学院'" @ok="handleModalOk"
            @cancel="handleModalCancel" :width="600">
            <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
                <a-form-item label="学院名称" name="collegeName">
                    <a-input v-model:value="formData.collegeName" placeholder="请输入学院名称" />
                </a-form-item>
                <a-form-item label="学院代码" name="collegeCode">
                    <a-input v-model:value="formData.collegeCode" placeholder="请输入学院代码" :disabled="isEdit" />
                </a-form-item>
                <a-form-item label="学院描述" name="description">
                    <a-textarea v-model:value="formData.description" placeholder="请输入学院描述" :rows="4" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons-vue'
import {
    getCollegeListService,
    getCollegeByIdService,
    createCollegeService,
    updateCollegeService,
    deleteCollegeService
} from '@/api/college'

const loading = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

// 搜索表单
const searchForm = reactive({
    collegeName: '',
    collegeCode: ''
})

// 表格数据
const colleges = ref([])
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
        title: '学院名称',
        dataIndex: 'collegeName',
        key: 'collegeName'
    },
    {
        title: '学院代码',
        dataIndex: 'collegeCode',
        key: 'collegeCode',
        width: 150
    },
    {
        title: '学院描述',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true
    },
    {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 180
    },
    {
        title: '操作',
        key: 'action',
        width: 150
    }
]

// 表单数据
const formData = reactive({
    id: null,
    collegeName: '',
    collegeCode: '',
    description: ''
})

// 表单验证规则
const formRules = {
    collegeName: [{ required: true, message: '请输入学院名称' }],
    collegeCode: [{ required: true, message: '请输入学院代码' }]
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

// 筛选后的学院数据
const filteredColleges = computed(() => {
    let result = colleges.value

    if (searchForm.collegeName) {
        result = result.filter((college) =>
            college.collegeName?.toLowerCase().includes(searchForm.collegeName.toLowerCase())
        )
    }

    if (searchForm.collegeCode) {
        result = result.filter((college) =>
            college.collegeCode?.toLowerCase().includes(searchForm.collegeCode.toLowerCase())
        )
    }

    return result
})

// 加载学院数据
const loadColleges = async () => {
    loading.value = true
    const response = await getCollegeListService(pagination.current, pagination.pageSize)
    if (response.code === 0 && response.data) {
        colleges.value = response.data.items || []
        pagination.total = response.data.total || 0
    }
    loading.value = false
}

// 搜索
const handleSearch = () => {
    pagination.current = 1
}

// 重置搜索
const handleReset = () => {
    Object.assign(searchForm, {
        collegeName: '',
        collegeCode: ''
    })
    handleSearch()
}

// 表格变化
const handleTableChange = (pag) => {
    pagination.current = pag.current
    pagination.pageSize = pag.pageSize
    loadColleges()
}

// 显示添加模态框
const showAddModal = () => {
    isEdit.value = false
    modalVisible.value = true
    Object.assign(formData, {
        id: null,
        collegeName: '',
        collegeCode: '',
        description: ''
    })
}

// 编辑学院
const handleEdit = async (record) => {
    isEdit.value = true
    modalVisible.value = true

    const response = await getCollegeByIdService(record.id)
    if (response.code === 0 && response.data) {
        Object.assign(formData, {
            id: response.data.id,
            collegeName: response.data.collegeName,
            collegeCode: response.data.collegeCode,
            description: response.data.description || ''
        })
    }
}

// 删除学院
const handleDelete = async (record) => {
    const response = await deleteCollegeService(record.id)
    if (response.code === 0) {
        message.success('学院删除成功')
        loadColleges()
    }
}

// 模态框确认
const handleModalOk = async () => {
    await formRef.value.validate()

    const response = isEdit.value
        ? await updateCollegeService(formData)
        : await createCollegeService(formData)

    if (response.code === 0) {
        message.success(isEdit.value ? '学院信息更新成功' : '学院添加成功')
        modalVisible.value = false
        loadColleges()
    }
}

// 模态框取消
const handleModalCancel = () => {
    modalVisible.value = false
    formRef.value?.resetFields()
}

onMounted(() => {
    loadColleges()
})
</script>

<style scoped>
.college-container {
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

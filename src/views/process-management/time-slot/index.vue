<template>
    <div class="time-slot-container">
        <a-card title="时间段管理" class="page-card">
            <template #extra>
                <a-button type="primary" @click="showAddModal">
                    <PlusOutlined />
                    新增时间段
                </a-button>
            </template>

            <!-- 搜索和筛选 -->
            <div class="search-section">
                <a-input v-model:value="searchForm.slotName" placeholder="搜索时间段名称" allow-clear @change="handleSearch"
                    class="search-input">
                    <template #prefix>
                        <SearchOutlined />
                    </template>
                </a-input>

                <a-select v-model:value="searchForm.status" placeholder="状态" allow-clear @change="handleSearch"
                    class="search-input">
                    <a-select-option :value="1">启用</a-select-option>
                    <a-select-option :value="0">禁用</a-select-option>
                </a-select>

                <a-button type="primary" @click="handleSearch">
                    <SearchOutlined />
                    搜索
                </a-button>
                <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
            </div>

            <!-- 时间段列表 -->
            <a-table :columns="columns" :data-source="filteredList" :pagination="pagination" :loading="loading"
                row-key="id" @change="handleTableChange">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'status'">
                        <a-tag :color="record.status === 1 ? 'green' : 'red'">
                            {{ record.status === 1 ? '启用' : '禁用' }}
                        </a-tag>
                    </template>
                    <template v-else-if="column.key === 'timeRange'">
                        {{ record.startTime }} - {{ record.endTime }}
                    </template>
                    <template v-else-if="column.key === 'action'">
                        <a-space>
                            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
                            <a-popconfirm title="确定要删除该时间段吗？" @confirm="handleDelete(record)">
                                <a-button type="link" size="small" danger>删除</a-button>
                            </a-popconfirm>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </a-card>

        <!-- 添加/编辑时间段模态框 -->
        <a-modal v-model:open="modalVisible" :title="isEdit ? '编辑时间段' : '添加时间段'" width="600px" @ok="handleModalOk"
            @cancel="handleModalCancel">
            <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
                <a-form-item label="时间段名称" name="slotName">
                    <a-input v-model:value="formData.slotName" placeholder="如：上午第一节" />
                </a-form-item>
                <a-form-item label="开始时间 / 结束时间" name="timeRange">
                    <a-time-picker v-model:value="formData.startTime" format="HH:mm" style="width: 45%" />
                    <span style="display: inline-block; text-align: center; width: 10%">-</span>
                    <a-time-picker v-model:value="formData.endTime" format="HH:mm" style="width: 45%" />
                </a-form-item>
                <a-form-item label="排序" name="sortOrder">
                    <a-input-number v-model:value="formData.sortOrder" :min="0" :max="9999" style="width: 100%" />
                </a-form-item>
                <a-form-item label="状态" name="status">
                    <a-radio-group v-model:value="formData.status">
                        <a-radio :value="1">启用</a-radio>
                        <a-radio :value="0">禁用</a-radio>
                    </a-radio-group>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons-vue'
import {
    listAllTimeSlotService,
    getTimeSlotByIdService,
    createTimeSlotService,
    updateTimeSlotService,
    deleteTimeSlotService
} from '@/api/timeSlot'

const loading = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

// 搜索表单
const searchForm = reactive({
    slotName: '',
    status: undefined
})

// 列表数据
const list = ref([])
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: (total) => `共 ${total} 条`,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100']
})

// 表格列
const columns = [
    {
        title: '时间段名称',
        dataIndex: 'slotName',
        key: 'slotName'
    },
    {
        title: '时间范围',
        key: 'timeRange'
    },
    {
        title: '排序',
        dataIndex: 'sortOrder',
        key: 'sortOrder',
        width: 100
    },
    {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100
    },
    {
        title: '操作',
        key: 'action',
        width: 160
    }
]

// 表单数据
const formData = reactive({
    id: null,
    slotName: '',
    startTime: null,
    endTime: null,
    sortOrder: 0,
    status: 1
})

// 表单校验
const formRules = {
    slotName: [{ required: true, message: '请输入时间段名称' }],
    timeRange: [{ validator: () => (formData.startTime && formData.endTime ? Promise.resolve() : Promise.reject(new Error('请选择开始和结束时间'))) }]
}

// 过滤后的数据
const filteredList = computed(() => {
    let result = list.value

    if (searchForm.slotName) {
        const keyword = searchForm.slotName.toLowerCase()
        result = result.filter((item) =>
            item.slotName?.toLowerCase().includes(keyword)
        )
    }

    if (searchForm.status !== undefined && searchForm.status !== null && searchForm.status !== '') {
        result = result.filter((item) => item.status === searchForm.status)
    }

    return result
})

// 加载列表
const loadList = async () => {
    loading.value = true
    const res = await listAllTimeSlotService(searchForm.slotName || undefined, searchForm.status)
    if (res.code === 0 && res.data) {
        list.value = res.data
        pagination.total = list.value.length
    }
    loading.value = false
}

// 搜索
const handleSearch = () => {
    pagination.current = 1
    loadList()
}

// 重置
const handleReset = () => {
    Object.assign(searchForm, {
        slotName: '',
        status: undefined
    })
    handleSearch()
}

// 分页变化（虽然后端不分页，这里只做前端分页展示）
const handleTableChange = (pag) => {
    pagination.current = pag.current
    pagination.pageSize = pag.pageSize
}

// 新增
const showAddModal = () => {
    isEdit.value = false
    modalVisible.value = true
    Object.assign(formData, {
        id: null,
        slotName: '',
        startTime: null,
        endTime: null,
        sortOrder: 0,
        status: 1
    })
}

// 编辑
const handleEdit = async (record) => {
    isEdit.value = true
    modalVisible.value = true
    const res = await getTimeSlotByIdService(record.id)
    if (res.code === 0 && res.data) {
        const data = res.data
        Object.assign(formData, {
            id: data.id,
            slotName: data.slotName,
            startTime: data.startTime ? dayjs(data.startTime, 'HH:mm:ss') : null,
            endTime: data.endTime ? dayjs(data.endTime, 'HH:mm:ss') : null,
            sortOrder: data.sortOrder ?? 0,
            status: data.status ?? 1
        })
    }
}

// 删除
const handleDelete = async (record) => {
    const res = await deleteTimeSlotService(record.id)
    if (res.code === 0) {
        message.success('时间段删除成功')
        loadList()
    }
}

// 保存
const handleModalOk = async () => {
    await formRef.value.validate()

    const payload = {
        id: formData.id,
        slotName: formData.slotName,
        startTime: formData.startTime ? formData.startTime.format('HH:mm:ss') : null,
        endTime: formData.endTime ? formData.endTime.format('HH:mm:ss') : null,
        sortOrder: formData.sortOrder,
        status: formData.status
    }

    const res = isEdit.value
        ? await updateTimeSlotService(payload)
        : await createTimeSlotService(payload)

    if (res.code === 0) {
        message.success(isEdit.value ? '时间段更新成功' : '时间段添加成功')
        modalVisible.value = false
        loadList()
    }
}

// 取消
const handleModalCancel = () => {
    modalVisible.value = false
    formRef.value?.resetFields()
}

onMounted(() => {
    loadList()
})
</script>

<style scoped>
.time-slot-container {
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
    width: 220px;
}

::deep(.ant-table-thead > tr > th) {
    background-color: #fafafa;
    font-weight: 600;
}

::deep(.ant-table-tbody > tr:hover > td) {
    background-color: #f5f5f5;
}
</style>

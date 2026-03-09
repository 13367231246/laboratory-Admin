<template>
    <div class="lab-schedule-container">
        <a-card title="实验室开放时间配置" class="page-card">
            <template #extra>
                <a-button type="primary" @click="showAddModal">
                    <PlusOutlined />
                    新增时间规则
                </a-button>
            </template>

            <!-- 搜索和筛选 -->
            <div class="search-section">
                <a-input v-model:value="searchForm.ruleName" placeholder="搜索规则名称" allow-clear @change="handleSearch"
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

            <!-- 时间规则列表 -->
            <a-table :columns="columns" :data-source="filteredList" :pagination="pagination" :loading="loading"
                row-key="id" @change="handleTableChange">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'ruleType'">
                        <a-tag :color="getTypeColor(record.ruleType)">
                            {{ getTypeText(record.ruleType) }}
                        </a-tag>
                    </template>
                    <template v-else-if="column.key === 'status'">
                        <a-tag :color="record.status === 1 ? 'green' : 'red'">
                            {{ record.status === 1 ? '启用' : '禁用' }}
                        </a-tag>
                    </template>
                    <template v-else-if="column.key === 'dateRange'">
                        {{ record.startDate }} ~ {{ record.endDate }}
                    </template>
                    <template v-else-if="column.key === 'timeSlots'">
                        <a-space wrap>
                            <a-tag v-for="slot in parseTimeSlots(record.timeSlots)" :key="slot" color="blue">
                                {{ slot }}
                            </a-tag>
                        </a-space>
                    </template>
                    <template v-else-if="column.key === 'laboratoryNames'">
                        {{ record.laboratoryIds === 'all' ? '所有实验室' : (record.laboratoryNames || '-') }}
                    </template>
                    <template v-else-if="column.key === 'weekdays'">
                        {{ renderWeekdays(record.weekdays) }}
                    </template>
                    <template v-else-if="column.key === 'action'">
                        <a-space>
                            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
                            <a-popconfirm title="确定要删除该规则吗？" @confirm="handleDelete(record)">
                                <a-button type="link" size="small" danger>删除</a-button>
                            </a-popconfirm>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </a-card>

        <!-- 添加/编辑时间规则模态框 -->
        <a-modal v-model:open="modalVisible" :title="isEdit ? '编辑时间规则' : '添加时间规则'" width="900px" @ok="handleModalOk"
            @cancel="handleModalCancel">
            <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item label="规则名称" name="ruleName">
                            <a-input v-model:value="formData.ruleName" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item label="规则类型" name="ruleType">
                            <a-select v-model:value="formData.ruleType">
                                <a-select-option value="semester">学期时间</a-select-option>
                                <a-select-option value="holiday">节假日</a-select-option>
                                <a-select-option value="regular">常规时间</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item label="有效期开始日期" name="startDate">
                            <a-date-picker v-model:value="formData.startDate" style="width: 100%" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item label="有效期结束日期" name="endDate">
                            <a-date-picker v-model:value="formData.endDate" style="width: 100%" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-form-item label="适用实验室" name="laboratoryIds">
                    <a-select v-model:value="formData.laboratoryIds" mode="multiple"
                        placeholder="选择实验室（不选则需要后端控制 all 场景）">
                        <a-select-option v-for="lab in laboratoryOptions" :key="lab.id" :value="String(lab.id)">
                            {{ lab.labName }}
                        </a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="适用星期" name="weekdays">
                    <a-checkbox-group v-model:value="formData.weekdays">
                        <a-checkbox value="1">周一</a-checkbox>
                        <a-checkbox value="2">周二</a-checkbox>
                        <a-checkbox value="3">周三</a-checkbox>
                        <a-checkbox value="4">周四</a-checkbox>
                        <a-checkbox value="5">周五</a-checkbox>
                        <a-checkbox value="6">周六</a-checkbox>
                        <a-checkbox value="7">周日</a-checkbox>
                    </a-checkbox-group>
                </a-form-item>

                <a-form-item label="时间段设置" name="timeSlots">
                    <div class="time-slots-config">
                        <div style="margin-bottom: 24px;">
                            <span>可选时间段：</span>
                            <a-space wrap>
                                <a-tag v-for="slot in displayTimeSlotOptions" :key="slot.key"
                                    :color="selectedTimeSlots.includes(slot.key) ? 'blue' : ''" style="cursor: pointer"
                                    @click="toggleTimeSlot(slot.key)">
                                    {{ slot.label }}
                                </a-tag>
                            </a-space>
                        </div>
                        <div class="time-slots-selected" v-if="selectedTimeSlots.length" style="margin-top: 8px">
                            <span class="label">已选择：</span>
                            <a-space wrap>
                                <a-tag v-for="key in selectedTimeSlots" :key="key" color="blue" closable
                                    @close.prevent="removeTimeSlot(key)">
                                    {{ key }}
                                </a-tag>
                            </a-space>
                        </div>
                    </div>
                </a-form-item>

                <a-form-item label="状态" name="status">
                    <a-radio-group v-model:value="formData.status">
                        <a-radio :value="1">启用</a-radio>
                        <a-radio :value="0">禁用</a-radio>
                    </a-radio-group>
                </a-form-item>

                <a-form-item label="备注" name="remark">
                    <a-textarea v-model:value="formData.remark" :rows="3" />
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
    listAllLabScheduleService,
    getLabScheduleByIdService,
    createLabScheduleService,
    updateLabScheduleService,
    deleteLabScheduleService
} from '@/api/labSchedule'
import { getLaboratoryListService } from '@/api/laboratory'
import { listAllTimeSlotService } from '@/api/timeSlot'

const loading = ref(false)
const modalVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

// 搜索表单
const searchForm = reactive({
    ruleName: '',
    ruleType: undefined,
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

// 下拉数据
const laboratoryOptions = ref([])
const timeSlotOptions = ref([])
const selectedTimeSlots = ref([])

// 表格列
const columns = [
    {
        title: '规则名称',
        dataIndex: 'ruleName',
        key: 'ruleName',
        width: 160
    },
    {
        title: '规则类型',
        dataIndex: 'ruleType',
        key: 'ruleType',
        width: 120
    },
    {
        title: '适用实验室',
        dataIndex: 'laboratoryNames',
        key: 'laboratoryNames',
        ellipsis: true
    },
    {
        title: '时间段',
        key: 'timeSlots',
        width: 220
    },
    {
        title: '有效期',
        key: 'dateRange',
        width: 200
    },
    {
        title: '适用星期',
        key: 'weekdays',
        width: 180
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
        width: 180
    }
]

// 表单数据
const formData = reactive({
    id: null,
    ruleName: '',
    ruleType: undefined,
    laboratoryIds: [],
    laboratoryNames: '',
    timeSlotIds: [],
    startDate: null,
    endDate: null,
    weekdays: [],
    status: 1,
    remark: ''
})

// 表单校验
const formRules = {
    ruleName: [{ required: true, message: '请输入规则名称' }],
    ruleType: [{ required: true, message: '请选择规则类型' }],
    startDate: [{ required: true, message: '请选择开始日期' }],
    endDate: [{ required: true, message: '请选择结束日期' }],
    timeSlots: [{
        validator: () => {
            return selectedTimeSlots.value.length > 0
                ? Promise.resolve()
                : Promise.reject(new Error('请选择时间段'))
        }
    }]
}

// 类型颜色/文案
const getTypeColor = (type) => {
    const map = {
        semester: 'blue',
        holiday: 'red',
        regular: 'green'
    }
    return map[type] || 'default'
}

const getTypeText = (type) => {
    const map = {
        semester: '学期时间',
        holiday: '节假日',
        regular: '常规时间'
    }
    return map[type] || type
}

// 解析 time_slots JSON
const parseTimeSlots = (value) => {
    if (!value) {
        return []
    }
    try {
        const arr = typeof value === 'string' ? JSON.parse(value) : value
        if (!Array.isArray(arr)) {
            return []
        }
        return arr.map((item) => `${item.start}-${item.end}`)
    } catch (e) {
        return []
    }
}

// 将后端时间段选项映射为标签显示用的数据
const displayTimeSlotOptions = computed(() => {
    const normalize = (t) => {
        if (!t) return ''
        const s = String(t)
        return s.length >= 5 ? s.slice(0, 5) : s
    }
    return (timeSlotOptions.value || []).map((slot) => {
        const start = normalize(slot.startTime)
        const end = normalize(slot.endTime)
        const key = `${start}-${end}`
        return {
            key,
            label: `${start}-${end}`
        }
    })
})

// 选择/取消选择时间段
const toggleTimeSlot = (key) => {
    const index = selectedTimeSlots.value.indexOf(key)
    if (index > -1) {
        selectedTimeSlots.value.splice(index, 1)
    } else {
        selectedTimeSlots.value.push(key)
    }
}

// 删除已选时间段
const removeTimeSlot = (key) => {
    const index = selectedTimeSlots.value.indexOf(key)
    if (index > -1) {
        selectedTimeSlots.value.splice(index, 1)
    }
}

// 渲染星期
const renderWeekdays = (val) => {
    if (!val) {
        return '-'
    }
    const arr = String(val)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    const map = {
        1: '一',
        2: '二',
        3: '三',
        4: '四',
        5: '五',
        6: '六',
        7: '日'
    }
    return arr
        .map((d) => `周${map[d] || d}`)
        .join('、')
}

// 过滤后的数据
const filteredList = computed(() => {
    let result = list.value

    if (searchForm.ruleName) {
        const keyword = searchForm.ruleName.toLowerCase()
        result = result.filter((item) =>
            item.ruleName?.toLowerCase().includes(keyword)
        )
    }

    if (searchForm.status !== undefined && searchForm.status !== null && searchForm.status !== '') {
        result = result.filter((item) => item.status === searchForm.status)
    }

    return result
})

// 加载下拉数据
const loadOptions = async () => {
    // 实验室列表（分页接口，这里取第一页较大 pageSize）
    const labRes = await getLaboratoryListService(1, 1000)
    if (labRes.code === 0 && labRes.data) {
        laboratoryOptions.value = labRes.data.items || []
    }

    // 时间段列表
    const slotRes = await listAllTimeSlotService()
    if (slotRes.code === 0 && slotRes.data) {
        timeSlotOptions.value = slotRes.data || []
    }
}

// 加载规则列表
const loadList = async () => {
    loading.value = true
    const res = await listAllLabScheduleService(
        searchForm.ruleName || undefined,
        searchForm.ruleType || undefined,
        searchForm.status
    )
    if (res.code === 0 && res.data) {
        list.value = res.data || []
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
        ruleName: '',
        ruleType: undefined,
        status: undefined
    })
    handleSearch()
}

// 分页变化（前端分页展示）
const handleTableChange = (pag) => {
    pagination.current = pag.current
    pagination.pageSize = pag.pageSize
}

// 打开新增
const showAddModal = () => {
    isEdit.value = false
    modalVisible.value = true
    Object.assign(formData, {
        id: null,
        ruleName: '',
        ruleType: undefined,
        laboratoryIds: [],
        laboratoryNames: '',
        timeSlotIds: [],
        startDate: null,
        endDate: null,
        weekdays: [],
        status: 1,
        remark: ''
    })
    selectedTimeSlots.value = []
}

// 打开编辑
const handleEdit = async (record) => {
    isEdit.value = true
    modalVisible.value = true
    const res = await getLabScheduleByIdService(record.id)
    if (res.code === 0 && res.data) {
        const data = res.data
        Object.assign(formData, {
            id: data.id,
            ruleName: data.ruleName,
            ruleType: data.ruleType,
            laboratoryIds: data.laboratoryIds
                ? String(data.laboratoryIds)
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [],
            laboratoryNames: data.laboratoryNames || '',
            timeSlotIds: (() => {
                if (!data.timeSlots) {
                    return []
                }
                try {
                    const arr = typeof data.timeSlots === 'string' ? JSON.parse(data.timeSlots) : data.timeSlots
                    if (!Array.isArray(arr)) {
                        return []
                    }
                    return arr
                        .map((it) => (it.id != null ? String(it.id) : null))
                        .filter(Boolean)
                } catch (e) {
                    return []
                }
            })(),
            startDate: data.startDate ? dayjs(data.startDate) : null,
            endDate: data.endDate ? dayjs(data.endDate) : null,
            weekdays: data.weekdays
                ? String(data.weekdays)
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [],
            status: data.status ?? 1,
            remark: data.remark || ''
        })
        selectedTimeSlots.value = parseTimeSlots(data.timeSlots)
    }
}

// 删除
const handleDelete = async (record) => {
    const res = await deleteLabScheduleService(record.id)
    if (res.code === 0) {
        message.success('规则删除成功')
        loadList()
    }
}

// 保存
const handleModalOk = async () => {
    await formRef.value.validate()

    // 处理 laboratory_ids / laboratory_names
    const ids = formData.laboratoryIds || []
    const idStr = ids.length ? ids.join(',') : 'all'
    const nameStr = (() => {
        if (!ids.length) {
            return ''
        }
        const map = new Map(laboratoryOptions.value.map((lab) => [String(lab.id), lab.labName]))
        return ids.map((id) => map.get(id) || id).join(',')
    })()

    // 处理 time_slots JSON：[{start,end,id}]
    const timeSlotsPayload = (() => {
        const arr = selectedTimeSlots.value || []
        if (!arr.length) {
            return '[]'
        }
        const result = arr.map((key) => {
            const parts = String(key).split('-')
            const start = parts[0] ? parts[0].trim() : ''
            const end = parts[1] ? parts[1].trim() : ''
            return {
                start,
                end
            }
        })
        return JSON.stringify(result)
    })()

    const payload = {
        id: formData.id,
        ruleName: formData.ruleName,
        ruleType: formData.ruleType,
        laboratoryIds: idStr,
        laboratoryNames: nameStr,
        timeSlots: timeSlotsPayload,
        startDate: formData.startDate ? formData.startDate.format('YYYY-MM-DD') : null,
        endDate: formData.endDate ? formData.endDate.format('YYYY-MM-DD') : null,
        weekdays: (formData.weekdays || []).join(','),
        status: formData.status,
        remark: formData.remark
    }

    const res = isEdit.value
        ? await updateLabScheduleService(payload)
        : await createLabScheduleService(payload)

    if (res.code === 0) {
        message.success(isEdit.value ? '时间规则更新成功' : '时间规则添加成功')
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
    loadOptions()
    loadList()
})
</script>

<style scoped>
.lab-schedule-container {
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

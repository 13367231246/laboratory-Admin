<template>
    <div class="notice-container">
        <a-card :title="isEdit ? '编辑公告' : '创建新公告'" class="page-card">
            <a-form :model="formState" layout="vertical" ref="formRef">
                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item label="标题" name="title" :rules="[{ required: true, message: '请输入公告标题' }]">
                            <a-input v-model:value="formState.title" placeholder="请输入公告标题" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item label="状态" name="status">
                            <a-radio-group v-model:value="formState.status">
                                <a-radio :value="0">草稿</a-radio>
                                <a-radio :value="1">已发布</a-radio>
                            </a-radio-group>
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-form-item label="内容" name="content" :rules="[{ required: true, message: '请输入公告内容' }]">
                    <MarkdownEditor v-model="formState.content" @save="handleSave" />
                </a-form-item>
                <a-form-item>
                    <a-space>
                        <a-button type="primary" @click="handleSubmit">保存</a-button>
                        <a-button @click="handleReset">重置</a-button>
                    </a-space>
                </a-form-item>
            </a-form>
        </a-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import MarkdownEditor from '@/components/MarkdownEditor/index.vue'
import {
    getNoticeByIdService,
    createNoticeService,
    updateNoticeService
} from '@/api/notice'

const route = useRoute()
const router = useRouter()
const formRef = ref()

const isEdit = ref(false)
const formState = ref({
    id: null,
    title: '',
    content: '',
    status: 0
})

const loadNotice = async (id) => {
    const response = await getNoticeByIdService(id)
    if (response.code === 0 && response.data) {
        formState.value = {
            id: response.data.id,
            title: response.data.title,
            content: response.data.content,
            status: response.data.status
        }
        isEdit.value = true
    }
}

const handleSubmit = async () => {
    await formRef.value.validate()

    const response = isEdit.value
        ? await updateNoticeService(formState.value)
        : await createNoticeService(formState.value)

    if (response.code === 0) {
        message.success(isEdit.value ? '更新成功' : '创建成功')
        router.push({ name: 'NoticeList' })
    }
}

const handleReset = () => {
    formRef.value.resetFields()
    if (!isEdit.value) {
        formState.value = {
            id: null,
            title: '',
            content: '',
            status: 0
        }
    }
}

const handleSave = (content) => {
    formState.value.content = content
}

onMounted(() => {
    const id = route.params.id
    if (id) {
        loadNotice(id)
    }
})
</script>

<style scoped>
.notice-container {
    padding: 24px;
}

.page-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>

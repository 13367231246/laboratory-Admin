<template>
  <div class="import-container">
    <a-card title="数据导入" class="page-card">
      <!-- 导入步骤 -->
      <a-steps :current="currentStep" style="margin-bottom: 32px">
        <a-step title="选择文件" />
        <a-step title="数据预览" />
        <a-step title="导入完成" />
      </a-steps>

      <!-- 步骤1：选择文件 -->
      <div v-if="currentStep === 0" class="step-content">
        <a-card title="选择导入文件" class="step-card">
          <template #extra>
            <a-space>
              <a-button type="primary" :disabled="!fileList.length" @click="goNextFromUpload">下一步</a-button>
            </a-space>
          </template>
          <a-upload-dragger v-model:file-list="fileList" :before-upload="beforeUpload" :multiple="false" accept=".xlsx,.xls,.csv" @change="handleFileChange">
            <p class="ant-upload-drag-icon">
              <inbox-outlined />
            </p>
            <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p class="ant-upload-hint">支持 Excel (.xlsx, .xls) 和 CSV 格式文件</p>
          </a-upload-dragger>

          <div class="template-section">
            <h4>下载模板</h4>
            <a-space>
              <a-button @click="downloadTemplate('laboratory')">
                <download-outlined />
                实验室模板
              </a-button>
              <a-button @click="downloadTemplate('equipment')">
                <download-outlined />
                设备模板
              </a-button>
              <a-button @click="downloadTemplate('user')">
                <download-outlined />
                用户模板
              </a-button>
            </a-space>
          </div>
        </a-card>
      </div>

      <!-- 步骤2：数据预览 -->
      <div v-if="currentStep === 1" class="step-content">
        <a-card title="数据预览" class="step-card">
          <template #extra>
            <a-space>
              <a-button @click="currentStep = 0">上一步</a-button>
              <a-button type="primary" @click="handleImport" :loading="importing">开始导入</a-button>
            </a-space>
          </template>

          <div class="preview-info">
            <a-alert message="数据预览" :description="`共发现 ${previewData.length} 条记录，请检查数据是否正确`" type="info" show-icon style="margin-bottom: 16px" />

            <a-table :columns="previewColumns" :data-source="previewData.slice(0, 10)" :pagination="false" size="small" :scroll="{ x: 800 }" />
          </div>
        </a-card>
      </div>

      <!-- 步骤4：导入完成 -->
      <div v-if="currentStep === 2" class="step-content">
        <a-card title="导入完成" class="step-card">
          <div class="result-section">
            <a-result :status="importResult.success ? 'success' : 'error'" :title="importResult.success ? '导入成功' : '导入失败'" :sub-title="importResult.message">
              <template #extra>
                <a-space>
                  <a-button type="primary" @click="handleReset">重新导入</a-button>
                  <a-button @click="handleViewResult">查看详情</a-button>
                </a-space>
              </template>
            </a-result>

            <div v-if="importResult.details" class="import-details">
              <a-descriptions title="导入详情" :column="2">
                <a-descriptions-item label="总记录数">{{ importResult.details.total }}</a-descriptions-item>
                <a-descriptions-item label="成功导入">{{ importResult.details.success }}</a-descriptions-item>
                <a-descriptions-item label="失败记录">{{ importResult.details.failed }}</a-descriptions-item>
                <a-descriptions-item label="跳过记录">{{ importResult.details.skipped }}</a-descriptions-item>
              </a-descriptions>

              <div v-if="importResult.details.errors && importResult.details.errors.length > 0" class="error-list">
                <h4>错误详情：</h4>
                <a-list :data-source="importResult.details.errors" size="small">
                  <template #renderItem="{ item }">
                    <a-list-item>
                      <a-list-item-meta>
                        <template #title> 第{{ item.row }}行：{{ item.message }} </template>
                      </a-list-item-meta>
                    </a-list-item>
                  </template>
                </a-list>
              </div>
            </div>
          </div>
        </a-card>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons-vue'

const currentStep = ref(0)
const fileList = ref([])
const previewData = ref([])
const importing = ref(false)
const importResult = reactive({
  success: false,
  message: '',
  details: null
})

// 预览表格列
const previewColumns = [
  { title: '行号', dataIndex: 'row', key: 'row', width: 80 },
  { title: '实验室名称', dataIndex: 'name', key: 'name', width: 150 },
  { title: '位置', dataIndex: 'location', key: 'location', width: 120 },
  { title: '容量', dataIndex: 'capacity', key: 'capacity', width: 100 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 }
]

// 已移除字段映射步骤

// 上传前处理
const beforeUpload = (file) => {
  const isValidType = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel' || file.type === 'text/csv'

  if (!isValidType) {
    message.error('只支持 Excel 和 CSV 格式文件!')
    return false
  }

  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('文件大小不能超过 10MB!')
    return false
  }

  return false // 阻止自动上传
}

// 文件变化处理
const handleFileChange = (info) => {
  fileList.value = info?.fileList || []
  if (fileList.value.length > 0) {
    // 模拟解析文件数据
    previewData.value = [
      { row: 1, name: '化学实验室A', location: '教学楼101', capacity: 30, type: '化学', status: '可用' },
      { row: 2, name: '物理实验室B', location: '教学楼201', capacity: 25, type: '物理', status: '维护中' },
      { row: 3, name: '生物实验室C', location: '教学楼301', capacity: 20, type: '生物', status: '可用' }
    ]

    message.success('文件解析成功')
  }
}

// 选择文件后的下一步
const goNextFromUpload = () => {
  if (!fileList.value.length) {
    message.warning('请先选择文件')
    return
  }
  // 已在选择文件时生成了预览与映射数据，这里直接进入下一步
  currentStep.value = 1
}

// 下载模板
const downloadTemplate = (type) => {
  const templates = {
    laboratory: '实验室导入模板.xlsx',
    equipment: '设备导入模板.xlsx',
    user: '用户导入模板.xlsx'
  }

  message.success(`正在下载 ${templates[type]}`)
  // 这里应该实现真实的下载逻辑
}

// 处理导入
const handleImport = async () => {
  importing.value = true

  try {
    // 模拟导入过程
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 模拟导入结果
    const success = Math.random() > 0.2 // 80% 成功率
    const total = previewData.value.length
    const successCount = success ? total : Math.floor(total * 0.8)
    const failedCount = total - successCount

    importResult.success = success
    importResult.message = success ? `成功导入 ${successCount} 条记录` : `导入完成，${failedCount} 条记录失败`

    importResult.details = {
      total,
      success: successCount,
      failed: failedCount,
      skipped: 0,
      errors:
        failedCount > 0
          ? [
              { row: 2, message: '实验室名称不能为空' },
              { row: 4, message: '容量必须为数字' }
            ]
          : []
    }

    currentStep.value = 2
  } catch (error) {
    importResult.success = false
    importResult.message = '导入过程中发生错误'
    currentStep.value = 2
  } finally {
    importing.value = false
  }
}

// 重置导入
const handleReset = () => {
  currentStep.value = 0
  fileList.value = []
  previewData.value = []
  importResult.success = false
  importResult.message = ''
  importResult.details = null
}

// 查看结果
const handleViewResult = () => {
  message.info('查看导入结果详情')
}
</script>

<style scoped>
.import-container {
  padding: 24px;
}

.page-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step-content {
  min-height: 400px;
}

.step-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.template-section {
  margin-top: 24px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 6px;
}

.template-section h4 {
  margin-bottom: 12px;
  color: #262626;
}

.preview-info {
  margin-top: 16px;
}

.mapping-section {
  margin-top: 16px;
}

.result-section {
  text-align: center;
}

.import-details {
  margin-top: 24px;
  text-align: left;
}

.error-list {
  margin-top: 16px;
}

.error-list h4 {
  color: #f5222d;
  margin-bottom: 12px;
}

:deep(.ant-upload-drag) {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  background: #fafafa;
}

:deep(.ant-upload-drag:hover) {
  border-color: #40a9ff;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 600;
}
</style>

<template>
  <div class="dashboard-container">
    <a-row :gutter="16">
      <!-- 统计卡片 -->
      <a-col :span="6" v-for="stat in statistics" :key="stat.title">
        <a-card class="stat-card">
          <a-statistic :title="stat.title" :value="stat.value" :value-style="{ color: stat.color }">
            <template #prefix>
              <component :is="stat.icon" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px">
      <!-- 今日申请 -->
      <a-col :span="12">
        <a-card title="今日申请" class="info-card">
          <a-list :data-source="todayAppointments" item-layout="horizontal">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <a>{{ item.labName }}({{ item.labNumber }})</a>
                  </template>
                  <template #description>
                    <p>申请人: {{ item.applicantRealName }} | 联系方式: {{ item.applicantPhone }}</p>
                    <p>申请时间：{{ item.createTime }}</p>
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <a-tag :color="item.status === 1 ? 'green' : item.status === 2 ? 'red' : 'orange'">
                    {{ item.status === 1 ? '已通过' : item.status === 2 ? '已拒绝' : '待审批' }}
                  </a-tag>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <!-- 实验室状态 -->
      <a-col :span="12">
        <a-card title="实验室状态" class="info-card">
          <a-list :data-source="laboratories" item-layout="horizontal">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <a>{{ item.name }}</a>
                  </template>
                  <template #description> {{ item.location }} - 容量: {{ item.capacity }}人 </template>
                </a-list-item-meta>
                <template #actions>
                  <a-tag :color="item.status === 'available' ? 'green' : 'red'">
                    {{ item.status === 'available' ? '可用' : '维护中' }}
                  </a-tag>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { UserOutlined, HomeOutlined, CalendarOutlined, ToolOutlined } from '@ant-design/icons-vue'
import { getAdminSummaryService, getTodayApplicationsService, getRecentLaboratoriesService } from '@/api/admin'

const statistics = ref([])
const todayAppointments = ref([])
const laboratories = ref([])

onMounted(async () => {
  try {
    // 获取统计数据
    const statsRes = await getAdminSummaryService()
    if (statsRes && statsRes.code === 0 && statsRes.data) {
      const summary = statsRes.data
      statistics.value = [
        {
          title: '实验室总数',
          value: summary.totalLaboratories || 0,
          icon: HomeOutlined,
          color: '#1890ff'
        },
        {
          title: '用户总数',
          value: summary.totalUsers || 0,
          icon: UserOutlined,
          color: '#52c41a'
        },
        {
          title: '今日预约',
          value: summary.todayApplications || 0,
          icon: CalendarOutlined,
          color: '#faad14'
        },
        {
          title: '设备种类',
          value: summary.totalEquipment || 0,
          icon: ToolOutlined,
          color: '#f5222d'
        }
      ]
    }

    // 获取今日申请
    const applicationsRes = await getTodayApplicationsService()
    if (applicationsRes && applicationsRes.code === 0 && applicationsRes.data) {
      todayAppointments.value = applicationsRes.data
      console.log(todayAppointments.value)
    }

    // 获取最近实验室
    const labsRes = await getRecentLaboratoriesService()
    if (labsRes && labsRes.code === 0 && labsRes.data) {
      laboratories.value = labsRes.data.map((lab) => ({
        ...lab,
        name: lab.name || lab.labName || '未命名实验室',
        location: lab.location || lab.address || '未知位置',
        capacity: lab.capacity || 0,
        status: lab.status === 1 || lab.status === 'active' || lab.status === 'available' ? 'available' : 'maintenance'
      }))
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  }
})
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
}

.stat-card {
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.ant-list-item) {
  padding: 12px 0;
}
</style>

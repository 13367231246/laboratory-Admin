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
      <!-- 今日预约 -->
      <a-col :span="12">
        <a-card title="今日预约" class="info-card">
          <a-list :data-source="todayAppointments" item-layout="horizontal">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <a>{{ item.laboratoryName }}</a>
                  </template>
                  <template #description> {{ item.time }} - {{ item.purpose }} </template>
                </a-list-item-meta>
                <template #actions>
                  <a-tag :color="item.status === 'confirmed' ? 'green' : 'orange'">
                    {{ item.status === 'confirmed' ? '已确认' : '待确认' }}
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
import { mockApi } from '@/api/mockData'

const statistics = ref([])
const todayAppointments = ref([])
const laboratories = ref([])

onMounted(async () => {
  try {
    // 获取统计数据
    const statsRes = await mockApi.getStatistics()
    statistics.value = [
      {
        title: '实验室总数',
        value: statsRes.data.totalLaboratories,
        icon: HomeOutlined,
        color: '#1890ff'
      },
      {
        title: '用户总数',
        value: statsRes.data.totalUsers,
        icon: UserOutlined,
        color: '#52c41a'
      },
      {
        title: '今日预约',
        value: statsRes.data.todayAppointments,
        icon: CalendarOutlined,
        color: '#faad14'
      },
      {
        title: '设备总数',
        value: statsRes.data.totalEquipment,
        icon: ToolOutlined,
        color: '#f5222d'
      }
    ]

    // 获取今日预约
    const appointmentsRes = await mockApi.getAppointments()
    const today = new Date().toISOString().split('T')[0]
    todayAppointments.value = appointmentsRes.data

    // 获取实验室列表
    const labsRes = await mockApi.getLaboratories()
    laboratories.value = labsRes.data.slice(0, 10) // 只显示前3个
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
  height: 400px;
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

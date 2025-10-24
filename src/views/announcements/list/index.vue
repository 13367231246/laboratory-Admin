<template>
  <div class="announcement-list-container">
    <a-card title="公告管理" class="page-card">
      <a-table :columns="columns" :data-source="announcementStore.announcements" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewAnnouncement(record)">预览</a-button>
              <a-button type="link" size="small" @click="editAnnouncement(record)">编辑</a-button>
              <a-popconfirm title="确定要删除这篇公告吗？" @confirm="deleteAnnouncement(record.id)">
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="viewModalVisible" :title="currentAnnouncement.title" :footer="null" width="800px">
      <MarkdownView :content="currentAnnouncement.content" />
    </a-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAnnouncementStore } from '@/stores/announcements'
import MarkdownView from '@/components/MarkdownView/index.vue'

const router = useRouter()
const announcementStore = useAnnouncementStore()

const columns = [
  { title: '标题', dataIndex: 'title', key: 'title' },
  { title: '发布日期', dataIndex: 'date', key: 'date', width: 150 },
  { title: '操作', key: 'action', width: 200 }
]

const viewModalVisible = ref(false)
const currentAnnouncement = ref({})

const viewAnnouncement = (announcement) => {
  currentAnnouncement.value = announcement
  viewModalVisible.value = true
}

const editAnnouncement = (announcement) => {
  router.push({ name: 'PublishAnnouncement', params: { id: announcement.id } })
}

const deleteAnnouncement = (id) => {
  announcementStore.deleteAnnouncement(id)
}
</script>

<style scoped>
.announcement-list-container {
  padding: 24px;
}
.page-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { message } from 'ant-design-vue'

export const useAnnouncementStore = defineStore('announcements', () => {
  const announcements = ref([
    { id: 1, title: '系统V1.1版本更新通知', content: '### 新功能\n- 新增了 **公告发布** 模块。\n- 优化了教师权限分配流程。\n\n### 修复\n- 修复了若干已知BUG。', date: '2025-10-27' },
    { id: 2, title: '新型显微镜已到货', content: '#### 设备上新\n\n我们采购了一批 **高精度电子显微镜**，现已在化学实验室A投入使用，欢迎各位老师同学预约使用。', date: '2025-10-26' },
    { id: 3, title: '实验室安全守则（2025版）', content: '##### 请各位师生严格遵守以下守则：\n1.  实验前必须穿戴好防护用具。\n2.  禁止在实验室内饮食。\n3.  实验结束后及时清理实验台。', date: '2025-10-25' }
  ])

  function getAnnouncementById(id) {
    return announcements.value.find((ann) => ann.id === id)
  }

  function addAnnouncement(announcement) {
    announcements.value.unshift({
      ...announcement,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    })
    message.success('公告发布成功')
  }

  function updateAnnouncement(updatedAnnouncement) {
    const index = announcements.value.findIndex((ann) => ann.id === updatedAnnouncement.id)
    if (index !== -1) {
      announcements.value[index] = { ...announcements.value[index], ...updatedAnnouncement }
      message.success('公告更新成功')
    }
  }

  function deleteAnnouncement(id) {
    const index = announcements.value.findIndex((ann) => ann.id === id)
    if (index !== -1) {
      announcements.value.splice(index, 1)
      message.success('公告删除成功')
    }
  }

  return { announcements, getAnnouncementById, addAnnouncement, updateAnnouncement, deleteAnnouncement }
})

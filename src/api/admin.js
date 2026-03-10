import request from '@/utils/request'

// 获取管理员汇总统计
export const getAdminSummaryService = () => {
  return request.get('/admin/summary')
}

// 获取今日申请（最近5条）
export const getTodayApplicationsService = () => {
  return request.get('/admin/today-applications')
}

// 获取最近5个实验室
export const getRecentLaboratoriesService = () => {
  return request.get('/admin/recent-laboratories')
}

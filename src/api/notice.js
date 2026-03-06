import request from '@/utils/request'

// 分页获取所有公告
export const getNoticeListService = (pageNo, pageSize) => {
  return request.get('/notice/list', {
    params: {
      pageNo,
      pageSize
    }
  })
}

// 获取公告详情
export const getNoticeByIdService = (id) => {
  return request.get(`/notice/${id}`)
}

// 创建公告
export const createNoticeService = (data) => {
  return request.post('/notice', data)
}

// 更新公告
export const updateNoticeService = (data) => {
  return request.put('/notice', data)
}

// 发布公告
export const publishNoticeService = (id) => {
  return request.patch(`/notice/${id}/publish`)
}

// 下线公告
export const offlineNoticeService = (id) => {
  return request.patch(`/notice/${id}/offline`)
}

// 删除公告
export const deleteNoticeService = (id) => {
  return request.delete(`/notice/${id}`)
}

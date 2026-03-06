import request from '@/utils/request'

// 不分页查询时间段（可按名称/状态过滤）
export const listAllTimeSlotService = (slotName, status) => {
  return request.get('/timeSlot/listAll', {
    params: {
      slotName,
      status
    }
  })
}

// 根据ID查询时间段详情
export const getTimeSlotByIdService = (id) => {
  return request.get(`/timeSlot/${id}`)
}

// 新增时间段
export const createTimeSlotService = (data) => {
  return request.post('/timeSlot', data)
}

// 更新时间段
export const updateTimeSlotService = (data) => {
  return request.put('/timeSlot', data)
}

// 删除时间段
export const deleteTimeSlotService = (id) => {
  return request.delete(`/timeSlot/${id}`)
}



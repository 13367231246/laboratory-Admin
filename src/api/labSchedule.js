import request from '@/utils/request'

// 不分页查询时间规则（可按名称/类型/状态过滤）
export const listAllLabScheduleService = (ruleName, ruleType, status) => {
  return request.get('/labSchedule/listAll', {
    params: {
      ruleName,
      ruleType,
      status
    }
  })
}

// 根据ID查询规则详情
export const getLabScheduleByIdService = (id) => {
  return request.get(`/labSchedule/${id}`)
}

// 新增规则
export const createLabScheduleService = (data) => {
  return request.post('/labSchedule', data)
}

// 更新规则
export const updateLabScheduleService = (data) => {
  return request.put('/labSchedule', data)
}

// 删除规则
export const deleteLabScheduleService = (id) => {
  return request.delete(`/labSchedule/${id}`)
}



import request from '@/utils/request'

// 分页获取所有实验室
export const getLaboratoryListService = (pageNo, pageSize) => {
  return request.get('/laboratory/list', {
    params: {
      pageNo,
      pageSize
    }
  })
}

// 根据ID获取实验室详情
export const getLaboratoryByIdService = (id) => {
  return request.get(`/laboratory/${id}`)
}

// 新增实验室
export const createLaboratoryService = (data) => {
  return request.post('/laboratory', data)
}

// 更新实验室信息
export const updateLaboratoryService = (data) => {
  return request.put('/laboratory', data)
}

// 删除实验室
export const deleteLaboratoryService = (id) => {
  return request.delete(`/laboratory/${id}`)
}

// 添加设备到实验室
export const addEquipmentToLaboratoryService = (laboratoryId, equipmentId, quantity) => {
  return request.post(`/laboratory/${laboratoryId}/equipment`, {
    equipmentId,
    quantity
  })
}


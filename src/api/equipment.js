import request from '@/utils/request'

// 分页获取所有设备
export const getEquipmentListService = (pageNo, pageSize) => {
  return request.get('/equipment/list', {
    params: {
      pageNo,
      pageSize
    }
  })
}

// 根据ID获取设备详情
export const getEquipmentByIdService = (id) => {
  return request.get(`/equipment/${id}`)
}

// 新增设备
export const createEquipmentService = (data) => {
  return request.post('/equipment', data)
}

// 更新设备信息
export const updateEquipmentService = (data) => {
  return request.put('/equipment', data)
}

// 删除设备
export const deleteEquipmentService = (id) => {
  return request.delete(`/equipment/${id}`)
}

// 不分页查询设备列表，可根据设备名模糊搜索
export const listAllEquipmentService = (equipmentName) => {
  return request.get('/equipment/listAll', {
    params: {
      equipmentName
    }
  })
}

// 根据实验室ID获取设备列表
export const getEquipmentByLaboratoryIdService = (laboratoryId) => {
  return request.get(`/laboratory/${laboratoryId}/equipment`)
}

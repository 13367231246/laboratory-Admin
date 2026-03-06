import request from '@/utils/request'

// 分页获取所有学院
export const getCollegeListService = (pageNo, pageSize) => {
  return request.get('/college/list', {
    params: {
      pageNo,
      pageSize
    }
  })
}

// 获取所有学院（不分页，用于下拉选择）
export const getAllCollegesService = () => {
  return request.get('/college/all')
}

// 根据ID获取学院详情
export const getCollegeByIdService = (id) => {
  return request.get(`/college/${id}`)
}

// 新增学院
export const createCollegeService = (data) => {
  return request.post('/college', data)
}

// 更新学院信息
export const updateCollegeService = (data) => {
  return request.put('/college', data)
}

// 删除学院
export const deleteCollegeService = (id) => {
  return request.delete(`/college/${id}`)
}


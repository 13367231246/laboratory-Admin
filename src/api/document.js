import request from '@/utils/request'

// 分页获取所有文档
export const getDocumentListService = (pageNo, pageSize) => {
  return request.get('/document/list', {
    params: {
      pageNo,
      pageSize
    }
  })
}

// 获取文档详情
export const getDocumentByIdService = (id) => {
  return request.get(`/document/${id}`)
}

// 创建文档
export const createDocumentService = (data) => {
  return request.post('/document', data)
}

// 更新文档
export const updateDocumentService = (data) => {
  return request.put('/document', data)
}

// 发布文档
export const publishDocumentService = (id) => {
  return request.patch(`/document/${id}/publish`)
}

// 下线文档
export const offlineDocumentService = (id) => {
  return request.patch(`/document/${id}/offline`)
}

// 删除文档
export const deleteDocumentService = (id) => {
  return request.delete(`/document/${id}`)
}

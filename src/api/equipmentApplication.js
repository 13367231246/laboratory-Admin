import request from '@/utils/request'

export const listAllEquipmentApplicationService = (pageNo, pageSize) => {
  return request.get('/equipment-application/admin/list', {
    params: { pageNo, pageSize }
  })
}

export const approveEquipmentApplicationService = (id, reviewComment) => {
  return request.patch(`/equipment-application/admin/${id}/approve`, null, {
    params: reviewComment != null ? { reviewComment } : {}
  })
}

export const rejectEquipmentApplicationService = (id, reviewComment) => {
  return request.patch(`/equipment-application/admin/${id}/reject`, null, {
    params: { reviewComment }
  })
}

export const adminDeleteEquipmentApplicationService = (id) => {
  return request.delete(`/equipment-application/admin/${id}`)
}

import request from '@/utils/request'

export const listAllMaintenanceRecordService = (pageNo, pageSize) => {
  return request.get('/maintenance/admin/list', {
    params: { pageNo, pageSize }
  })
}

export const getMaintenanceSummaryService = () => {
  return request.get('/maintenance/summary')
}

export const applyMaintenanceService = (data) => {
  return request.post('/maintenance/apply', data)
}

export const assignMaintenanceTeacherService = (id, teacherId) => {
  return request.patch(`/maintenance/admin/${id}/assign`, {
    teacherId
  })
}

export const startMaintenanceRepairService = (id) => {
  return request.patch(`/maintenance/teacher/${id}/start`)
}

export const deleteMaintenanceRecordService = (id) => {
  return request.delete(`/maintenance/admin/${id}`)
}

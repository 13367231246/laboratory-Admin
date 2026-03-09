import request from '@/utils/request'

/**
 * 管理员：分页查询所有实验室申请记录
 */
export const listAllLabApplicationService = (pageNo, pageSize) => {
  return request.get('/lab-application/admin/list', {
    params: { pageNo, pageSize }
  })
}

/**
 * 管理员：审核通过申请
 * @param {number} id 申请ID
 * @param {string} [reviewComment] 审核意见（可选）
 */
export const approveLabApplicationService = (id, reviewComment) => {
  return request.patch(`/lab-application/admin/${id}/approve`, null, {
    params: reviewComment != null ? { reviewComment } : {}
  })
}

/**
 * 管理员：审核拒绝申请（必须填写审核意见）
 * @param {number} id 申请ID
 * @param {string} reviewComment 审核意见
 */
export const rejectLabApplicationService = (id, reviewComment) => {
  return request.patch(`/lab-application/admin/${id}/reject`, null, {
    params: { reviewComment }
  })
}

/**
 * 管理员：删除任意申请记录
 */
export const adminDeleteLabApplicationService = (id) => {
  return request.delete(`/lab-application/admin/${id}`)
}

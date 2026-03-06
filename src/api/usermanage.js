import request from '@/utils/request'

// 分页获取学生列表
export const listStudentsService = (pageNo, pageSize) => {
  return request.get('/user-management/students', {
    params: {
      pageNo,
      pageSize
    }
  })
}

// 分页获取教师列表
export const listTeachersService = (pageNo, pageSize) => {
  return request.get('/user-management/teachers', {
    params: {
      pageNo,
      pageSize
    }
  })
}

// 根据ID获取用户信息
export const getUserByIdService = (id) => {
  return request.get(`/user-management/${id}`)
}

// 新增学生
export const addStudentService = (data) => {
  return request.post('/user-management/student', data)
}

// 新增教师
export const addTeacherService = (data) => {
  return request.post('/user-management/teacher', data)
}

// 更新用户信息
export const updateUserService = (data) => {
  return request.put('/user-management', data)
}

// 重置密码
export const resetPasswordService = (id) => {
  return request.patch(`/user-management/${id}/reset-password`)
}

// 禁用用户
export const disableUserService = (id) => {
  return request.patch(`/user-management/${id}/disable`)
}

// 启用用户
export const enableUserService = (id) => {
  return request.patch(`/user-management/${id}/enable`)
}

// 删除用户
export const deleteUserService = (id) => {
  return request.delete(`/user-management/${id}`)
}
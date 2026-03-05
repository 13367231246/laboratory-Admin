import request from '@/utils/request'

// 用户登录
export const userLoginService = (data) => {
  return request.post('/admin/login', data)
}


// 修改用户密码
export const changePasswordService = ({ oldPassword, newPassword,confirmPassword }) => {
  return request.patch('/admin/updatePwd', {
    oldPassword,
    newPassword,
    confirmPassword
  })
  
}

// 获取用户信息
export const getAdminInfoService = () => {
  return request.get('/admin/adminInfo')
}


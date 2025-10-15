// 个人信息相关API模拟

// 模拟用户信息数据
const mockUserData = {
  id: 1,
  username: 'admin',
  nickname: '管理员',
  phone: '13800138000',
  email: 'admin@example.com',
  gender: 1, // 1: 男, 2: 女, 0: 保密
  avatar: '',
  createTime: new Date('2024-01-01')
}

// 模拟API延迟
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// 获取用户信息
export const getUserInfo = async () => {
  await delay(500) // 模拟网络延迟
  return {
    success: true,
    data: mockUserData
  }
}

// 更新用户信息
export const updateUserInfo = async (userData) => {
  await delay(800) // 模拟网络延迟

  // 模拟更新用户信息
  Object.assign(mockUserData, userData)

  return {
    success: true,
    message: '用户信息更新成功',
    data: mockUserData
  }
}

// 上传头像
export const uploadAvatar = async (file) => {
  await delay(1000) // 模拟上传延迟

  // 模拟文件上传，返回图片URL
  const avatarUrl = URL.createObjectURL(file)

  return {
    success: true,
    message: '头像上传成功',
    data: {
      avatar: avatarUrl
    }
  }
}

// 修改密码
export const changePassword = async (passwordData) => {
  await delay(600) // 模拟网络延迟

  const { currentPassword, newPassword } = passwordData

  // 模拟密码验证
  if (currentPassword !== '123456') {
    return {
      success: false,
      message: '当前密码错误'
    }
  }

  return {
    success: true,
    message: '密码修改成功'
  }
}

// 验证手机号
export const validatePhone = async (phone) => {
  await delay(300)

  const phoneRegex = /^1[3-9]\d{9}$/
  return {
    success: phoneRegex.test(phone),
    message: phoneRegex.test(phone) ? '手机号格式正确' : '手机号格式错误'
  }
}

// 验证邮箱
export const validateEmail = async (email) => {
  await delay(300)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return {
    success: emailRegex.test(email),
    message: emailRegex.test(email) ? '邮箱格式正确' : '邮箱格式错误'
  }
}

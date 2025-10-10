import request from '@/utils/request'

// 获取验证码
export function requestCode(data) {
  return request({
    url: '/auth/captcha',
    method: 'get',
    data
  })
}

export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

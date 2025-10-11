// 模拟实验室管理系统假数据

// 用户数据
export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    nickname: '管理员',
    avatar: '',
    role: 'admin',
    department: '实验室管理部'
  },
  {
    id: 2,
    username: 'teacher1',
    nickname: '张老师',
    avatar: '',
    role: 'teacher',
    department: '化学实验室'
  },
  {
    id: 3,
    username: 'student1',
    nickname: '李同学',
    avatar: '',
    role: 'student',
    department: '物理实验室'
  }
]

// 实验室数据
export const mockLaboratories = [
  {
    id: 1,
    name: '化学实验室A',
    location: '教学楼101',
    capacity: 30,
    equipment: ['显微镜', '离心机', '电子天平'],
    status: 'available',
    description: '主要用于化学实验教学'
  },
  {
    id: 2,
    name: '物理实验室B',
    location: '教学楼201',
    capacity: 25,
    equipment: ['示波器', '万用表', '信号发生器'],
    status: 'maintenance',
    description: '主要用于物理实验教学'
  },
  {
    id: 3,
    name: '生物实验室C',
    location: '教学楼301',
    capacity: 20,
    equipment: ['显微镜', '培养箱', '离心机'],
    status: 'available',
    description: '主要用于生物实验教学'
  }
]

// 预约数据
export const mockAppointments = [
  {
    id: 1,
    userId: 2,
    laboratoryId: 1,
    date: '2024-01-15',
    startTime: '09:00',
    endTime: '11:00',
    purpose: '化学实验教学',
    status: 'confirmed',
    studentCount: 25
  },
  {
    id: 2,
    userId: 3,
    laboratoryId: 2,
    date: '2024-01-16',
    startTime: '14:00',
    endTime: '16:00',
    purpose: '物理实验研究',
    status: 'pending',
    studentCount: 15
  },
  {
    id: 3,
    userId: 2,
    laboratoryId: 3,
    date: '2024-01-17',
    startTime: '10:00',
    endTime: '12:00',
    purpose: '生物实验教学',
    status: 'confirmed',
    studentCount: 20
  }
]

// 设备数据
export const mockEquipment = [
  {
    id: 1,
    name: '电子显微镜',
    type: '光学设备',
    laboratoryId: 1,
    status: 'working',
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-04-10'
  },
  {
    id: 2,
    name: '高速离心机',
    type: '分离设备',
    laboratoryId: 1,
    status: 'maintenance',
    lastMaintenance: '2024-01-12',
    nextMaintenance: '2024-02-12'
  },
  {
    id: 3,
    name: '数字示波器',
    type: '测量设备',
    laboratoryId: 2,
    status: 'working',
    lastMaintenance: '2024-01-08',
    nextMaintenance: '2024-04-08'
  }
]

// 统计数据
export const mockStatistics = {
  totalLaboratories: 3,
  totalUsers: 3,
  totalAppointments: 3,
  totalEquipment: 3,
  todayAppointments: 1,
  availableLaboratories: 2,
  maintenanceEquipment: 1
}

// 模拟API调用函数
export const mockApi = {
  // 获取用户列表
  getUsers: () => Promise.resolve({ code: 200, data: mockUsers }),

  // 获取实验室列表
  getLaboratories: () => Promise.resolve({ code: 200, data: mockLaboratories }),

  // 获取预约列表
  getAppointments: () => Promise.resolve({ code: 200, data: mockAppointments }),

  // 获取设备列表
  getEquipment: () => Promise.resolve({ code: 200, data: mockEquipment }),

  // 获取统计数据
  getStatistics: () => Promise.resolve({ code: 200, data: mockStatistics }),

  // 创建预约
  createAppointment: (data) =>
    Promise.resolve({
      code: 200,
      data: { id: Date.now(), ...data, status: 'pending' }
    }),

  // 更新预约状态
  updateAppointmentStatus: (id, status) =>
    Promise.resolve({
      code: 200,
      data: { id, status }
    }),

  // 删除预约
  deleteAppointment: (id) =>
    Promise.resolve({
      code: 200,
      message: '删除成功'
    })
}

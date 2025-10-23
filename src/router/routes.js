export const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      hidden: true
    }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/layouts/index.vue'),
    redirect: '/dashboard',
    meta: {
      title: '首页',
      icon: 'dashboard-outlined',
      singleLevel: true
    },
    children: [
      {
        path: 'dashboard',
        name: 'DashboardPage',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '首页',
          icon: 'dashboard-outlined'
        }
      }
    ]
  },
  {
    path: '/user-management',
    name: 'UserManagement',
    component: () => import('@/layouts/index.vue'),
    meta: {
      title: '用户管理',
      icon: 'user-outlined'
    },
    children: [
      {
        path: '/user-management/students',
        name: 'StudentManagement',
        component: () => import('@/views/user-management/students/index.vue'),
        meta: {
          title: '学生管理',
          icon: 'team-outlined'
        }
      },
      {
        path: '/user-management/teachers',
        name: 'TeacherManagement',
        component: () => import('@/views/user-management/teachers/index.vue'),
        meta: {
          title: '教师管理',
          icon: 'user-outlined'
        }
      }
    ]
  },
  {
    path: '/laboratory-management',
    name: 'LaboratoryManagement',
    component: () => import('@/layouts/index.vue'),
    meta: {
      title: '实验室管理',
      icon: 'home-outlined'
    },
    children: [
      {
        path: '/laboratory-management/laboratories',
        name: 'LaboratoryList',
        component: () => import('@/views/laboratory-management/laboratories/index.vue'),
        meta: {
          title: '实验室列表',
          icon: 'bank-outlined'
        }
      },
      {
        path: '/laboratory-management/equipment',
        name: 'EquipmentManagement',
        component: () => import('@/views/laboratory-management/equipment/index.vue'),
        meta: {
          title: '设备管理',
          icon: 'tool-outlined'
        }
      }
    ]
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: () => import('@/layouts/index.vue'),
    meta: {
      title: '维护管理',
      icon: 'setting-outlined'
    },
    children: [
      {
        path: '/maintenance/lab-maintenance',
        name: 'LabMaintenance',
        component: () => import('@/views/maintenance/lab-maintenance/index.vue'),
        meta: {
          title: '实验室维护',
          icon: 'home-outlined'
        }
      },
      {
        path: '/maintenance/equipment-maintenance',
        name: 'EquipmentMaintenance',
        component: () => import('@/views/maintenance/equipment-maintenance/index.vue'),
        meta: {
          title: '设备维护',
          icon: 'tool-outlined'
        }
      }
    ]
  },
  {
    path: '/process-management',
    name: 'ProcessManagement',
    component: () => import('@/layouts/index.vue'),
    meta: {
      title: '流程管理',
      icon: 'file-text-outlined'
    },
    children: [
      {
        path: '/process-management/protocols',
        name: 'ProtocolManagement',
        component: () => import('@/views/process-management/protocols/index.vue'),
        meta: {
          title: '协议管理',
          icon: 'file-protect-outlined'
        }
      },
      {
        path: '/process-management/feedback',
        name: 'FeedbackManagement',
        component: () => import('@/views/process-management/feedback/index.vue'),
        meta: {
          title: '反馈处理',
          icon: 'message-outlined'
        }
      },
      {
        path: '/process-management/schedule',
        name: 'ScheduleManagement',
        component: () => import('@/views/process-management/schedule/index.vue'),
        meta: {
          title: '时间调整',
          icon: 'clock-circle-outlined'
        }
      }
    ]
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('@/layouts/index.vue'),
    meta: {
      title: '个人中心',
      icon: 'user-outlined',
      hidden: true
    },
    children: [
      {
        path: '/user/profile',
        name: 'UserProfile',
        component: () => import('@/views/profile/index.vue'),
        meta: {
          title: '个人信息',
          icon: 'user-outlined'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: {
      hidden: true
    }
  }
]

export default routes

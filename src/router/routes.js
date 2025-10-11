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
        path: '/user-management/accounts',
        name: 'AccountManagement',
        component: () => import('@/views/user-management/accounts.vue'),
        meta: {
          title: '账号管理',
          icon: 'team-outlined'
        }
      },
      {
        path: '/user-management/roles',
        name: 'RoleManagement',
        component: () => import('@/views/user-management/roles.vue'),
        meta: {
          title: '角色分配',
          icon: 'safety-certificate-outlined'
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
        component: () => import('@/views/laboratory-management/laboratories.vue'),
        meta: {
          title: '实验室列表',
          icon: 'bank-outlined'
        }
      },
      {
        path: '/laboratory-management/equipment',
        name: 'EquipmentManagement',
        component: () => import('@/views/laboratory-management/equipment.vue'),
        meta: {
          title: '设备管理',
          icon: 'tool-outlined'
        }
      },
      {
        path: '/laboratory-management/maintenance',
        name: 'MaintenanceManagement',
        component: () => import('@/views/laboratory-management/maintenance.vue'),
        meta: {
          title: '维护管理',
          icon: 'setting-outlined'
        }
      },
      {
        path: '/laboratory-management/import',
        name: 'ImportData',
        component: () => import('@/views/laboratory-management/import.vue'),
        meta: {
          title: '数据导入',
          icon: 'upload-outlined'
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
        component: () => import('@/views/process-management/protocols.vue'),
        meta: {
          title: '协议管理',
          icon: 'file-protect-outlined'
        }
      },
      {
        path: '/process-management/feedback',
        name: 'FeedbackManagement',
        component: () => import('@/views/process-management/feedback.vue'),
        meta: {
          title: '反馈处理',
          icon: 'message-outlined'
        }
      },
      {
        path: '/process-management/schedule',
        name: 'ScheduleManagement',
        component: () => import('@/views/process-management/schedule.vue'),
        meta: {
          title: '时间调整',
          icon: 'clock-circle-outlined'
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

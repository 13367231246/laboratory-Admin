import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import App from './App.vue'
import router from './router'
import 'ant-design-vue/dist/reset.css'
import { registerGlobalComponents } from './utils/autoRegister'
import pinia from './stores' // 导入配置好的 pinia 实例
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(Antd)

// 设置 dayjs 全局中文（影响日历等日期组件的语言）
dayjs.locale('zh-cn')

// 注册全局组件
registerGlobalComponents(app)

app.mount('#app')

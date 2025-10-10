import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import App from './App.vue'
import router from './router'
import 'ant-design-vue/dist/reset.css'
import { registerGlobalComponents } from './utils/autoRegister'
import pinia from './stores' // 导入配置好的 pinia 实例

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(Antd)

// 注册全局组件
registerGlobalComponents(app)

app.mount('#app')

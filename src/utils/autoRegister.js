// 自动注册 components 目录下的所有组件
import { defineAsyncComponent } from 'vue'
import * as Icons from '@ant-design/icons-vue'

export function registerGlobalComponents(app) {
  // 使用 Vite 的 import.meta.glob 获取所有组件
  const components = import.meta.glob('@/components/**/*.vue', { eager: true })

  // 遍历并注册每个组件
  Object.entries(components).forEach(([path, module]) => {
    // 获取组件名称 (去掉路径和文件扩展名)
    const componentName = path
      .split('/')
      .pop()
      .replace(/\.\w+$/, '')

    // 确保组件有默认导出
    const component = module.default || module

    // 注册组件，使用 defineAsyncComponent 包装
    app.component(
      componentName,
      defineAsyncComponent(() => Promise.resolve(component))
    )
  })

  // 注册所有图标组件
  for (const [key, component] of Object.entries(Icons)) {
    // 只注册实际的图标组件
    if (key.endsWith('Outlined') || key.endsWith('Filled') || key.endsWith('TwoTone')) {
      app.component(key, component)
    }
  }
}

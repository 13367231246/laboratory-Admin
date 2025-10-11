// 自动注册 components 目录下的所有组件
import { defineAsyncComponent } from 'vue'
import * as Icons from '@ant-design/icons-vue'

export function registerGlobalComponents(app) {
  // 使用 Vite 的 import.meta.glob 获取所有组件
  const components = import.meta.glob('@/components/**/*.vue', { eager: true })
  const registeredComponents = new Set()

  // 遍历并注册每个组件
  Object.entries(components).forEach(([path, module]) => {
    // 获取组件名称 (去掉路径和文件扩展名)
    const fileName = path
      .split('/')
      .pop()
      .replace(/\.\w+$/, '')

    // 确保组件有默认导出
    const component = module.default || module

    // 如果组件定义了 name 选项，使用它，否则跳过 index 文件
    const componentName = component.name || (fileName === 'index' ? null : fileName)

    // 如果没有有效的组件名，跳过注册
    if (!componentName) {
      return
    }

    // 将 PascalCase 转换为 kebab-case
    const kebabName = componentName
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '')

    // 注册 kebab-case 版本
    app.component(
      kebabName,
      defineAsyncComponent(() => Promise.resolve(component))
    )

    // 也注册 PascalCase 版本
    app.component(
      componentName,
      defineAsyncComponent(() => Promise.resolve(component))
    )

    // 记录已注册的组件
    registeredComponents.add(componentName)
    registeredComponents.add(kebabName)
  })

  // 注册所有图标组件
  for (const [key, component] of Object.entries(Icons)) {
    // 只注册实际的图标组件
    if (key.endsWith('Outlined') || key.endsWith('Filled') || key.endsWith('TwoTone')) {
      app.component(key, component)
    }
  }
}

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'
import VueSetupExtend from 'vite-plugin-vue-setup-extend'

// 配置函数现在接收 mode 参数，用于加载对应环境的变量
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())

  // 从环境变量中获取API地址，移除 /api 前缀

  return {
    plugins: [
      vue(),
      // API 自动导入
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'src/auto-imports.d.ts'
      }),
      // 组件自动导入
      Components({
        resolvers: [
          AntDesignVueResolver({
            importStyle: false // 不自动导入样式
          })
        ],
        dts: 'src/components.d.ts'
      }),
      VueSetupExtend()
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      port: 3000,
      // 开发服务器代理配置
      proxy: {
        // 将所有 /api 开头的请求代理到 VITE_API_BASE_URL
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true, // 必须设置为 true，表示允许跨域
          ws: true, // 代理 websocket
          rewrite: (path) => path.replace(/^\/api/, '') // 重写路径，去掉 /api 前缀
        }
      }
    }
  }
})

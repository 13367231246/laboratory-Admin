import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export const setupStore = (app) => {
  app.use(pinia)
}

export const store = pinia
export default pinia

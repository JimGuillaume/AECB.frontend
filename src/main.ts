import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import 'icofont/dist/icofont.min.css'
import { useAuthStore } from '@/stores/auth.store'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

//Initialisation obligée de pinia
// l'app n'étant pas encore mount
const authStore = useAuthStore(pinia)
await authStore.initialize()

app.use(router)
app.mount('#app')
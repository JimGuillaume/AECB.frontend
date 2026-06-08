import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/LoginView.vue'
import Dashboard from '../views/DashboardView.vue'
import Overtime from '../views/OvertimeView.vue'
import Teams from '../views/TeamView.vue'
import Workers from '../views/WorkerView.vue'
import Settings from '../views/SettingView.vue'
import { requireAuth } from '../services/auth.service'

const routes = [
  { path: '/', name: 'AECB - Connexion', component: Login },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },

  {
    path: '/overtime',
    name: 'Heures supplémentaires',
    component: Overtime,
    meta : { requireAuth: true}
  },

  {
    path: '/teams',
    name: 'Equipes',
    component: Teams,
    meta : { requireAuth: true}
  },

  {
    path: '/workers',
    name: 'Employés',
    component: Workers,
    meta : { requireAuth: true}
  },

  {
    path: '/settings',
    name: 'Configuration',
    component: Settings,
    meta : { requireAuth: true}
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const user = await requireAuth()

  if (to.path === '/' && user) {
    return '/dashboard'
  }

  if (!to.meta.requiresAuth) {
    return true
  }

  if (user) {
    return true
  }

  return { path: '/', query: { redirect: to.fullPath } }
})

export default router
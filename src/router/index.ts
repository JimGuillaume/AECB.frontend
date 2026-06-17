import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/LoginView.vue'
import Dashboard from '../views/DashboardView.vue'
import Overtime from '../views/OvertimeView.vue'
import Teams from '../views/TeamView.vue'
import Workers from '../views/WorkerView.vue'
import WorkerDetail from '../views/WorkerDetailView.vue'
import Settings from '../views/SettingView.vue'
import { requireAuth } from '../services/auth.service'
import type { UserSession } from '../types/auth'

type Role = UserSession['role']

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
    meta: { requiresAuth: true },
  },
  {
    path: '/teams',
    name: 'Equipes',
    component: Teams,
    meta: { requiresAuth: true, requiredRoles: ['team_leader', 'manager', 'admin'] satisfies Role[] },
  },
  {
    path: '/workers',
    name: 'Employés',
    component: Workers,
    meta: { requiresAuth: true, requiredRoles: ['team_leader', 'manager', 'admin'] satisfies Role[] },
  },
  {
    path: '/workers/:id',
    name: 'Détail Employé',
    component: WorkerDetail,
    meta: { requiresAuth: true, requiredRoles: ['team_leader', 'manager', 'admin'] satisfies Role[] },
  },
  {
    path: '/settings',
    name: 'Configuration',
    component: Settings,
    meta: { requiresAuth: true },
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

  if (!user) {
    return { path: '/', query: { redirect: to.fullPath } }
  }

  const requiredRoles = to.meta.requiredRoles as Role[] | undefined
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return '/dashboard'
  }

  return true
})

export default router
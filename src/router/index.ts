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
    //S'assure que l'utilisateur ait les bons rôles pour accéder aux pages suivantes
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

  //Si l'utilisateur est connecté -> Redirige vers dashboard si il essaye d'accéder
  //au login
  if (to.path === '/' && user) {
    return '/dashboard'
  }

  if (!to.meta.requiresAuth) {
    return true
  }

  if (!user) {
    return { path: '/', query: { redirect: to.fullPath } }
  }

  //Si l'utilisateur essaye de changer l'url manuellement et qu'il n'a pas les accès
  //renvoie au dashboard au lieu de lancer une 403 - pas autorisé
  const requiredRoles = to.meta.requiredRoles as Role[] | undefined
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return '/dashboard'
  }

  return true
})

export default router
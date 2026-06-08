<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

type Role = 'worker' | 'chef' | 'manager' | 'admin'

const authStore = useAuthStore()
const router = useRouter()

const roleRank: Record<Role, number> = {
  worker: 0,
  chef: 1,
  manager: 2,
  admin: 3,
}

const currentRole = computed(() => authStore.role as Role | null)
const currentRank = computed(() => {
  if (!currentRole.value) return -1
  return roleRank[currentRole.value]
})

const canAccess = (minRole: Role) => currentRank.value >= roleRank[minRole]

async function handleLogout() {
  await authStore.logout()
  await router.push('/')
}

const menu = [
  { label: 'Dashboard', to: '/', minRole: 'worker' as const },
  { label: 'Overtime', to: '/overtime', minRole: 'worker' as const },
  { label: 'Teams', to: '/teams', minRole: 'chef' as const },
  { label: 'Workers', to: '/workers', minRole: 'chef' as const },
  { label: 'Codes', to: '/codes', minRole: 'manager' as const },
]
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__brand">AECB</div>

    <nav class="sidebar__nav">
      <RouterLink
        v-for="item in menu"
        :key="item.to"
        v-show="canAccess(item.minRole)"
        :to="item.to"
        class="sidebar__link"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <button class="sidebar__logout" type="button" @click="handleLogout">
      Logout
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  min-height: 100vh;
  padding: 20px;
  background: #111827;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.sidebar__brand {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 24px;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar__logout {
  margin-top: auto;
  padding: 10px 12px;
  border: 0;
  border-radius: 10px;
  background: #7f1d1d;
  color: #fff;
  cursor: pointer;
  text-align: left;
}

.sidebar__logout:hover {
  background: #991b1b;
}

.sidebar__link {
  padding: 10px 12px;
  border-radius: 10px;
  color: #d1d5db;
  text-decoration: none;
}

.sidebar__link.router-link-active {
  background: #1f2937;
  color: #fff;
}
</style>
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

type Role = 'worker' | 'team_leader' | 'manager' | 'admin'

const authStore = useAuthStore()
const router = useRouter()

const props = defineProps<{ open?: boolean }>()
const emit = defineEmits<{ close: [] }>()

const roleRank: Record<Role, number> = {
  worker: 0,
  team_leader: 1,
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
  { label: 'Teams', to: '/teams', minRole: 'team_leader' as const },
  { label: 'Workers', to: '/workers', minRole: 'team_leader' as const },
  { label: 'Paramètres', to: '/settings', minRole: 'manager' as const },
]
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-300 w-60 p-5 bg-gray-900 text-white flex flex-col transition-transform duration-300 md:static md:translate-x-0 md:min-h-screen"
    :class="props.open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex items-center justify-between mb-6">
      <div class="text-xl font-bold">AECB</div>
      <button
        class="md:hidden text-gray-400 hover:text-white text-xl border-0 bg-transparent cursor-pointer leading-none"
        type="button"
        @click="emit('close')"
      >
        ✕
      </button>
    </div>

    <nav class="flex flex-col gap-2">
      <RouterLink
        v-for="item in menu"
        :key="item.to"
        v-show="canAccess(item.minRole)"
        :to="item.to"
        class="px-3 py-2.5 rounded-[10px] text-gray-300 no-underline"
        active-class="bg-gray-800 !text-white"
        @click="emit('close')"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <button
      class="mt-auto px-3 py-2.5 border-0 rounded-[10px] bg-red-900 text-white cursor-pointer text-left hover:bg-red-800 transition-colors"
      type="button"
      @click="handleLogout"
    >
      Logout
    </button>
  </aside>
</template>

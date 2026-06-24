<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { HotTable } from '@handsontable/vue3'
import { registerAllModules } from 'handsontable/registry'
import 'handsontable/styles/handsontable.min.css'
import 'handsontable/styles/ht-theme-main.min.css'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useAuthStore } from '@/stores/auth.store'
import { get } from '@/services/api'
import { useAsync } from '@/composables/useAsync'
import type { User } from '@/types/user'
import type { Team } from '@/types/team'

registerAllModules()

const authStore = useAuthStore()
const router = useRouter()

const workers = ref<User[]>([])
const teamGroups = ref<Array<{ team: Team; members: User[] }>>([])
const { loading, error, run } = useAsync(true)

const isTeamLeader = computed(() => authStore.role === 'team_leader')
const isAdminOrManager = computed(() => authStore.role === 'admin' || authStore.role === 'manager')
const teamIds = computed(() => authStore.user?.team_ids ?? [])

onMounted(() => run(async () => {
  if (isTeamLeader.value && teamIds.value.length) {
    workers.value = (await get(`/teams/get_team_users.php?team_ids=${teamIds.value.join(',')}`)) as User[]
  } else if (isAdminOrManager.value) {
    const teams = (await get('/teams/get_teams.php')) as Team[]
    teamGroups.value = await Promise.all(
      teams.map(async (team) => ({
        team,
        members: (await get(`/teams/get_team_users.php?team_ids=${team.id}`)) as User[],
      }))
    )
  } else {
    workers.value = (await get('/users/get_users.php')) as User[]
  }
}))

function goToWorker(id: number) {
  router.push(`/workers/${id}`)
}

function buildWorkerSettings(members: User[]) {
  return {
    data: members.map(m => ({
      first_name: m.first_name,
      last_name: m.last_name,
      email: m.email,
      role: m.role ? m.role.charAt(0).toUpperCase() + m.role.slice(1) : '',
    })),
    colHeaders: ['Prénom', 'Nom', 'Email', 'Rôle'],
    columns: [
      { data: 'first_name', readOnly: true },
      { data: 'last_name', readOnly: true },
      { data: 'email', readOnly: true },
      { data: 'role', readOnly: true },
    ],
    rowHeaders: false,
    stretchH: 'all' as const,
    height: 'auto' as const,
    licenseKey: 'non-commercial-and-evaluation',
    afterOnCellMouseDown(_e: MouseEvent, coords: { row: number }) {
      if (coords.row < 0) return
      const worker = members[coords.row]
      if (worker) goToWorker(worker.id)
    },
  }
}

const workersSettings = computed(() => buildWorkerSettings(workers.value))
</script>

<template>
  <AppLayout>
    <div class="p-8 flex flex-col gap-6">
      <h1 class="m-0 text-[1.75rem] text-gray-900">Travailleurs</h1>

      <p v-if="error" class="m-0 px-5 py-4.5 rounded-2xl bg-red-50 border border-red-200 text-red-800">
        {{ error }}
      </p>

      <p v-else-if="loading" class="m-0 text-gray-500">Chargement…</p>

      <!-- Grouped by team — admins and managers -->
      <template v-else-if="isAdminOrManager">
        <div v-for="group in teamGroups" :key="group.team.id">
          <div class="w-full rounded-xl overflow-hidden border border-gray-200 shadow-[0_4px_12px_rgba(17,24,39,0.06)]">
            <div class="px-4 py-3 bg-white border-b border-gray-200">
              <h2 class="m-0 text-sm font-semibold text-gray-700">{{ group.team.name }}</h2>
            </div>
            <div v-if="!group.members.length" class="px-4 py-6 text-center text-sm text-gray-400">
              Aucun travailleur dans cette équipe
            </div>
            <div v-else class="workers-table">
              <HotTable v-bind="buildWorkerSettings(group.members)" />
            </div>
          </div>
        </div>
      </template>

      <!-- Flat list — team leaders and others -->
      <div v-else class="w-full rounded-xl overflow-hidden border border-gray-200 shadow-[0_4px_12px_rgba(17,24,39,0.06)]">
        <div v-if="!workers.length" class="px-4 py-6 text-center text-sm text-gray-400">
          Aucun travailleur trouvé
        </div>
        <div v-else class="workers-table">
          <HotTable v-bind="workersSettings" />
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.workers-table :deep(.htCore td) {
  cursor: pointer;
}
.workers-table :deep(.htCore tbody tr:hover td) {
  background-color: #eff6ff;
}
</style>

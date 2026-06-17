<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useAuthStore } from '@/stores/auth.store'
import { get } from '@/services/api'
import type { User } from '@/types/user'

const authStore = useAuthStore()
const router = useRouter()

const data = ref<User[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const isTeamLeader = computed(() => authStore.role === 'team_leader')
const teamIds = computed(() => authStore.user?.team_ids ?? [])

onMounted(async () => {
  try {
    if (isTeamLeader.value && teamIds.value.length) {
      data.value = (await get(`/teams/get_team_users.php?team_ids=${teamIds.value.join(',')}`)) as User[]
    } else {
      data.value = (await get('/users/get_users.php')) as User[]
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function goToWorker(id: number) {
  router.push(`/workers/${id}`)
}
</script>

<template>
  <AppLayout>
    <div class="p-8 flex flex-col gap-6">
      <h1 class="m-0 text-[1.75rem] text-gray-900">Travailleurs</h1>

      <p v-if="error" class="m-0 px-5 py-4.5 rounded-2xl bg-red-50 border border-red-200 text-red-800">
        {{ error }}
      </p>

      <p v-else-if="loading" class="m-0 text-gray-500">Chargement…</p>

      <div v-else class="w-full rounded-xl overflow-hidden border border-gray-200 shadow-[0_4px_12px_rgba(17,24,39,0.06)]">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-gray-50">
              <th class="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Prénom</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Nom</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Email</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Rôle</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!data.length">
              <td colspan="4" class="px-4 py-6 text-center text-gray-400">Aucun travailleur trouvé</td>
            </tr>
            <tr
              v-for="worker in data"
              :key="worker.id"
              class="border-b border-gray-100 last:border-0 cursor-pointer hover:bg-blue-50 transition-colors"
              @click="goToWorker(worker.id)"
            >
              <td class="px-4 py-3 text-gray-800">{{ worker.first_name }}</td>
              <td class="px-4 py-3 text-gray-800">{{ worker.last_name }}</td>
              <td class="px-4 py-3 text-gray-600">{{ worker.email }}</td>
              <td class="px-4 py-3 text-gray-600 capitalize">{{ worker.role }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>

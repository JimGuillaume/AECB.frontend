<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Chart } from 'chart.js/auto'
import AppLayout from '@/components/layout/AppLayout.vue'
import PeriodSelector from '@/components/layout/PeriodSelector.vue'
import AttendanceCodeBadge from '@/components/attendance/AttendanceCodeBadge.vue'
import { useAuthStore } from '@/stores/auth.store'
import { get } from '@/services/api'
import type { AttendanceRecord } from '@/types/auth'
import type { User } from '@/types/user'

interface OvertimeRow {
  user_id: number
  month: number
  year: number
  hours_earned: number
  hours_used: number
  balance: number
}

const authStore = useAuthStore()
const teamIds = computed(() => authStore.user?.team_ids ?? [])
const teamIdsParam = computed(() => teamIds.value.join(','))

const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth() + 1)
const view = ref<'tableau' | 'graphe'>('tableau')

const loading = ref(false)
const error = ref<string | null>(null)
const members = ref<User[]>([])
const prestations = ref<AttendanceRecord[]>([])

const overtimeLoading = ref(false)
const overtimeData = ref<Record<number, OvertimeRow[]>>({})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const MONTH_FULL = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

const daysInMonth = computed(() => new Date(year.value, month.value, 0).getDate())
const dayNumbers = computed(() => Array.from({ length: daysInMonth.value }, (_, i) => i + 1))

const prestationsByUserDate = computed(() => {
  const map = new Map<string, AttendanceRecord>()
  for (const p of prestations.value) {
    map.set(`${p.user_id}:${p.attendance_date}`, p)
  }
  return map
})

function isoDate(day: number) {
  return `${year.value}-${String(month.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getCell(userId: number, day: number): AttendanceRecord | undefined {
  return prestationsByUserDate.value.get(`${userId}:${isoDate(day)}`)
}

async function loadAttendance() {
  if (!teamIdsParam.value) return
  loading.value = true
  error.value = null
  try {
    const [usersRes, attendanceRes] = await Promise.all([
      get(`/teams/get_team_users.php?team_ids=${teamIdsParam.value}`) as Promise<User[]>,
      get(`/teams/get_team_attendance.php?team_ids=${teamIdsParam.value}&year=${year.value}&month=${month.value}`) as Promise<{ prestations: AttendanceRecord[] }>,
    ])
    members.value = usersRes
    prestations.value = attendanceRes.prestations ?? []
  } catch (e: any) {
    error.value = e?.message ?? 'Erreur de chargement'
  } finally {
    loading.value = false
  }
}

async function loadOvertime() {
  if (!members.value.length) return
  overtimeLoading.value = true
  try {
    const results = await Promise.all(
      members.value.map(m =>
        (get(`/overtime/get_overtime_year.php?user_id=${m.id}&year=${year.value}`) as Promise<{ months: OvertimeRow[] }>)
          .then(r => ({ userId: m.id, months: r.months }))
          .catch(() => ({ userId: m.id, months: [] }))
      )
    )
    const map: Record<number, OvertimeRow[]> = {}
    for (const r of results) map[r.userId] = r.months
    overtimeData.value = map
  } finally {
    overtimeLoading.value = false
  }
}

function totalOvertimeForUser(userId: number) {
  return (overtimeData.value[userId] ?? []).reduce((acc, r) => acc + (r.hours_earned ?? 0), 0)
}

function renderChart() {
  if (!chartCanvas.value || !members.value.length) return
  const labels = members.value.map(m => `${m.first_name} ${m.last_name}`)
  const hoursWorked = members.value.map(m =>
    prestations.value
      .filter(p => p.user_id === m.id && p.code_key === 'P')
      .reduce((acc, p) => acc + (p.hours_value ?? 0), 0)
  )
  const data = {
    labels,
    datasets: [{ label: 'Heures prestées', data: hoursWorked, backgroundColor: 'rgba(59,130,246,0.7)', borderRadius: 4 }],
  }
  if (chart) { chart.data = data; chart.update(); return }
  chart = new Chart(chartCanvas.value, {
    type: 'bar',
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: { y: { beginAtZero: true, title: { display: true, text: 'Heures' } } },
    },
  })
}

onMounted(async () => {
  await loadAttendance()
  await loadOvertime()
})

watch([year, month], async () => {
  chart?.destroy(); chart = null
  await loadAttendance()
  await loadOvertime()
  if (view.value === 'graphe') setTimeout(renderChart, 50)
})

watch(view, v => {
  if (v === 'graphe') setTimeout(renderChart, 50)
  else { chart?.destroy(); chart = null }
})

onUnmounted(() => chart?.destroy())

const monthLabel = computed(() =>
  new Intl.DateTimeFormat('fr-BE', { month: 'long', year: 'numeric' })
    .format(new Date(year.value, month.value - 1, 1))
)
</script>

<template>
  <AppLayout>
    <div class="flex flex-col gap-5">
      <PeriodSelector
        v-model:year="year"
        v-model:month="month"
        label="Mon équipe"
        title="Prestations de l'équipe"
        :description="`Vue mensuelle — ${monthLabel}`"
      />

      <p v-if="error" class="m-0 px-5 py-4.5 rounded-2xl bg-red-50 border border-red-200 text-red-800">
        {{ error }}
      </p>

      <!-- Attendance section -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-[0_4px_12px_rgba(17,24,39,0.06)]">
        <div class="flex border-b border-gray-200">
          <button
            v-for="tab in (['tableau', 'graphe'] as const)"
            :key="tab"
            class="px-5 py-3 text-sm font-medium border-0 bg-transparent cursor-pointer transition-colors"
            :class="view === tab ? 'text-blue-600 border-b-2 border-blue-600 -mb-px' : 'text-gray-500 hover:text-gray-800'"
            @click="view = tab"
          >
            {{ tab === 'tableau' ? 'Tableau' : 'Graphe' }}
          </button>
        </div>

        <div class="p-6">
          <p v-if="loading" class="text-center text-gray-500 py-8 m-0">Chargement…</p>

          <!-- TABLE VIEW -->
          <div v-else-if="view === 'tableau'" class="overflow-x-auto">
            <table class="w-full text-sm border-collapse min-w-max">
              <thead>
                <tr>
                  <th class="text-left px-3 py-2 bg-gray-50 border border-gray-200 font-semibold text-gray-700 sticky left-0 z-10 min-w-36">
                    Travailleur
                  </th>
                  <th
                    v-for="day in dayNumbers" :key="day"
                    class="px-2 py-2 bg-gray-50 border border-gray-200 font-semibold text-gray-500 text-center min-w-10"
                  >
                    {{ day }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!members.length">
                  <td colspan="32" class="px-3 py-6 text-center text-gray-400">Aucun membre trouvé</td>
                </tr>
                <tr v-for="member in members" :key="member.id">
                  <td class="px-3 py-2 border border-gray-200 bg-white sticky left-0 z-10 font-medium text-gray-800 whitespace-nowrap">
                    {{ member.first_name }} {{ member.last_name }}
                  </td>
                  <td
                    v-for="day in dayNumbers" :key="day"
                    class="px-1 py-1 border border-gray-200 text-center"
                  >
                    <AttendanceCodeBadge
                      v-if="getCell(member.id, day)"
                      :code="getCell(member.id, day)!.code_key ?? ''"
                      size="sm"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- GRAPH VIEW -->
          <div v-else style="height: 320px;">
            <canvas ref="chartCanvas" />
          </div>
        </div>
      </div>

      <!-- Overtime section -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-[0_4px_12px_rgba(17,24,39,0.06)] p-6">
        <h2 class="m-0 mb-4 text-lg font-semibold text-gray-900">Heures supplémentaires — {{ year }}</h2>
        <p v-if="overtimeLoading" class="text-gray-500 text-sm m-0">Chargement…</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm border-collapse min-w-max">
            <thead>
              <tr>
                <th class="text-left px-3 py-2 bg-gray-50 border border-gray-200 font-semibold text-gray-700 sticky left-0 min-w-36">
                  Travailleur
                </th>
                <th
                  v-for="m in MONTH_FULL" :key="m"
                  class="px-2 py-2 bg-gray-50 border border-gray-200 font-semibold text-gray-500 text-center min-w-14"
                >
                  {{ m.slice(0, 3) }}
                </th>
                <th class="px-3 py-2 bg-gray-50 border border-gray-200 font-semibold text-gray-700 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!members.length">
                <td colspan="14" class="px-3 py-6 text-center text-gray-400">Aucun membre trouvé</td>
              </tr>
              <tr v-for="member in members" :key="member.id">
                <td class="px-3 py-2 border border-gray-200 bg-white sticky left-0 font-medium text-gray-800 whitespace-nowrap">
                  {{ member.first_name }} {{ member.last_name }}
                </td>
                <td
                  v-for="(_, idx) in MONTH_FULL" :key="idx"
                  class="px-2 py-2 border border-gray-200 text-center text-gray-700"
                >
                  {{ (overtimeData[member.id]?.[idx]?.hours_earned ?? 0).toFixed(1) }}
                </td>
                <td class="px-3 py-2 border border-gray-200 text-right font-semibold text-gray-800">
                  {{ totalOvertimeForUser(member.id).toFixed(1) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </AppLayout>
</template>

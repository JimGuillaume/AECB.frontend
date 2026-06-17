<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import PeriodSelector from '@/components/layout/PeriodSelector.vue'
import MonthlyAttendanceGrid from '@/components/attendance/MonthlyAttendanceGrid.vue'
import { useAuthStore } from '@/stores/auth.store'
import { get, post, put, del } from '@/services/api'
import { useDatePeriod } from '@/composables/useDatePeriod'
import { useAsync } from '@/composables/useAsync'
import { useChart } from '@/composables/useChart'
import type { AttendanceRecord } from '@/types/auth'
import type { User } from '@/types/user'

interface AttendanceCode { code_id: number; code_name: string; description: string; worked: boolean }
interface OvertimeRow { user_id: number; month: number; year: number; hours_earned: number; hours_used: number; balance: number }

const route = useRoute()
const authStore = useAuthStore()

const workerId = computed(() => Number(route.params.id))
const isTeamLeader = computed(() => authStore.role === 'team_leader')

const { year, month } = useDatePeriod()
const { loading, error, run } = useAsync(true)
const { loading: overtimeLoading, run: runOvertime } = useAsync()
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const { render, destroy: destroyChart } = useChart(chartCanvas, 'bar', {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' } },
  scales: { y: { beginAtZero: true, title: { display: true, text: 'Heures' } } },
})

const worker = ref<User | null>(null)
const prestations = ref<AttendanceRecord[]>([])
const overtimeData = ref<OvertimeRow[]>([])
const codes = ref<AttendanceCode[]>([])

// Edit modal
const modalOpen = ref(false)
const modalDate = ref('')
const modalExisting = ref<AttendanceRecord[]>([])
const modalCodeId = ref<number | null>(null)
const modalHours = ref<number>(8)
const modalNotes = ref('')
const modalSaving = ref(false)
const modalError = ref<string | null>(null)

const MONTH_SHORT = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

async function loadWorker() {
  await run(async () => {
    const res = (await get(`/users/get_user.php?id=${workerId.value}&year=${year.value}&month=${month.value}`)) as { user: User; prestations: AttendanceRecord[]; team_ids: number[] }
    worker.value = { ...res.user, team_ids: res.team_ids ?? [] }
    prestations.value = res.prestations ?? []
  })
}

async function loadOvertime() {
  overtimeData.value = []
  await runOvertime(async () => {
    const res = (await get(`/overtime/get_overtime_year.php?user_id=${workerId.value}&year=${year.value}`)) as { months: OvertimeRow[] }
    overtimeData.value = res.months ?? []
  })
}

async function loadCodes() {
  if (codes.value.length) return
  try {
    codes.value = (await get('/attendance/get_codes.php')) as AttendanceCode[]
  } catch { /* codes not critical */ }
}

function renderChart() {
  if (!overtimeData.value.length) return
  render({
    labels: MONTH_SHORT,
    datasets: [{
      label: 'Heures supplémentaires',
      data: overtimeData.value.map(r => r.hours_earned),
      backgroundColor: 'rgba(59,130,246,0.7)',
      borderRadius: 4,
    }],
  })
}

onMounted(async () => {
  await Promise.all([loadWorker(), loadCodes()])
  await loadOvertime()
  renderChart()
})

watch([year, month], async () => {
  await loadWorker()
})

watch(year, async () => {
  destroyChart()
  await loadOvertime()
  renderChart()
})

// Edit modal logic
function openModal(date: string, existing: AttendanceRecord[]) {
  modalDate.value = date
  modalExisting.value = existing
  const first = existing[0]
  modalCodeId.value = first?.code_id ?? (codes.value[0]?.code_id ?? null)
  modalHours.value = first?.hours_value ?? 8
  modalNotes.value = first?.notes ?? ''
  modalError.value = null
  modalOpen.value = true
}

function closeModal() { modalOpen.value = false }

async function saveAttendance() {
  if (!modalCodeId.value) return
  modalSaving.value = true
  modalError.value = null
  try {
    if (modalExisting.value.length) {
      const id = modalExisting.value[0].attendance_id!
      await put(`/attendance/update_attendance.php?id=${id}`, {
        code_id: modalCodeId.value,
        hours_value: modalHours.value,
        notes: modalNotes.value || null,
      })
    } else {
      const teamId = worker.value?.team_ids?.[0] ?? null
      await post('/attendance/post_attendance.php', {
        user_id: workerId.value,
        team_id: teamId,
        attendance_date: modalDate.value,
        code_id: modalCodeId.value,
        hours_value: modalHours.value,
        notes: modalNotes.value || null,
      })
    }
    closeModal()
    await loadWorker()
  } catch (e: any) {
    modalError.value = e?.message ?? 'Erreur lors de la sauvegarde'
  } finally {
    modalSaving.value = false
  }
}

async function deleteAttendance() {
  if (!modalExisting.value.length) return
  modalSaving.value = true
  modalError.value = null
  try {
    const id = modalExisting.value[0].attendance_id!
    await del(`/attendance/delete_attendance.php?id=${id}`)
    closeModal()
    await loadWorker()
  } catch (e: any) {
    modalError.value = e?.message ?? 'Erreur lors de la suppression'
  } finally {
    modalSaving.value = false
  }
}

const workerFullName = computed(() =>
  worker.value ? `${worker.value.first_name} ${worker.value.last_name}` : '…'
)

const modalDateLabel = computed(() =>
  modalDate.value
    ? new Intl.DateTimeFormat('fr-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        .format(new Date(modalDate.value + 'T00:00:00'))
    : ''
)
</script>

<template>
  <AppLayout>
    <div class="flex flex-col gap-5">

      <PeriodSelector
        v-model:year="year"
        v-model:month="month"
        :label="workerFullName"
        title="Prestations du travailleur"
        :description="`${worker?.role ?? ''} — vue mensuelle`"
      />

      <p v-if="error" class="m-0 px-5 py-4.5 rounded-2xl bg-red-50 border border-red-200 text-red-800">
        {{ error }}
      </p>

      <p v-else-if="loading" class="m-0 px-5 py-4.5 rounded-2xl bg-white border border-gray-200 text-gray-700">
        Chargement…
      </p>

      <MonthlyAttendanceGrid
        v-else
        :year="year"
        :month="month"
        :prestations="prestations"
        :editable="isTeamLeader"
        @click-day="openModal"
      />

      <!-- Overtime chart -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-[0_4px_12px_rgba(17,24,39,0.06)] p-6">
        <h2 class="m-0 mb-4 text-lg font-semibold text-gray-900">Heures supplémentaires — {{ year }}</h2>
        <p v-if="overtimeLoading" class="text-gray-500 text-sm m-0">Chargement…</p>
        <div v-else style="height: 260px;">
          <canvas ref="chartCanvas" />
        </div>
      </div>

    </div>

    <!-- Edit modal -->
    <Teleport to="body">
      <div
        v-if="modalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 flex flex-col gap-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="m-0 text-xs uppercase tracking-widest text-gray-500 mb-1">{{ workerFullName }}</p>
              <h2 class="m-0 text-xl font-bold text-gray-900 capitalize">{{ modalDateLabel }}</h2>
            </div>
            <button
              class="text-gray-400 hover:text-gray-600 text-xl border-0 bg-transparent cursor-pointer leading-none"
              @click="closeModal"
            >✕</button>
          </div>

          <p v-if="modalError" class="m-0 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {{ modalError }}
          </p>

          <div class="flex flex-col gap-3">
            <label class="flex flex-col gap-1.5">
              <span class="text-sm font-medium text-gray-700">Code de prestation</span>
              <select
                v-model="modalCodeId"
                class="px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option v-for="c in codes" :key="c.code_id" :value="c.code_id">
                  {{ c.code_name }} — {{ c.description }}
                </option>
              </select>
            </label>

            <label class="flex flex-col gap-1.5">
              <span class="text-sm font-medium text-gray-700">Heures</span>
              <input
                v-model.number="modalHours"
                type="number"
                step="0.5"
                min="0"
                max="24"
                class="px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label class="flex flex-col gap-1.5">
              <span class="text-sm font-medium text-gray-700">Notes <span class="text-gray-400 font-normal">(optionnel)</span></span>
              <input
                v-model="modalNotes"
                type="text"
                class="px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>

          <div class="flex gap-2 pt-1">
            <button
              class="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium border-0 cursor-pointer hover:bg-blue-700 disabled:opacity-50 transition-colors"
              :disabled="modalSaving || !modalCodeId"
              @click="saveAttendance"
            >
              {{ modalSaving ? 'Sauvegarde…' : modalExisting.length ? 'Modifier' : 'Ajouter' }}
            </button>
            <button
              v-if="modalExisting.length"
              class="px-4 py-2.5 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-200 cursor-pointer hover:bg-red-100 disabled:opacity-50 transition-colors"
              :disabled="modalSaving"
              @click="deleteAttendance"
            >
              Supprimer
            </button>
            <button
              class="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium border-0 cursor-pointer hover:bg-gray-200 transition-colors"
              @click="closeModal"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>

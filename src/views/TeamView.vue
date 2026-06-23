<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { HotTable } from '@handsontable/vue3'
import { registerAllModules } from 'handsontable/registry'
import 'handsontable/styles/handsontable.min.css'
import 'handsontable/styles/ht-theme-main.min.css'
import AppLayout from '@/components/layout/AppLayout.vue'
import PeriodSelector from '@/components/layout/PeriodSelector.vue'
import { useAuthStore } from '@/stores/auth.store'
import { get, post, put, del } from '@/services/api'
import { useDatePeriod } from '@/composables/useDatePeriod'
import { useAsync } from '@/composables/useAsync'
import { useAttendanceCodes } from '@/composables/useAttendanceCodes'
import type { AttendanceRecord } from '@/types/auth'
import type { User } from '@/types/user'

registerAllModules()

interface Team { id: number; name: string }
interface OvertimeRow { user_id: number; month: number; year: number; hours_earned: number; hours_used: number; balance: number }
interface AttendanceCode { code_id: number; code_name: string; description: string; worked: boolean }
interface WorkerSchedule { schedule_id: number; name: string; fraction: number; daily_hours: number }

const authStore = useAuthStore()
const { year, month, monthLabel } = useDatePeriod()
const { loading, error, run } = useAsync()
const { getColor } = useAttendanceCodes()

const isManagerOrAdmin = computed(() => ['manager', 'admin'].includes(authStore.role ?? ''))
const leaderTeamIds = computed(() => authStore.user?.team_ids ?? [])

// All teams (fetched once for name display and manager/admin selector)
const allTeams = ref<Team[]>([])
// Teams the manager/admin has toggled on
const selectedTeamIds = ref<number[]>([])

// IDs to load data for (all relevant teams based on role)
const loadableTeamIds = computed(() =>
  isManagerOrAdmin.value ? allTeams.value.map(t => t.id) : leaderTeamIds.value
)

// IDs to actually display as cards (respects manager/admin filter)
const displayTeamIds = computed(() =>
  isManagerOrAdmin.value
    ? (selectedTeamIds.value.length ? selectedTeamIds.value : allTeams.value.map(t => t.id))
    : leaderTeamIds.value
)

function teamName(tid: number): string {
  return allTeams.value.find(t => t.id === tid)?.name ?? `Équipe ${tid}`
}

function selectTeam(value: string) {
  selectedTeamIds.value = value ? [+value] : allTeams.value.map(t => t.id)
}

// Per-team data
const membersByTeam = ref<Record<number, User[]>>({})
const attendanceByTeam = ref<Record<number, AttendanceRecord[]>>({})
const overtimeData = ref<Record<number, OvertimeRow[]>>({})
const overtimeLoading = ref(false)

const codes = ref<AttendanceCode[]>([])
const schedules = ref<WorkerSchedule[]>([])

// --- Modal state ---
const modalOpen = ref(false)
const modalMember = ref<User | null>(null)
const modalTeamId = ref<number | null>(null)
const modalDate = ref('')
const modalExisting = ref<AttendanceRecord[]>([])
const modalCodeId = ref<number | null>(null)
const modalHours = ref<number>(8)
const modalNotes = ref('')
const modalSaving = ref(false)
const modalError = ref<string | null>(null)

const MONTH_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

const daysInMonth = computed(() => new Date(year.value, month.value, 0).getDate())
const dayNumbers = computed(() => Array.from({ length: daysInMonth.value }, (_, i) => i + 1))

function isoDate(day: number) {
  return `${year.value}-${String(month.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// --- Modal helpers ---
const modalDateLabel = computed(() =>
  modalDate.value
    ? new Intl.DateTimeFormat('fr-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        .format(new Date(modalDate.value + 'T00:00:00'))
    : ''
)

const modalMemberName = computed(() =>
  modalMember.value ? `${modalMember.value.first_name} ${modalMember.value.last_name}` : ''
)

function openModal(tid: number, member: User, day: number) {
  const date = isoDate(day)
  const existing = (attendanceByTeam.value[tid] ?? []).filter(
    p => p.user_id === member.id && p.attendance_date === date
  )
  const first = existing[0]
  modalMember.value = member
  modalTeamId.value = tid
  modalDate.value = date
  modalExisting.value = existing
  modalCodeId.value = first?.code_id ?? codes.value[0]?.code_id ?? null
  modalHours.value = first?.hours_value ?? schedules.value[0]?.daily_hours ?? 8
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
      await put(`/attendance/update_attendance.php?id=${modalExisting.value[0]!.attendance_id}`, {
        code_id: modalCodeId.value,
        hours_value: modalHours.value,
        notes: modalNotes.value || null,
      })
    } else {
      await post('/attendance/post_attendance.php', {
        user_id: modalMember.value!.id,
        team_id: modalTeamId.value,
        attendance_date: modalDate.value,
        code_id: modalCodeId.value,
        hours_value: modalHours.value,
        notes: modalNotes.value || null,
      })
    }
    closeModal()
    await loadData()
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
    await del(`/attendance/delete_attendance.php?id=${modalExisting.value[0]!.attendance_id}`)
    closeModal()
    await loadData()
  } catch (e: any) {
    modalError.value = e?.message ?? 'Erreur lors de la suppression'
  } finally {
    modalSaving.value = false
  }
}

// --- HotTable renderers ---
function codeRenderer(_hot: unknown, TD: HTMLTableCellElement, _r: number, _c: number, _prop: string | number, value: unknown) {
  const code = String(value ?? '')
  if (code) {
    const color = getColor(code)
    TD.innerHTML = `<span style="display:inline-block;padding:2px 6px;border-radius:9999px;background:${color};color:white;font-size:0.75rem;font-weight:600">${code}</span>`
  } else {
    TD.innerHTML = '<span style="color:#d1d5db">—</span>'
  }
  return TD
}

function workerNameRenderer(_hot: unknown, TD: HTMLTableCellElement, _r: number, _c: number, _prop: string | number, value: unknown) {
  TD.innerHTML = `<span style="cursor:pointer;color:#2563eb;font-weight:500">${value ?? ''}</span>`
  return TD
}

// --- Attendance HotTable settings per team ---
const attendanceColHeaders = computed(() => ['Travailleur', ...dayNumbers.value.map(String)])

function buildAttendanceSettings(tid: number) {
  const members = membersByTeam.value[tid] ?? []
  const byUserDate = new Map<string, string>()
  for (const p of attendanceByTeam.value[tid] ?? []) {
    byUserDate.set(`${p.user_id}:${p.attendance_date}`, p.code_key ?? '')
  }
  const data = members.map(m => {
    const row: Record<string, unknown> = { travailleur: `${m.first_name} ${m.last_name}` }
    for (const d of dayNumbers.value) row[String(d)] = byUserDate.get(`${m.id}:${isoDate(d)}`) ?? ''
    return row
  })
  const cols = [
    { data: 'travailleur', readOnly: true, width: 150, renderer: workerNameRenderer },
    ...dayNumbers.value.map(d => ({ data: String(d), readOnly: true, renderer: codeRenderer, width: 38 })),
  ]
  return {
    data,
    colHeaders: attendanceColHeaders.value,
    columns: cols,
    rowHeaders: false,
    readOnly: true,
    stretchH: 'none' as const,
    height: 'auto' as const,
    licenseKey: 'non-commercial-and-evaluation',
    afterOnCellMouseDown(_e: MouseEvent, coords: { row: number; col: number }) {
      if (coords.row < 0 || coords.col < 1) return
      const member = (membersByTeam.value[tid] ?? [])[coords.row]
      const day = dayNumbers.value[coords.col - 1]
      if (member && day) openModal(tid, member, day)
    },
  }
}

// --- Overtime HotTable config ---
const overtimeColHeaders = ['Travailleur', ...MONTH_SHORT, 'Total']
const overtimeCols = [
  { data: 'travailleur', readOnly: true, width: 150 },
  ...MONTH_SHORT.map(s => ({ data: s, readOnly: true, width: 50 })),
  { data: 'Total', readOnly: true, width: 60 },
]

function buildOvertimeData(tid: number): Record<string, unknown>[] {
  return (membersByTeam.value[tid] ?? []).map(m => {
    const row: Record<string, unknown> = { travailleur: `${m.first_name} ${m.last_name}` }
    const months = overtimeData.value[m.id] ?? []
    let total = 0
    MONTH_SHORT.forEach((short, idx) => {
      const earned = months.find(r => r.month === idx + 1)?.hours_earned ?? 0
      row[short] = earned.toFixed(1)
      total += earned
    })
    row['Total'] = total.toFixed(1)
    return row
  })
}

// --- Data loading ---
async function loadAllTeams() {
  try {
    allTeams.value = (await get('/teams/get_teams.php')) as Team[]
    if (isManagerOrAdmin.value) {
      selectedTeamIds.value = allTeams.value.map(t => t.id)
    }
  } catch { /* non-critical */ }
}

async function loadData() {
  const ids = loadableTeamIds.value
  if (!ids.length) return

  await run(async () => {
    const results = await Promise.all(
      ids.map(async tid => {
        const [usersRes, attendanceRes] = await Promise.all([
          get(`/teams/get_team_users.php?team_ids=${tid}`) as Promise<User[]>,
          get(`/teams/get_team_attendance.php?team_ids=${tid}&year=${year.value}&month=${month.value}`) as Promise<{ prestations: AttendanceRecord[] }>,
        ])
        let members: User[] = usersRes
        if (!isManagerOrAdmin.value) {
          const leader = authStore.user!
          if (!usersRes.some(u => u.id === leader.id)) {
            members = [{ id: leader.id, first_name: leader.first_name, last_name: leader.last_name, email: leader.email, role: leader.role }, ...usersRes]
          }
        }
        return { tid, members, prestations: attendanceRes.prestations ?? [] }
      })
    )
    const newMembers: Record<number, User[]> = {}
    const newAttendance: Record<number, AttendanceRecord[]> = {}
    for (const r of results) {
      newMembers[r.tid] = r.members
      newAttendance[r.tid] = r.prestations
    }
    membersByTeam.value = newMembers
    attendanceByTeam.value = newAttendance
  })

  await loadOvertime()
}

async function loadOvertime() {
  const uniqueIds = [...new Set(Object.values(membersByTeam.value).flat().map(m => m.id))]
  if (!uniqueIds.length) return
  overtimeLoading.value = true
  try {
    const results = await Promise.all(
      uniqueIds.map(uid =>
        (get(`/overtime/get_overtime_year.php?user_id=${uid}&year=${year.value}`) as Promise<{ months: OvertimeRow[] }>)
          .then(r => ({ uid, months: r.months }))
          .catch(() => ({ uid, months: [] as OvertimeRow[] }))
      )
    )
    const map: Record<number, OvertimeRow[]> = {}
    for (const r of results) map[r.uid] = r.months
    overtimeData.value = map
  } finally {
    overtimeLoading.value = false
  }
}

async function loadCodes() {
  if (codes.value.length) return
  try { codes.value = (await get('/attendance/get_codes.php')) as AttendanceCode[] } catch { /* non-critical */ }
}

async function loadSchedules() {
  if (schedules.value.length) return
  try { schedules.value = (await get('/schedules/get_schedules.php')) as WorkerSchedule[] } catch { /* non-critical */ }
}

onMounted(async () => {
  await Promise.all([loadAllTeams(), loadCodes(), loadSchedules()])
  await loadData()
})

watch([year, month], loadData)
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
      >
        <label v-if="isManagerOrAdmin && allTeams.length" class="flex flex-col gap-2 min-w-35 text-[0.85rem] text-gray-300">
          <span>Équipe</span>
          <select
            class="px-3 py-2.5 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(156,155,155,0.384)] text-white font-[inherit] focus:outline-none focus:border-[rgba(255,255,255,0.35)] focus:shadow-[0_0_0_4px_rgba(255,255,255,0.08)]"
            :value="selectedTeamIds.length === 1 ? selectedTeamIds[0] : ''"
            @change="selectTeam(($event.target as HTMLSelectElement).value)"
          >
            <option value="">Toutes les équipes</option>
            <option v-for="team in allTeams" :key="team.id" :value="team.id">{{ team.name }}</option>
          </select>
        </label>
      </PeriodSelector>

      <p v-if="error" class="m-0 px-5 py-4.5 rounded-2xl bg-red-50 border border-red-200 text-red-800">
        {{ error }}
      </p>

      <template v-for="tid in displayTeamIds" :key="tid">
        <!-- Attendance card -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-[0_4px_12px_rgba(17,24,39,0.06)]">
          <div class="px-6 pt-5 pb-4 border-b border-gray-200">
            <h2 class="m-0 text-lg font-semibold text-gray-900">{{ teamName(tid) }} — Prestations {{ monthLabel }}</h2>
          </div>
          <div class="p-4">
            <p v-if="loading" class="text-center text-gray-500 py-8 m-0">Chargement…</p>
            <HotTable
              v-else
              :key="`attendance-${tid}-${year}-${month}`"
              v-bind="buildAttendanceSettings(tid)"
            />
          </div>
        </div>

        <!-- Overtime card -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-[0_4px_12px_rgba(17,24,39,0.06)]">
          <div class="px-6 pt-5 pb-4 border-b border-gray-200">
            <h2 class="m-0 text-lg font-semibold text-gray-900">{{ teamName(tid) }} — Heures supplémentaires {{ year }}</h2>
          </div>
          <div class="p-4">
            <p v-if="overtimeLoading" class="text-center text-gray-500 py-8 m-0">Chargement…</p>
            <HotTable
              v-else
              :key="`overtime-${tid}-${year}`"
              :data="buildOvertimeData(tid)"
              :col-headers="overtimeColHeaders"
              :columns="overtimeCols"
              :row-headers="false"
              :read-only="true"
              stretch-h="all"
              height="auto"
              license-key="non-commercial-and-evaluation"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- Attendance edit modal -->
    <Teleport to="body">
      <div
        v-if="modalOpen"
        class="fixed inset-0 z-250 flex items-center justify-center bg-black/40"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 flex flex-col gap-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="m-0 text-xs uppercase tracking-widest text-gray-500 mb-1">{{ modalMemberName }}</p>
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
              <select
                v-model.number="modalHours"
                class="px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option v-for="s in schedules" :key="s.schedule_id" :value="s.daily_hours">
                  {{ s.name }} — {{ s.daily_hours }}h
                </option>
              </select>
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

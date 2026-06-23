<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { del, get, post, put } from '@/services/api'
import type { AttendanceCode } from '@/types/codes'
import type { WorkSchedule } from '@/types/schedule'

const codes = ref<AttendanceCode[]>([])
const schedules = ref<WorkSchedule[]>([])
const loading = ref(true)
const error = ref('')

const codeModal = reactive({
  show: false,
  mode: 'create' as 'create' | 'edit',
  id: null as number | null,
  code_name: '',
  description: '',
  worked: false,
  saving: false,
  error: '',
})

const scheduleModal = reactive({
  show: false,
  mode: 'create' as 'create' | 'edit',
  id: null as number | null,
  name: '',
  fraction: 1,
  daily_hours: 8,
  saving: false,
  error: '',
})

async function loadData() {
  try {
    ;[codes.value, schedules.value] = (await Promise.all([
      get('/attendance/get_codes.php'),
      get('/schedules/get_schedules.php'),
    ])) as [AttendanceCode[], WorkSchedule[]]
  } catch {
    error.value = 'Erreur lors du chargement des données'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

// ── Code modal ────────────────────────────────────────────────────────────────

function openCreateCode() {
  Object.assign(codeModal, { show: true, mode: 'create', id: null, code_name: '', description: '', worked: false, saving: false, error: '' })
}

function openEditCode(c: AttendanceCode) {
  Object.assign(codeModal, { show: true, mode: 'edit', id: c.code_id, code_name: c.code_name, description: c.description, worked: c.worked, saving: false, error: '' })
}

async function saveCode() {
  if (!codeModal.code_name.trim()) {
    codeModal.error = 'Le nom du code est requis'
    return
  }
  codeModal.saving = true
  codeModal.error = ''
  try {
    const body = { code_name: codeModal.code_name.trim(), description: codeModal.description.trim(), worked: codeModal.worked }
    if (codeModal.mode === 'create') {
      const created = (await post('/codes/post_code.php', body)) as AttendanceCode
      codes.value.push(created)
    } else {
      const updated = (await put(`/codes/update_code.php?id=${codeModal.id}`, body)) as AttendanceCode
      const idx = codes.value.findIndex((c) => c.code_id === codeModal.id)
      if (idx !== -1) codes.value[idx] = updated
    }
    codeModal.show = false
  } catch {
    codeModal.error = 'Une erreur est survenue'
  } finally {
    codeModal.saving = false
  }
}

async function deleteCode(id: number) {
  if (!confirm('Supprimer ce code de travail ?')) return
  try {
    await del(`/codes/delete_code.php?id=${id}`)
    codes.value = codes.value.filter((c) => c.code_id !== id)
  } catch {
    error.value = 'Impossible de supprimer ce code'
  }
}

// ── Schedule modal ────────────────────────────────────────────────────────────

function openCreateSchedule() {
  Object.assign(scheduleModal, { show: true, mode: 'create', id: null, name: '', fraction: 1, daily_hours: 8, saving: false, error: '' })
}

function openEditSchedule(s: WorkSchedule) {
  Object.assign(scheduleModal, { show: true, mode: 'edit', id: s.schedule_id, name: s.name, fraction: s.fraction, daily_hours: s.daily_hours, saving: false, error: '' })
}

async function saveSchedule() {
  if (!scheduleModal.name.trim()) {
    scheduleModal.error = 'Le nom du planning est requis'
    return
  }
  scheduleModal.saving = true
  scheduleModal.error = ''
  try {
    const body = { name: scheduleModal.name.trim(), fraction: scheduleModal.fraction, daily_hours: scheduleModal.daily_hours }
    if (scheduleModal.mode === 'create') {
      const created = (await post('/schedules/post_schedule.php', body)) as WorkSchedule
      schedules.value.push(created)
    } else {
      const updated = (await put(`/schedules/update_schedule.php?id=${scheduleModal.id}`, body)) as WorkSchedule
      const idx = schedules.value.findIndex((s) => s.schedule_id === scheduleModal.id)
      if (idx !== -1) schedules.value[idx] = updated
    }
    scheduleModal.show = false
  } catch {
    scheduleModal.error = 'Une erreur est survenue'
  } finally {
    scheduleModal.saving = false
  }
}

async function deleteSchedule(id: number) {
  if (!confirm('Supprimer ce planning de travail ?')) return
  try {
    await del(`/schedules/delete_schedule.php?id=${id}`)
    schedules.value = schedules.value.filter((s) => s.schedule_id !== id)
  } catch {
    error.value = 'Impossible de supprimer ce planning'
  }
}
</script>

<template>
  <AppLayout>
    <div class="p-8 flex flex-col gap-8">
      <h1 class="m-0 text-[1.75rem] text-gray-900">Paramètres</h1>

      <p v-if="error" class="m-0 px-5 py-4.5 rounded-2xl bg-red-50 border border-red-200 text-red-800">
        {{ error }}
      </p>

      <p v-if="loading" class="m-0 text-gray-500">Chargement…</p>

      <template v-else>
        <!-- ── Work Codes ──────────────────────────────────────────────────── -->
        <section class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <h2 class="m-0 text-base font-semibold text-gray-700">Codes de travail</h2>
            <button
              class="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              @click="openCreateCode"
            >
              + Ajouter
            </button>
          </div>

          <div class="w-full rounded-xl overflow-hidden border border-gray-200 shadow-[0_4px_12px_rgba(17,24,39,0.06)]">
            <table class="w-full text-sm border-collapse">
              <thead>
                <tr class="bg-gray-50">
                  <th class="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Code</th>
                  <th class="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Description</th>
                  <th class="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Compté travaillé</th>
                  <th class="text-right px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!codes.length">
                  <td colspan="4" class="px-4 py-6 text-center text-gray-400">Aucun code trouvé</td>
                </tr>
                <tr
                  v-for="code in codes"
                  :key="code.code_id"
                  class="border-b border-gray-100 last:border-0"
                >
                  <td class="px-4 py-3 text-gray-800 font-medium">{{ code.code_name }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ code.description }}</td>
                  <td class="px-4 py-3">
                    <span
                      class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="code.worked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                    >
                      {{ code.worked ? 'Oui' : 'Non' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right space-x-2">
                    <button
                      class="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      @click="openEditCode(code)"
                    >
                      Modifier
                    </button>
                    <button
                      class="px-2.5 py-1 text-xs font-medium rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                      @click="deleteCode(code.code_id)"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ── Work Schedules ─────────────────────────────────────────────── -->
        <section class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <h2 class="m-0 text-base font-semibold text-gray-700">Plannings de travail</h2>
            <button
              class="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              @click="openCreateSchedule"
            >
              + Ajouter
            </button>
          </div>

          <div class="w-full rounded-xl overflow-hidden border border-gray-200 shadow-[0_4px_12px_rgba(17,24,39,0.06)]">
            <table class="w-full text-sm border-collapse">
              <thead>
                <tr class="bg-gray-50">
                  <th class="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Nom</th>
                  <th class="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Fraction</th>
                  <th class="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Heures / jour</th>
                  <th class="text-right px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!schedules.length">
                  <td colspan="4" class="px-4 py-6 text-center text-gray-400">Aucun planning trouvé</td>
                </tr>
                <tr
                  v-for="schedule in schedules"
                  :key="schedule.schedule_id"
                  class="border-b border-gray-100 last:border-0"
                >
                  <td class="px-4 py-3 text-gray-800 font-medium">{{ schedule.name }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ schedule.fraction }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ schedule.daily_hours }}h</td>
                  <td class="px-4 py-3 text-right space-x-2">
                    <button
                      class="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      @click="openEditSchedule(schedule)"
                    >
                      Modifier
                    </button>
                    <button
                      class="px-2.5 py-1 text-xs font-medium rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                      @click="deleteSchedule(schedule.schedule_id)"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>

    <!-- ── Code modal ──────────────────────────────────────────────────────── -->
    <Teleport to="body">
      <div
        v-if="codeModal.show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @click.self="codeModal.show = false"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-4">
          <h3 class="m-0 text-base font-semibold text-gray-900">
            {{ codeModal.mode === 'create' ? 'Nouveau code' : 'Modifier le code' }}
          </h3>

          <p v-if="codeModal.error" class="m-0 text-sm text-red-600">{{ codeModal.error }}</p>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Nom du code <span class="text-red-500">*</span></label>
            <input
              v-model="codeModal.code_name"
              type="text"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ex. P"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Description</label>
            <input
              v-model="codeModal.description"
              type="text"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ex. Présence"
            />
          </div>

          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="codeModal.worked" type="checkbox" class="w-4 h-4 rounded accent-blue-600" />
            <span class="text-sm text-gray-700">Compté comme travaillé</span>
          </label>

          <div class="flex justify-end gap-2 pt-2">
            <button
              class="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              @click="codeModal.show = false"
            >
              Annuler
            </button>
            <button
              class="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              :disabled="codeModal.saving"
              @click="saveCode"
            >
              {{ codeModal.saving ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Schedule modal ─────────────────────────────────────────────────── -->
    <Teleport to="body">
      <div
        v-if="scheduleModal.show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @click.self="scheduleModal.show = false"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-4">
          <h3 class="m-0 text-base font-semibold text-gray-900">
            {{ scheduleModal.mode === 'create' ? 'Nouveau planning' : 'Modifier le planning' }}
          </h3>

          <p v-if="scheduleModal.error" class="m-0 text-sm text-red-600">{{ scheduleModal.error }}</p>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Nom <span class="text-red-500">*</span></label>
            <input
              v-model="scheduleModal.name"
              type="text"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ex. Temps plein"
            />
          </div>

          <div class="flex gap-3">
            <div class="flex flex-col gap-1 flex-1">
              <label class="text-sm font-medium text-gray-700">Fraction</label>
              <input
                v-model.number="scheduleModal.fraction"
                type="number"
                step="0.1"
                min="0.1"
                max="1"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="flex flex-col gap-1 flex-1">
              <label class="text-sm font-medium text-gray-700">Heures / jour</label>
              <input
                v-model.number="scheduleModal.daily_hours"
                type="number"
                step="0.5"
                min="0.5"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              class="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              @click="scheduleModal.show = false"
            >
              Annuler
            </button>
            <button
              class="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              :disabled="scheduleModal.saving"
              @click="saveSchedule"
            >
              {{ scheduleModal.saving ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>

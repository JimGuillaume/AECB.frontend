<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import MonthlyAttendanceGrid from '@/components/attendance/MonthlyAttendanceGrid.vue'
import { fetchCurrentProfile } from '@/services/auth.service'
import type { AttendanceRecord } from '@/types/auth'

const loading = ref(true)
const errorMessage = ref('')
const prestations = ref<AttendanceRecord[]>([])

const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth() + 1)
const currentYear = today.getFullYear()

const monthOptions = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' },
]

const yearOptions = computed(() => {
  const startYear = currentYear - 5
  return Array.from({ length: currentYear - startYear + 1 }, (_, index) => currentYear - index)
})

const monthLabel = computed(() => {
  return new Intl.DateTimeFormat('fr-BE', { month: 'long', year: 'numeric' }).format(
    new Date(year.value, month.value - 1, 1),
  )
})

async function loadProfile() {
  loading.value = true
  errorMessage.value = ''

  try {
    const profile = await fetchCurrentProfile(year.value, month.value)

    if (!profile) {
      throw new Error('Impossible de charger les prestations du mois')
    }

    year.value = profile.period.year
    month.value = profile.period.month
    prestations.value = profile.prestations ?? []
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erreur de chargement'
  } finally {
    loading.value = false
  }
}

onMounted(loadProfile)

watch([year, month], async ([newYear, newMonth], [oldYear, oldMonth]) => {
  if (newYear === oldYear && newMonth === oldMonth) {
    return
  }

  await loadProfile()
})
</script>

<template>
  <AppLayout>
    <div class="flex flex-col gap-5">
      <section class="flex items-end justify-between gap-4 p-6 rounded-3xl bg-[linear-gradient(135deg,#111827_0%,#1f2937_100%)] text-gray-50 shadow-[0_20px_50px_rgba(17,24,39,0.18)]">
        <div>
          <p class="m-0 mb-2 uppercase tracking-[0.12em] text-[0.75rem] text-gray-400">Tableau de bord</p>
          <h1 class="m-0 text-[clamp(1.6rem,3vw,2.4rem)]">Prestations du mois en cours</h1>
          <p class="mt-2.5 mb-0 text-gray-300">
            Vue mensuelle pour {{ monthLabel }}
          </p>
        </div>

        <div class="flex gap-3 flex-wrap">
          <label class="flex flex-col gap-2 min-w-35 text-[0.85rem] text-gray-300">
            <span>Mois</span>
            <select
              v-model.number="month"
              class="px-3 py-2.5 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(156,155,155,0.384)] text-white font-[inherit] focus:outline-none focus:border-[rgba(255,255,255,0.35)] focus:shadow-[0_0_0_4px_rgba(255,255,255,0.08)]"
            >
              <option v-for="option in monthOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>

          <label class="flex flex-col gap-2 min-w-35 text-[0.85rem] text-gray-300">
            <span>Année</span>
            <select
              v-model.number="year"
              class="px-3 py-2.5 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(156,155,155,0.384)] text-white font-[inherit] focus:outline-none focus:border-[rgba(255,255,255,0.35)] focus:shadow-[0_0_0_4px_rgba(255,255,255,0.08)]"
            >
              <option v-for="option in yearOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </label>
        </div>
      </section>

      <p v-if="errorMessage" class="m-0 px-5 py-4.5 rounded-2xl bg-red-50 border border-red-200 text-red-800">
        {{ errorMessage }}
      </p>

      <p v-else-if="loading" class="m-0 px-5 py-4.5 rounded-2xl bg-white border border-gray-200 text-gray-700">
        Chargement du calendrier...
      </p>

      <MonthlyAttendanceGrid
        v-else
        :year="year"
        :month="month"
        :prestations="prestations"
      />
    </div>
  </AppLayout>
</template>

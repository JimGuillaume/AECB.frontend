<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import PeriodSelector from '@/components/layout/PeriodSelector.vue'
import MonthlyAttendanceGrid from '@/components/attendance/MonthlyAttendanceGrid.vue'
import { fetchCurrentProfile } from '@/services/auth.service'
import type { AttendanceRecord } from '@/types/auth'

const loading = ref(true)
const errorMessage = ref('')
const prestations = ref<AttendanceRecord[]>([])

const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth() + 1)

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
      <PeriodSelector
        v-model:year="year"
        v-model:month="month"
        label="Tableau de bord"
        title="Prestations du mois en cours"
        :description="`Vue mensuelle pour ${monthLabel}`"
      />

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

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
      <div class="dashboard-shell">
        <section class="dashboard-hero">
          <div>
            <p class="dashboard-hero__eyebrow">Tableau de bord</p>
            <h1 class="dashboard-hero__title">Prestations du mois en cours</h1>
            <p class="dashboard-hero__subtitle">
              Vue mensuelle pour {{ monthLabel }}
            </p>
          </div>

          <div class="dashboard-hero__filters">
            <label class="dashboard-filter">
              <span>Mois</span>
              <select v-model.number="month">
                <option v-for="option in monthOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>

            <label class="dashboard-filter">
              <span>Année</span>
              <select v-model.number="year">
                <option v-for="option in yearOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </label>
          </div>
        </section>

        <p v-if="errorMessage" class="dashboard-state dashboard-state--error">
          {{ errorMessage }}
        </p>

        <p v-else-if="loading" class="dashboard-state">
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

<style scoped>

.dashboard-shell {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-hero {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
  color: #f9fafb;
  box-shadow: 0 20px 50px rgba(17, 24, 39, 0.18);
}

.dashboard-hero__filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.dashboard-filter {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 140px;
  font-size: 0.85rem;
  color: #d1d5db;
}

.dashboard-filter select {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(156, 155, 155, 0.384);
  color: #ffffff;
  font: inherit;
}

.dashboard-filter select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.08);
}

.dashboard-hero__eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  color: #9ca3af;
}

.dashboard-hero__title {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
}

.dashboard-hero__subtitle {
  margin: 10px 0 0;
  color: #d1d5db;
}

.dashboard-state {
  margin: 0;
  padding: 18px 20px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  color: #374151;
}

.dashboard-state--error {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}
</style>
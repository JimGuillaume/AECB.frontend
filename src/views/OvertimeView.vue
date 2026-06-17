<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import PeriodSelector from '@/components/layout/PeriodSelector.vue'
import HandsonTable from '@/components/handson_table/handson_table.vue'
import { useAuthStore } from '@/stores/auth.store'
import { get } from '@/services/api'
import { useDatePeriod } from '@/composables/useDatePeriod'
import { useAsync } from '@/composables/useAsync'
import { useChart } from '@/composables/useChart'

interface OvertimeRow {
  overtime_id: number | null
  user_id: number
  month: number
  year: number
  hours_earned: number
  hours_used: number
  balance: number
  calculated_at: string | null
  updated_at: string | null
}

const { year, month } = useDatePeriod()
const { loading, error, run } = useAsync()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const { render, destroy: destroyChart } = useChart(canvasRef, 'bar', {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' } },
  scales: { y: { beginAtZero: true, title: { display: true, text: 'Heures' } } },
})

const authStore = useAuthStore()
const userId = computed(() => authStore.user?.id)
const overtimeData = ref<OvertimeRow[]>([])

const MONTH_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
const MONTH_FULL  = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

const description = computed(() => `Heures supplémentaires — ${year.value}`)

async function fetchData() {
  if (!userId.value) return
  await run(async () => {
    const res = (await get(
      `/overtime/get_overtime_year.php?user_id=${userId.value}&year=${year.value}`,
    )) as { months: OvertimeRow[] }
    overtimeData.value = res.months
  })
}

function buildChartData() {
  const sel = month.value - 1
  const earnedBg = overtimeData.value.map((_, i) =>
    i === sel ? 'rgba(59,130,246,1)' : 'rgba(59,130,246,0.45)',
  )
  return {
    labels: MONTH_SHORT,
    datasets: [{
      label: 'Heures Supplémentaires',
      data: overtimeData.value.map(r => r.hours_earned),
      backgroundColor: earnedBg,
      borderRadius: 4,
    }],
  }
}

function renderChart() {
  if (overtimeData.value.length === 0) return
  render(buildChartData())
}

const tableData = computed(() =>
  overtimeData.value.map(r => ({
    Mois: MONTH_FULL[r.month - 1],
    'Heures Supplémentaires': r.hours_earned,
  })),
)

onMounted(async () => {
  await fetchData()
  renderChart()
})

watch(year, async () => {
  destroyChart()
  await fetchData()
  renderChart()
})

watch(month, () => {
  if (overtimeData.value.length === 0) return
  render(buildChartData())
})
</script>

<template>
  <AppLayout>
    <div class="flex flex-col gap-5">

      <PeriodSelector
        v-model:year="year"
        v-model:month="month"
        label="Heures supplémentaires"
        title="Overtime de l'année"
        :description="description"
        :show-month="false"
      />

      <p
        v-if="error"
        class="m-0 px-5 py-4.5 rounded-2xl bg-red-50 border border-red-200 text-red-800"
      >
        {{ error }}
      </p>

      <!-- Bar chart -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-[0_4px_12px_rgba(17,24,39,0.06)] p-6">
        <p
          v-if="loading"
          class="text-center text-gray-500 text-[0.95rem] py-8 m-0"
        >
          Chargement…
        </p>
        <div v-else style="height: 320px;">
          <canvas ref="canvasRef" />
        </div>
      </div>

      <!-- Handsontable -->
      <HandsonTable
        :data="tableData"
        :loading="loading"
        :error="error"
      />

    </div>
  </AppLayout>
</template>

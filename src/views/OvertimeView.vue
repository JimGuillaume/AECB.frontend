<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Chart } from 'chart.js/auto'
import AppLayout from '@/components/layout/AppLayout.vue'
import PeriodSelector from '@/components/layout/PeriodSelector.vue'
import HandsonTable from '@/components/handson_table/handson_table.vue'
import { useAuthStore } from '@/stores/auth.store'
import { get } from '@/services/api'

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

const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth() + 1)

const authStore = useAuthStore()
const userId = computed(() => authStore.user?.id)

const loading = ref(false)
const error = ref<string | null>(null)
const overtimeData = ref<OvertimeRow[]>([])

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const MONTH_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
const MONTH_FULL  = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

const description = computed(
  () => `Heures supplémentaires — ${year.value}`,
)

async function fetchData() {
  if (!userId.value) return

  loading.value = true
  error.value = null

  try {
    const res = (await get(
      `/get_overtime_year.php?user_id=${userId.value}&year=${year.value}`,
    )) as { months: OvertimeRow[] }
    overtimeData.value = res.months
  } catch (e: any) {
    error.value = e?.message ?? 'Erreur de chargement'
  } finally {
    loading.value = false
  }
}

function buildChartData() {
  const sel = month.value - 1

  const earnedBg  = overtimeData.value.map((_, i) => i === sel ? 'rgba(59,130,246,1)'   : 'rgba(59,130,246,0.45)')
  const usedBg    = overtimeData.value.map((_, i) => i === sel ? 'rgba(239,68,68,1)'    : 'rgba(239,68,68,0.45)')
  const balanceBg = overtimeData.value.map((_, i) => i === sel ? 'rgba(16,185,129,1)'   : 'rgba(16,185,129,0.45)')

  return {
    labels: MONTH_SHORT,
    datasets: [
      {
        label: 'Heures Supplémentaires',
        data: overtimeData.value.map(r => r.hours_earned),
        backgroundColor: earnedBg,
        borderRadius: 4,
      },
      {
        label: 'Récup',
        data: overtimeData.value.map(r => r.hours_used),
        backgroundColor: usedBg,
        borderRadius: 4,
      },
      {
        label: 'Récup restante',
        data: overtimeData.value.map(r => r.balance),
        backgroundColor: balanceBg,
        borderRadius: 4,
      },
    ],
  }
}

function renderChart() {
  if (!canvasRef.value || overtimeData.value.length === 0) return

  const data = buildChartData()

  if (chart) {
    chart.data = data
    chart.update()
    return
  }

  chart = new Chart(canvasRef.value, {
    type: 'bar',
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Heures' },
        },
      },
    },
  })
}

const tableData = computed(() =>
  overtimeData.value.map(r => ({
    Mois: MONTH_FULL[r.month - 1],
    'Heures Supplémentaires': r.hours_earned,
    Récup: r.hours_used,
    'Récup restante': r.balance,
  })),
)

onMounted(async () => {
  await fetchData()
  renderChart()
})

watch(year, async () => {
  chart?.destroy()
  chart = null
  await fetchData()
  renderChart()
})

watch(month, () => {
  if (!chart || overtimeData.value.length === 0) return
  chart.data = buildChartData()
  chart.update()
})

onUnmounted(() => {
  chart?.destroy()
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

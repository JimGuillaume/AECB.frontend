<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Chart } from 'chart.js/auto'
import type { ChartType, ChartData, ChartOptions } from 'chart.js'
import { get } from '@/services/api'

interface Props {
  type: ChartType
  apiPath: string
  dataTransformer: (apiResponse: any) => ChartData
  options?: ChartOptions
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 600,
  height: 400,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
let chart: Chart | null = null

async function fetchAndRender() {
  if (!canvasRef.value) return

  loading.value = true
  error.value = null

  try {
    const raw = await get(props.apiPath)
    const chartData = props.dataTransformer(raw)

    if (chart) {
      chart.data = chartData
      chart.update()
    } else {
      chart = new Chart(canvasRef.value, {
        type: props.type,
        data: chartData,
        options: props.options,
      })
    }
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to load chart data'
  } finally {
    loading.value = false
  }
}

onMounted(fetchAndRender)

watch(
  () => [props.apiPath, props.type] as const,
  () => {
    chart?.destroy()
    chart = null
    fetchAndRender()
  },
)

onUnmounted(() => {
  chart?.destroy()
})
</script>

<template>
  <div class="relative inline-block">
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-white/60 rounded"
    >
      <span class="text-sm text-gray-500">Loading…</span>
    </div>
    <p v-if="error" class="text-sm text-red-500 px-2 py-1">{{ error }}</p>
    <canvas ref="canvasRef" :width="width" :height="height" />
  </div>
</template>

<style scoped></style>

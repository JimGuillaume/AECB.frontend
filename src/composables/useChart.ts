import { onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { Chart } from 'chart.js/auto'
import type { ChartData, ChartOptions, ChartType } from 'chart.js'

export function useChart(
  canvasRef: Ref<HTMLCanvasElement | null>,
  type: ChartType,
  options?: ChartOptions,
) {
  let chart: Chart | null = null

  function render(data: ChartData) {
    if (!canvasRef.value) return
    if (chart) {
      chart.data = data
      chart.update()
      return
    }
    chart = new Chart(canvasRef.value, { type, data, options })
  }

  function destroy() {
    chart?.destroy()
    chart = null
  }

  onUnmounted(destroy)

  return { render, destroy }
}

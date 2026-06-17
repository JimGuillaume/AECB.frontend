import { computed, ref } from 'vue'

export function useDatePeriod() {
  const today = new Date()
  const year = ref(today.getFullYear())
  const month = ref(today.getMonth() + 1)

  const monthLabel = computed(() =>
    new Intl.DateTimeFormat('fr-BE', { month: 'long', year: 'numeric' }).format(
      new Date(year.value, month.value - 1, 1),
    ),
  )

  return { year, month, monthLabel }
}

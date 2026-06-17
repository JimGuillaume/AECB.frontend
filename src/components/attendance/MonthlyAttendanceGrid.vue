<script setup lang="ts">
import { computed } from 'vue'
import AttendanceCodeBadge from './AttendanceCodeBadge.vue'
import type { AttendanceRecord } from '@/types/auth'

type DayCell = {
  key: string
  date: Date | null
  dayNumber: number | null
  prestations: AttendanceRecord[]
  isCurrentMonth: boolean
}

const props = defineProps<{
  year: number
  month: number
  prestations: AttendanceRecord[]
  editable?: boolean
}>()

const emit = defineEmits<{
  'click-day': [date: string, prestations: AttendanceRecord[]]
}>()

const monthLabel = computed(() => {
  const reference = new Date(props.year, props.month - 1, 1)
  return new Intl.DateTimeFormat('fr-BE', { month: 'long', year: 'numeric' }).format(reference)
})

const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const cells = computed<DayCell[]>(() => {
  const monthIndex = props.month - 1
  const firstDay = new Date(props.year, monthIndex, 1)
  const daysInMonth = new Date(props.year, props.month, 0).getDate()
  const startOffset = (firstDay.getDay() + 6) % 7
  const totalCells = 35
  const prestationsByDate = new Map<string, AttendanceRecord[]>()

  props.prestations.forEach((prestation) => {
    const list = prestationsByDate.get(prestation.attendance_date) ?? []
    list.push(prestation)
    prestationsByDate.set(prestation.attendance_date, list)
  })

  return Array.from({ length: totalCells }, (_, index) => {
    const dayIndex = index - startOffset + 1
    const isCurrentMonth = dayIndex >= 1 && dayIndex <= daysInMonth

    if (!isCurrentMonth) {
      return {
        key: `empty-${index}`,
        date: null,
        dayNumber: null,
        prestations: [],
        isCurrentMonth: false,
      }
    }

    const date = new Date(props.year, monthIndex, dayIndex)
    const isoDate = date.toISOString().slice(0, 10)

    return {
      key: isoDate,
      date,
      dayNumber: dayIndex,
      prestations: prestationsByDate.get(isoDate) ?? [],
      isCurrentMonth: true,
    }
  })
})
</script>

<template>
  <section class="flex flex-col gap-5">
    <header class="flex items-end justify-between gap-4">
      <div>
        <p class="mb-1.5 mt-0 uppercase tracking-[0.12em] text-[0.75rem] text-gray-500">Prestations du mois</p>
        <h1 class="m-0 text-[2rem] text-gray-900">{{ monthLabel }}</h1>
      </div>
    </header>

    <div
      class="grid grid-cols-7 gap-3 max-[1100px]:gap-2.5 max-md:grid-cols-1"
      role="grid"
      :aria-label="`Prestations ${monthLabel}`"
    >
      <div
        v-for="weekday in weekdays"
        :key="weekday"
        class="px-3 py-2.5 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-gray-500 max-md:hidden"
      >
        {{ weekday }}
      </div>

      <div
        v-for="cell in cells"
        :key="cell.key"
        class="min-h-30 p-3 rounded-2xl bg-white border border-gray-200 shadow-[0_10px_20px_rgba(17,24,39,0.04)] flex flex-col gap-2.5 max-[1100px]:min-h-26 max-md:min-h-24"
        :class="{
          'bg-transparent border-dashed shadow-none': !cell.isCurrentMonth,
          'cursor-pointer hover:border-blue-400 hover:shadow-blue-100': props.editable && cell.isCurrentMonth,
        }"
        @click="props.editable && cell.isCurrentMonth && cell.date
          ? emit('click-day', cell.key, cell.prestations)
          : undefined"
      >
        <span v-if="cell.dayNumber" class="text-[0.95rem] font-bold text-gray-900">{{ cell.dayNumber }}</span>

        <div v-if="cell.prestations.length" class="flex flex-wrap gap-1.5">
          <AttendanceCodeBadge
            v-for="prestation in cell.prestations"
            :key="prestation.attendance_id"
            :code="prestation.code_key || String(prestation.code_id ?? '')"
            size="sm"
          />
        </div>

        <p v-else-if="cell.isCurrentMonth" class="mt-auto mb-0 text-gray-400 text-[0.85rem]">
          Aucun code
        </p>
      </div>
    </div>
  </section>
</template>

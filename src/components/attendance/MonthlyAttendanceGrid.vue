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
  <section class="calendar-card">
    <header class="calendar-card__header">
      <div>
        <p class="calendar-card__eyebrow">Prestations du mois</p>
        <h1 class="calendar-card__title">{{ monthLabel }}</h1>
      </div>
    </header>

    <div class="calendar-grid" role="grid" :aria-label="`Prestations ${monthLabel}`">
      <div v-for="weekday in weekdays" :key="weekday" class="calendar-grid__weekday">
        {{ weekday }}
      </div>

      <div
        v-for="cell in cells"
        :key="cell.key"
        class="calendar-grid__cell"
        :class="{ 'calendar-grid__cell--empty': !cell.isCurrentMonth }"
      >
        <span v-if="cell.dayNumber" class="calendar-grid__day">{{ cell.dayNumber }}</span>

        <div v-if="cell.prestations.length" class="calendar-grid__content">
          <AttendanceCodeBadge
            v-for="prestation in cell.prestations"
            :key="prestation.attendance_id"
            :code="prestation.code_key || String(prestation.code_id ?? '')"
            size="sm"
          />
        </div>

        <p v-else-if="cell.isCurrentMonth" class="calendar-grid__empty-text">
          Aucun code
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.calendar-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.calendar-card__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
}

.calendar-card__eyebrow {
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  color: #6b7280;
}

.calendar-card__title {
  margin: 0;
  font-size: 2rem;
  color: #111827;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12px;
}

.calendar-grid__weekday {
  padding: 10px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}

.calendar-grid__cell {
  min-height: 120px;
  padding: 12px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 20px rgba(17, 24, 39, 0.04);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.calendar-grid__cell--empty {
  background: transparent;
  border-style: dashed;
  box-shadow: none;
}

.calendar-grid__day {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
}

.calendar-grid__content {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.calendar-grid__empty-text {
  margin: auto 0 0;
  color: #9ca3af;
  font-size: 0.85rem;
}

@media (max-width: 1100px) {
  .calendar-grid {
    gap: 10px;
  }

  .calendar-grid__cell {
    min-height: 104px;
  }
}

@media (max-width: 768px) {
  .calendar-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .calendar-grid__weekday {
    display: none;
  }

  .calendar-grid__cell {
    min-height: 96px;
  }
}
</style>
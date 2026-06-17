<script setup lang="ts">
import { computed } from 'vue'
import { HotTable } from '@handsontable/vue3'
import { registerAllModules } from 'handsontable/registry'
import 'handsontable/styles/handsontable.min.css'
import 'handsontable/styles/ht-theme-main.min.css'
import type { AttendanceRecord } from '@/types/auth'
import { useAttendanceCodes } from '@/composables/useAttendanceCodes'

registerAllModules()

const props = defineProps<{
  year: number
  month: number
  prestations: AttendanceRecord[]
  editable?: boolean
}>()

const emit = defineEmits<{
  'click-day': [date: string, prestations: AttendanceRecord[]]
}>()

const { getLabel, getColor } = useAttendanceCodes()

const WEEKDAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

type RowData = {
  jour: string
  code: string
  heures: number | ''
  notes: string
  _date: string
  _prestations: AttendanceRecord[]
}

const tableData = computed<RowData[]>(() => {
  const daysInMonth = new Date(props.year, props.month, 0).getDate()
  const byDate = new Map<string, AttendanceRecord[]>()

  props.prestations.forEach(p => {
    const list = byDate.get(p.attendance_date) ?? []
    list.push(p)
    byDate.set(p.attendance_date, list)
  })

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const date = new Date(props.year, props.month - 1, day)
    const isoDate = `${props.year}-${String(props.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const weekday = WEEKDAYS[date.getDay()]
    const dayPrestas = byDate.get(isoDate) ?? []
    const first = dayPrestas[0]
    return {
      jour: `${weekday} ${String(day).padStart(2, '0')}`,
      code: first?.code_key ?? '',
      heures: first?.hours_value ?? '',
      notes: first?.notes ?? '',
      _date: isoDate,
      _prestations: dayPrestas,
    }
  })
})

function codeRenderer(
  _hot: unknown,
  TD: HTMLTableCellElement,
  _row: number,
  _col: number,
  _prop: string | number,
  value: unknown,
) {
  const code = String(value ?? '')
  if (code) {
    const color = getColor(code)
    const label = getLabel(code)
    TD.innerHTML = `<span style="display:inline-block;padding:2px 8px;border-radius:9999px;background:${color};color:white;font-size:0.8rem;font-weight:600">${label}</span>`
  } else {
    TD.innerHTML = '<span style="color:#9ca3af">—</span>'
  }
  return TD
}

function handleCellMouseDown(_event: MouseEvent, coords: { row: number; col: number }) {
  if (!props.editable || coords.row < 0) return
  const row = tableData.value[coords.row]
  if (row) emit('click-day', row._date, row._prestations)
}

const colHeaders = ['Jour', 'Code', 'Heures', 'Notes']

const columns = [
  { data: 'jour', readOnly: true },
  { data: 'code', readOnly: true, renderer: codeRenderer },
  { data: 'heures', readOnly: true },
  { data: 'notes', readOnly: true },
]

const settings = computed(() => ({
  data: tableData.value,
  colHeaders,
  columns,
  rowHeaders: false,
  stretchH: 'all' as const,
  height: 'auto' as const,
  readOnly: true,
  licenseKey: 'non-commercial-and-evaluation',
  afterOnCellMouseDown: handleCellMouseDown,
}))
</script>

<template>
  <div class="w-full rounded-xl overflow-hidden border border-gray-200 shadow-[0_4px_12px_rgba(17,24,39,0.06)]">
    <HotTable v-bind="settings" />
  </div>
</template>

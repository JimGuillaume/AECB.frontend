import { ref } from 'vue'
import { get } from '@/services/api'

interface AttendanceCode {
  code_id: number
  code_name: string
  description: string
  worked: boolean
}

//Permet de changer les couleurs sans faire des updates db
const COLOR_MAP: Record<string, string> = {
  P: 'green',
  C: 'blue',
  CC: 'blue',
  CS: 'blue',
  M: 'yellow',
  MLD: 'yellow',
  CE: 'purple',
  CI: 'purple',
  AT: 'red',
  R: 'green',
  A: 'red',
}

const codes = ref<AttendanceCode[]>([])
let fetched = false

export function useAttendanceCodes() {
  if (!fetched) {
    fetched = true
    get('/attendance/get_codes.php').then((data: any) => {
      codes.value = data
    })
  }

  function getLabel(code: string): string {
    return codes.value.find(c => c.code_name === code)?.description ?? code
  }

  function getColor(code: string): string {
    return COLOR_MAP[code] ?? 'gray'
  }

  return { codes, getLabel, getColor }
}

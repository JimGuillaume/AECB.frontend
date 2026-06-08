export type AttendanceCodeDef = { label: string; color: string }

export const ATTENDANCE_CODES: Record<string, AttendanceCodeDef> = {
  P: { label: 'Préstation sur le chantier', color: 'green' },
  C: { label: 'Congés payés', color: 'blue' },
  CC: { label: 'Congés de circonstance', color: 'blue' },
  CS: { label: 'Congé sans solde', color: 'blue' },
  M: { label: 'Congé maladie', color: 'yellow' },
  MLD: { label: 'Congé maladie longue durée', color: 'yellow' },
  CE: { label: 'Chomage économique', color: 'purple' },
  CI: { label: 'Congé intempérie', color: 'purple' },
  AT: { label: 'Accident de travail', color: 'red' },
  R: { label: 'Récupération des heures supplémentaires', color: 'green' },
  A: { label: 'Absence non justifié', color: 'red' },
}

export const ATTENDANCE_CODE_KEYS = Object.keys(ATTENDANCE_CODES)

export const ATTENDANCE_CODE_LIST = ATTENDANCE_CODE_KEYS.map((key) => ({ key, ...(ATTENDANCE_CODES[key] as AttendanceCodeDef) }))

export function getAttendanceLabel(code: string): string {
  return ATTENDANCE_CODES[code]?.label ?? code
}

export function getAttendanceColor(code: string): string {
  return ATTENDANCE_CODES[code]?.color ?? 'gray'
}

export default { ATTENDANCE_CODES, ATTENDANCE_CODE_KEYS, ATTENDANCE_CODE_LIST, getAttendanceLabel, getAttendanceColor }

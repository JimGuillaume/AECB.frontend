export interface AttendanceFilter {
  month?: string;
  teamId?: number | null;
  workerId?: number | null;
  code?: string | null;
}

export interface AttendanceRecord {
  attendance_id: number;
  user_id: number;
  worker_name?: string;
  team_id?: number | null;
  attendance_date: string; // YYYY-MM-DD
  code_id?: number | null;
  code_key?: string | null;
  hours_value: number;
  notes?: string | null;
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
}

export type AttendanceList = AttendanceRecord[]

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthToken {
  accessToken : string;
  refreshToken?: string;
  expiration?: number;  // Secondes restantes avant l'expiration du token JwS
}

export interface UserSession {
  id: number
  first_name: string;
  last_name: string;
  email: string;
  role : 'worker' | 'team_leader' | 'manager' | 'admin';
  token?: AuthToken;
  team_ids?: number[];
}

export interface AttendanceRecord {
  attendance_id: number;
  user_id: number;
  team_id?: number | null;
  attendance_date: string;
  code_id?: number | null;
  code_key?: string | null;
  hours_value: number;
  notes?: string | null;
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface CurrentMonthProfile {
  message: string;
  user: UserSession;
  period: {
    year: number;
    month: number;
  };
  prestations: AttendanceRecord[];
}
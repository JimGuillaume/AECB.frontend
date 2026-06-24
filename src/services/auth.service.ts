import { get, post } from './api'
import type { Credentials, CurrentMonthProfile, UserSession } from '@/types/auth'

type LoginResponse = {
  message: string
  user: UserSession
}

//Cache l'utilisateur pour éviter un call à chaque navigation
let cachedUser: UserSession | null = null
let checked = false

export async function login(credentials: Credentials): Promise<LoginResponse> {
  const response = (await post('/auth/login.php', credentials)) as LoginResponse
  cachedUser = response.user
  checked = true
  return response
}

export async function fetchCurrentProfile(year?: number, month?: number): Promise<CurrentMonthProfile | null> {
  try {
    const query = new URLSearchParams()

    if (typeof year === 'number') {
      query.set('year', String(year))
    }

    if (typeof month === 'number') {
      query.set('month', String(month))
    }

    const path = query.toString() ? `/auth/me.php?${query.toString()}` : '/auth/me.php'
    const data = (await get(path)) as CurrentMonthProfile
    //copie le team id sur utilisateur
    if (data.user && data.team_ids !== undefined) {
      data.user.team_ids = data.team_ids
    }
    cachedUser = data.user ?? null
    return data
  } catch {
    cachedUser = null
    return null
  } finally {
    checked = true
  }
}

export async function fetchCurrentUser(): Promise<UserSession | null> {
  const profile = await fetchCurrentProfile()
  return profile?.user ?? cachedUser
}

export async function requireAuth(): Promise<UserSession | null> {
  //si session vérifié on skip le fetch et on renvoie direct
  //l'utilisateur en cache
  if (checked) return cachedUser
  return fetchCurrentUser()
}

export async function logout(): Promise<void> {
  try {
    await post('/auth/logout.php')
  } finally {
    clearAuthCache()
  }
}

export function clearAuthCache() {
  cachedUser = null
  checked = false
}
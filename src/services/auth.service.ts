import { get, post } from './api'
import type { Credentials, CurrentMonthProfile, UserSession } from '@/types/auth'

type LoginResponse = {
  message: string
  user: UserSession
}

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
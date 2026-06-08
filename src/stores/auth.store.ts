import { defineStore } from 'pinia'
import type { Credentials, UserSession } from '@/types/auth'
import {
  fetchCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from '@/services/auth.service'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as UserSession | null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,

    role: (state) => state.user?.role ?? null,
  },

  actions: {
    async login(credentials: Credentials) {
      this.loading = true

      try {
        const response = await loginRequest(credentials)
        this.user = response.user
        return response
      } finally {
        this.loading = false
      }
    },

    async initialize() {
      this.loading = true

      try {
        this.user = await fetchCurrentUser()
      } finally {
        this.loading = false
      }
    },

    async logout() {
      await logoutRequest()
      this.user = null
    },
  },
})
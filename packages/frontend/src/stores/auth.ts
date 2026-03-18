import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '../api/auth'

export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'visitor'
  avatar?: string
  bio?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)

  async function fetchMe() {
    try {
      loading.value = true
      const res = await authApi.me()
      user.value = res.data.data
    } catch {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    const res = await authApi.login({ email, password })
    user.value = res.data.data
    return res.data.data
  }

  async function logout() {
    await authApi.logout()
    user.value = null
  }

  async function register(username: string, email: string, password: string) {
    const res = await authApi.register({ username, email, password })
    return res.data.data
  }

  return { user, loading, fetchMe, login, logout, register }
})

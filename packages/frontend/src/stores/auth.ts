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
    const data = res.data.data
    if (data.access_token) localStorage.setItem('access_token', data.access_token)
    user.value = { id: data.id, username: data.username, email: data.email, role: data.role, avatar: data.avatar }
    return user.value
  }

  async function logout() {
    await authApi.logout()
    user.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  async function register(username: string, email: string, password: string) {
    const res = await authApi.register({ username, email, password })
    return res.data.data
  }

  return { user, loading, fetchMe, login, logout, register }
})

import axios from 'axios'

const WORKER = 'https://shblog-worker.diaoyudao110.workers.dev'

// 生产环境直接请求 Worker，本地开发走 Vite 代理
const baseURL = import.meta.env.PROD ? `${WORKER}/api/v1` : '/api/v1'

const client = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
})

// 请求拦截：自动带 token
client.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/')
    ) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const res = await axios.post(`${baseURL}/auth/refresh`, { refresh_token: refreshToken })
          const newToken = res.data?.data?.access_token
          if (newToken) localStorage.setItem('access_token', newToken)
          return client(original)
        }
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    }
    return Promise.reject(err)
  }
)

export default client

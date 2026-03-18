import axios from 'axios'

// 生产环境直接请求 Worker，本地开发走 Vite 代理
const baseURL = import.meta.env.PROD
  ? 'https://shblog-worker.diaoyudao110.workers.dev/api/v1'
  : '/api/v1'

const client = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
})

client.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        await axios.post(`${baseURL.replace('/api/v1', '')}/api/v1/auth/refresh`, {}, { withCredentials: true })
        return client(original)
      } catch {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default client

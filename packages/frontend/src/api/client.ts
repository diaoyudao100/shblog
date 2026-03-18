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
    // 只对非认证接口做 token 刷新，避免死循环
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/')
    ) {
      original._retry = true
      try {
        await axios.post(
          'https://shblog-worker.diaoyudao110.workers.dev/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        )
        return client(original)
      } catch {
        // 刷新失败，静默处理，不跳转
      }
    }
    return Promise.reject(err)
  }
)

export default client

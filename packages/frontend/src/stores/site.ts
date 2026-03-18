import { defineStore } from 'pinia'
import { ref } from 'vue'
import client from '../api/client'

export const useSiteStore = defineStore('site', () => {
  const settings = ref({
    site_name: 'shblog',
    site_desc: '个人博客 - 生活随笔、旅行、摄影',
    admin_email: '',
    image_base_url: '',
  })

  async function fetchSettings() {
    try {
      const res = await client.get('/settings')
      Object.assign(settings.value, res.data.data)
    } catch {
      // 使用默认值
    }
  }

  async function saveSettings(data: Record<string, string>) {
    await client.put('/settings', data)
    Object.assign(settings.value, data)
  }

  return { settings, fetchSettings, saveSettings }
})

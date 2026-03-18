import client from './client'

export const uploadApi = {
  upload: (file: File, onProgress?: (p: number) => void) => {
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`
    return client.put(`/images/upload?key=${encodeURIComponent(key)}`, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: e => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total))
      },
    })
  },
  list: () => client.get('/images'),
  remove: (id: number) => client.delete(`/images/${id}`),
}

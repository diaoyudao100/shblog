import client from './client'

export interface PostQuery {
  page?: number
  limit?: number
  status?: string
  category?: string
  tag?: string
}

export const postsApi = {
  list: (params?: PostQuery) => client.get('/posts', { params }),
  get: (slug: string) => client.get(`/posts/${slug}`),
  create: (data: unknown) => client.post('/posts', data),
  update: (id: number, data: unknown) => client.put(`/posts/${id}`, data),
  remove: (id: number) => client.delete(`/posts/${id}`),
}

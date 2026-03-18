import client from './client'

export const commentsApi = {
  list: (postId: number) => client.get(`/posts/${postId}/comments`),
  submit: (postId: number, data: unknown) => client.post(`/posts/${postId}/comments`, data),
  adminList: (params?: { page?: number; status?: string }) =>
    client.get('/admin/comments', { params }),
  approve: (id: number) => client.put(`/admin/comments/${id}/approve`),
  reject: (id: number) => client.put(`/admin/comments/${id}/reject`),
  remove: (id: number) => client.delete(`/admin/comments/${id}`),
}

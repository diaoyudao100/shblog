import client from './client'

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    client.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    client.post('/auth/login', data),
  logout: () => client.post('/auth/logout'),
  refresh: () => client.post('/auth/refresh'),
  me: () => client.get('/auth/me'),
}

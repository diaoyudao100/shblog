import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../views/frontend/FrontendLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('../views/frontend/HomeView.vue') },
        { path: 'posts/:slug', name: 'post', component: () => import('../views/frontend/PostView.vue') },
        { path: 'archive', name: 'archive', component: () => import('../views/frontend/ArchiveView.vue') },
        { path: 'tags', name: 'tags', component: () => import('../views/frontend/TagView.vue') },
        { path: 'tags/:slug', name: 'tag-posts', component: () => import('../views/frontend/TagView.vue') },
        { path: 'photos', name: 'photos', component: () => import('../views/frontend/PhotoView.vue') },
        { path: 'about', name: 'about', component: () => import('../views/frontend/AboutView.vue') },
        { path: 'login', name: 'login', component: () => import('../views/frontend/LoginView.vue') },
        { path: 'register', name: 'register', component: () => import('../views/frontend/RegisterView.vue') },
      ],
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { requiresAdmin: true },
      children: [
        { path: '', name: 'admin-dashboard', component: () => import('../views/admin/DashboardView.vue') },
        { path: 'posts', name: 'admin-posts', component: () => import('../views/admin/PostsView.vue') },
        { path: 'posts/new', name: 'admin-post-new', component: () => import('../views/admin/PostEditView.vue') },
        { path: 'posts/:id/edit', name: 'admin-post-edit', component: () => import('../views/admin/PostEditView.vue') },
        { path: 'comments', name: 'admin-comments', component: () => import('../views/admin/CommentsView.vue') },
        { path: 'users', name: 'admin-users', component: () => import('../views/admin/UsersView.vue') },
        { path: 'photos', name: 'admin-photos', component: () => import('../views/admin/PhotosView.vue') },
        { path: 'settings', name: 'admin-settings', component: () => import('../views/admin/SettingsView.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', component: () => import('../views/frontend/NotFoundView.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAdmin) {
    const auth = useAuthStore()
    if (!auth.user) await auth.fetchMe()
    if (!auth.user || auth.user.role !== 'admin') return '/login'
  }
})

export default router

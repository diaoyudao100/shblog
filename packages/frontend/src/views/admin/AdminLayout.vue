<template>
  <n-layout style="min-height:100vh" has-sider>
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="220"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div style="padding:20px 16px;font-weight:700;font-size:18px">{{ collapsed ? 'SB' : 'shblog 后台' }}</div>
      <n-menu :collapsed="collapsed" :options="menuOptions" :value="activeKey" />
    </n-layout-sider>
    <n-layout>
      <n-layout-header bordered style="padding:0 24px;height:56px;display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:15px;opacity:0.6">{{ pageTitle }}</span>
        <div style="display:flex;align-items:center;gap:12px">
          <n-button text tag="a" href="/" target="_blank">访问前台</n-button>
          <n-button text @click="ui.toggleDark()">{{ ui.dark ? '☀️' : '🌙' }}</n-button>
          <n-button text @click="auth.logout().then(() => $router.push('/login'))">退出</n-button>
        </div>
      </n-layout-header>
      <n-layout-content style="padding:24px">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import { useAuthStore } from '../../stores/auth'
import { useUiStore } from '../../stores/ui'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const collapsed = ref(false)

const menuOptions: MenuOption[] = [
  { label: () => h('a', { onClick: () => router.push('/admin') }, '概览'), key: '/admin' },
  { label: () => h('a', { onClick: () => router.push('/admin/posts') }, '文章管理'), key: '/admin/posts' },
  { label: () => h('a', { onClick: () => router.push('/admin/comments') }, '评论审核'), key: '/admin/comments' },
  { label: () => h('a', { onClick: () => router.push('/admin/photos') }, '图片库'), key: '/admin/photos' },
  { label: () => h('a', { onClick: () => router.push('/admin/users') }, '用户管理'), key: '/admin/users' },
  { label: () => h('a', { onClick: () => router.push('/admin/settings') }, '站点设置'), key: '/admin/settings' },
]

const activeKey = computed(() => route.path)
const titleMap: Record<string, string> = {
  '/admin': '数据概览',
  '/admin/posts': '文章管理',
  '/admin/posts/new': '新建文章',
  '/admin/comments': '评论审核',
  '/admin/photos': '图片库',
  '/admin/users': '用户管理',
  '/admin/settings': '站点设置',
}
const pageTitle = computed(() => titleMap[route.path] || '后台管理')
</script>

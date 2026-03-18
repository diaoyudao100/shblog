<template>
  <div>
    <n-data-table :columns="columns" :data="users" :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NButton, useMessage, type DataTableColumns } from 'naive-ui'
import client from '../../api/client'
import dayjs from 'dayjs'

const message = useMessage()
const users = ref<any[]>([])
const loading = ref(false)

const columns: DataTableColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '用户名', key: 'username', width: 140 },
  { title: '邮箱', key: 'email' },
  { title: '角色', key: 'role', width: 80 },
  { title: '状态', key: 'banned', width: 80, render: row => (row as any).banned ? '已封禁' : '正常' },
  { title: '注册时间', key: 'created_at', width: 130,
    render: row => dayjs((row as any).created_at).format('YYYY-MM-DD') },
  { title: '操作', key: 'actions', width: 100,
    render: row => h(NButton, {
      size: 'small',
      type: (row as any).banned ? 'default' : 'warning',
      onClick: () => toggleBan(row as any)
    }, { default: () => (row as any).banned ? '解封' : '封禁' })
  },
]

async function load() {
  loading.value = true
  try {
    const res = await client.get('/admin/users')
    users.value = res.data.data
  } finally { loading.value = false }
}

async function toggleBan(user: any) {
  await client.put(`/admin/users/${user.id}/ban`, { banned: !user.banned })
  message.success(user.banned ? '已解封' : '已封禁')
  load()
}

onMounted(load)
</script>

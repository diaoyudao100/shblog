<template>
  <div>
    <div style="display:flex;gap:12px;margin-bottom:16px">
      <n-select v-model:value="filterStatus" :options="statusOptions" style="width:140px" @update:value="load" />
    </div>
    <n-data-table :columns="columns" :data="comments" :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NButton, NSpace, useMessage, type DataTableColumns } from 'naive-ui'
import { commentsApi } from '../../api/comments'
import dayjs from 'dayjs'

const message = useMessage()
const comments = ref<any[]>([])
const loading = ref(false)
const filterStatus = ref('')

const statusOptions = [
  { label: '全部', value: '' },
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
]

const columns: DataTableColumns = [
  { title: '评论者', key: 'commenter', width: 120,
    render: row => (row as any).username || (row as any).guest_name || '匿名' },
  { title: '内容', key: 'content', ellipsis: { tooltip: true } },
  { title: '文章', key: 'post_title', width: 160, ellipsis: true },
  { title: '状态', key: 'status', width: 80 },
  { title: '时间', key: 'created_at', width: 130,
    render: row => dayjs((row as any).created_at).format('MM-DD HH:mm') },
  { title: '操作', key: 'actions', width: 180,
    render: row => h(NSpace, null, { default: () => [
      (row as any).status !== 'approved' && h(NButton, {
        size: 'small', type: 'success',
        onClick: () => approve((row as any).id)
      }, { default: () => '通过' }),
      (row as any).status !== 'rejected' && h(NButton, {
        size: 'small',
        onClick: () => reject((row as any).id)
      }, { default: () => '拒绝' }),
      h(NButton, {
        size: 'small', type: 'error',
        onClick: () => remove((row as any).id)
      }, { default: () => '删除' }),
    ].filter(Boolean) })
  },
]

async function load() {
  loading.value = true
  try {
    const res = await commentsApi.adminList({ status: filterStatus.value || undefined })
    comments.value = res.data.data
  } finally { loading.value = false }
}

async function approve(id: number) {
  await commentsApi.approve(id); message.success('已通过'); load()
}
async function reject(id: number) {
  await commentsApi.reject(id); message.success('已拒绝'); load()
}
async function remove(id: number) {
  await commentsApi.remove(id); message.success('已删除'); load()
}

onMounted(load)
</script>

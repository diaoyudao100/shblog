<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <n-space>
        <n-select v-model:value="filterStatus" :options="statusOptions" style="width:120px" @update:value="load" />
        <n-select v-model:value="filterCat" :options="catOptions" style="width:120px" @update:value="load" />
      </n-space>
      <n-button type="primary" @click="$router.push('/admin/posts/new')">+ 新建文章</n-button>
    </div>

    <n-data-table
      :columns="columns"
      :data="posts"
      :loading="loading"
      :pagination="{ page, pageSize: 15, itemCount: total, onUpdatePage: (p: number) => { page = p; load() } }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NSpace, useDialog, useMessage, type DataTableColumns } from 'naive-ui'
import { postsApi } from '../../api/posts'
import dayjs from 'dayjs'

const router = useRouter()
const dialog = useDialog()
const message = useMessage()
const posts = ref<any[]>([])
const total = ref(0)
let page = 1
const loading = ref(false)
const filterStatus = ref('all')
const filterCat = ref('all')

const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '已发布', value: 'published' },
  { label: '草稿', value: 'draft' },
  { label: '已归档', value: 'archived' },
]
const catOptions = [
  { label: '全部分类', value: 'all' },
  { label: '随笔', value: 'essay' },
  { label: '日记', value: 'diary' },
  { label: '旅行', value: 'travel' },
  { label: '摄影', value: 'photo' },
]

const columns: DataTableColumns = [
  { title: '标题', key: 'title', render: row =>
    h('a', { style: 'cursor:pointer', onClick: () => router.push(`/admin/posts/${(row as any).id}/edit`) }, (row as any).title)
  },
  { title: '分类', key: 'category', width: 80 },
  { title: '状态', key: 'status', width: 80 },
  { title: '浏览', key: 'view_count', width: 70 },
  { title: '发布时间', key: 'published_at', width: 130,
    render: row => (row as any).published_at ? dayjs((row as any).published_at).format('MM-DD HH:mm') : '-' },
  { title: '操作', key: 'actions', width: 120, render: row =>
    h(NSpace, null, { default: () => [
      h(NButton, { size: 'small', onClick: () => router.push(`/admin/posts/${(row as any).id}/edit`) }, { default: () => '编辑' }),
      h(NButton, { size: 'small', type: 'error', onClick: () => confirmDelete((row as any).id) }, { default: () => '删除' }),
    ]})
  },
]

async function load() {
  loading.value = true
  try {
    const params: any = { page, limit: 15 }
    if (filterStatus.value !== 'all') params.status = filterStatus.value
    if (filterCat.value !== 'all') params.category = filterCat.value
    const res = await postsApi.list(params)
    posts.value = res.data.data.posts
    total.value = res.data.data.total
  } finally { loading.value = false }
}

function confirmDelete(id: number) {
  dialog.warning({
    title: '确认删除',
    content: '删除后不可恢复，确认吗？',
    positiveText: '删除',
    onPositiveClick: async () => {
      await postsApi.remove(id)
      message.success('已删除')
      load()
    },
  })
}

onMounted(load)
</script>

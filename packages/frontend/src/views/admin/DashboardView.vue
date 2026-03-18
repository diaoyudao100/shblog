<template>
  <div>
    <n-grid :cols="4" :x-gap="16" :y-gap="16" style="margin-bottom:32px">
      <n-gi v-for="stat in stats" :key="stat.label">
        <n-card>
          <n-statistic :label="stat.label" :value="stat.value" />
        </n-card>
      </n-gi>
    </n-grid>

    <n-card title="最新文章">
      <n-data-table :columns="columns" :data="recentPosts" :pagination="false" size="small" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import { useRouter } from 'vue-router'
import { postsApi } from '../../api/posts'
import dayjs from 'dayjs'

const router = useRouter()
const recentPosts = ref<any[]>([])
const stats = ref([
  { label: '已发布文章', value: 0 },
  { label: '草稿', value: 0 },
  { label: '评论', value: 0 },
  { label: '总浏览量', value: 0 },
])

const columns: DataTableColumns = [
  { title: '标题', key: 'title', render: row => h('a', {
    style: 'cursor:pointer',
    onClick: () => router.push(`/admin/posts/${(row as any).id}/edit`)
  }, (row as any).title) },
  { title: '分类', key: 'category', width: 80 },
  { title: '状态', key: 'status', width: 80 },
  { title: '浏览', key: 'view_count', width: 80 },
  { title: '发布时间', key: 'published_at', width: 140,
    render: row => (row as any).published_at ? dayjs((row as any).published_at).format('MM-DD HH:mm') : '-' },
]

onMounted(async () => {
  const [pub, draft] = await Promise.all([
    postsApi.list({ status: 'published', limit: 5 }),
    postsApi.list({ status: 'draft', limit: 1 }),
  ])
  recentPosts.value = pub.data.data.posts
  stats.value[0].value = pub.data.data.total
  stats.value[1].value = draft.data.data.total
  stats.value[3].value = recentPosts.value.reduce((s: number, p: any) => s + p.view_count, 0)
})
</script>

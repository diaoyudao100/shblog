<template>
  <div class="container">
    <h1 style="margin-bottom:48px">归档</h1>
    <n-spin :show="loading">
      <div v-for="(posts, year) in grouped" :key="year" class="year-group">
        <h2 class="year">{{ year }}</h2>
        <div v-for="post in posts" :key="post.id" class="post-row" @click="$router.push(`/posts/${post.slug}`)">
          <span class="date">{{ dayjs(post.published_at).format('MM-DD') }}</span>
          <span class="title">{{ post.title }}</span>
          <div class="tags">
            <n-tag v-for="t in post.tags" :key="t.slug" size="small" :bordered="false">{{ t.name }}</n-tag>
          </div>
        </div>
      </div>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { postsApi } from '../../api/posts'

const loading = ref(false)
const posts = ref<any[]>([])

const grouped = computed(() => {
  const map: Record<string, any[]> = {}
  for (const p of posts.value) {
    const y = dayjs(p.published_at).format('YYYY')
    if (!map[y]) map[y] = []
    map[y].push(p)
  }
  return Object.fromEntries(Object.entries(map).sort((a, b) => Number(b[0]) - Number(a[0])))
})

const MOCK_ARCHIVE = [
  { id: 1, title: '京都秋日：枫叶与寺庙的对话', slug: 'kyoto-autumn', published_at: '2024-11-15T08:00:00Z', tags: [{ name: '旅行', slug: 'travel' }] },
  { id: 2, title: '一个人的清晨', slug: 'morning-alone', published_at: '2024-12-03T06:30:00Z', tags: [{ name: '日记', slug: 'diary' }] },
  { id: 3, title: '大理古城的慢时光', slug: 'dali-slow-life', published_at: '2024-10-20T10:00:00Z', tags: [{ name: '旅行', slug: 'travel' }] },
  { id: 4, title: '光与影的构图练习', slug: 'light-shadow-composition', published_at: '2024-09-08T14:00:00Z', tags: [{ name: '摄影', slug: 'photography' }] },
  { id: 5, title: '关于孤独这件事', slug: 'about-loneliness', published_at: '2024-08-22T20:00:00Z', tags: [{ name: '随笔', slug: 'essay' }] },
  { id: 6, title: '西藏：离天空最近的地方', slug: 'tibet-sky', published_at: '2024-07-10T12:00:00Z', tags: [{ name: '旅行', slug: 'travel' }] },
]

onMounted(async () => {
  loading.value = true
  try {
    const res = await postsApi.list({ limit: 1000 })
    posts.value = res.data.data.posts
  } catch {
    posts.value = MOCK_ARCHIVE
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.container { max-width: 780px; margin: 0 auto; padding: 60px 24px 80px; }
.year-group { margin-bottom: 40px; }
.year { font-size: 28px; font-weight: 700; margin: 0 0 16px; opacity: 0.4; }
.post-row {
  display: flex; align-items: center; gap: 16px; padding: 12px 0;
  border-bottom: 1px solid rgba(128,128,128,0.1); cursor: pointer;
  transition: opacity 0.2s;
}
.post-row:hover { opacity: 0.7; }
.date { font-size: 13px; opacity: 0.45; width: 48px; flex-shrink: 0; font-variant-numeric: tabular-nums; }
.title { flex: 1; font-size: 16px; }
.tags { display: flex; gap: 4px; flex-shrink: 0; }
</style>

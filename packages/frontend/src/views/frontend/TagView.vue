<template>
  <div class="container">
    <template v-if="!currentTag">
      <h1 style="margin-bottom:40px">标签</h1>
      <div class="tag-cloud">
        <n-tag
          v-for="t in tags"
          :key="t.slug"
          :bordered="false"
          class="tag-item"
          @click="$router.push(`/tags/${t.slug}`)"
        >
          {{ t.name }}
          <template #avatar><span style="opacity:0.5">{{ t.post_count }}</span></template>
        </n-tag>
      </div>
    </template>

    <template v-else>
      <div style="margin-bottom:32px">
        <n-button text @click="$router.push('/tags')" style="margin-bottom:16px">← 所有标签</n-button>
        <h1># {{ currentTag }}</h1>
      </div>
      <n-spin :show="store.loading">
        <div class="grid">
          <PostCard v-for="p in store.posts" :key="p.id" :post="p" />
        </div>
        <n-empty v-if="!store.loading && store.posts.length === 0" description="暂无文章" />
      </n-spin>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { postsApi } from '../../api/posts'
import { usePostsStore } from '../../stores/posts'
import PostCard from '../../components/post/PostCard.vue'

const route = useRoute()
const store = usePostsStore()
const tags = ref<any[]>([])
const currentTag = computed(() => route.params.slug as string | undefined)

const MOCK_TAGS = [
  { id: 1, name: '旅行', slug: 'travel', post_count: 3 },
  { id: 2, name: '日记', slug: 'diary', post_count: 1 },
  { id: 3, name: '随笔', slug: 'essay', post_count: 1 },
  { id: 4, name: '摄影', slug: 'photography', post_count: 1 },
  { id: 5, name: '日本', slug: 'japan', post_count: 1 },
  { id: 6, name: '云南', slug: 'yunnan', post_count: 1 },
  { id: 7, name: '西藏', slug: 'tibet', post_count: 1 },
  { id: 8, name: '生活', slug: 'life', post_count: 2 },
  { id: 9, name: '思考', slug: 'thinking', post_count: 1 },
]

async function loadTags() {
  try {
    const { default: client } = await import('../../api/client')
    const res = await client.get('/tags')
    tags.value = res.data.data
  } catch {
    tags.value = MOCK_TAGS
  }
}

async function loadTagPosts(slug: string) {
  store.fetchPosts({ tag: slug, limit: 100 })
}

onMounted(() => {
  loadTags()
  if (currentTag.value) loadTagPosts(currentTag.value)
})

watch(currentTag, val => { if (val) loadTagPosts(val) })
</script>

<style scoped>
.container { max-width: 1100px; margin: 0 auto; padding: 60px 24px 80px; }
.tag-cloud { display: flex; flex-wrap: wrap; gap: 12px; }
.tag-item { cursor: pointer; font-size: 15px; padding: 8px 16px; border-radius: 20px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
</style>

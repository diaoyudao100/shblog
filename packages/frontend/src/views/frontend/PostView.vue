<template>
  <div class="post-view" v-if="post">
    <div class="container">
      <!-- Header -->
      <header class="post-header">
        <div class="meta">
          <n-tag :bordered="false" type="info" size="small">{{ categoryLabel }}</n-tag>
          <span class="date">{{ dayjs(post.published_at).format('YYYY年MM月DD日') }}</span>
          <span class="views">👁 {{ post.view_count }}</span>
        </div>
        <h1>{{ post.title }}</h1>
        <p v-if="post.excerpt" class="excerpt">{{ post.excerpt }}</p>
        <div class="tags">
          <n-tag v-for="t in post.tags" :key="t.slug" size="small" :bordered="false"
            style="margin-right:6px;cursor:pointer" @click="$router.push(`/tags/${t.slug}`)">
            # {{ t.name }}
          </n-tag>
        </div>
      </header>

      <!-- Cover -->
      <img v-if="post.cover_image" :src="post.cover_image" class="cover" :alt="post.title" />

      <!-- Content -->
      <div class="content prose" v-html="post.content" />

      <!-- Author -->
      <div class="author-card">
        <n-avatar :src="post.author_avatar" :size="48" round />
        <div>
          <div style="font-weight:600">{{ post.author_name }}</div>
          <div style="font-size:13px;opacity:0.6">{{ post.author_bio }}</div>
        </div>
      </div>

      <!-- Comments -->
      <CommentSection :post-id="post.id" />
    </div>
  </div>
  <div v-else-if="store.loading" style="display:flex;justify-content:center;padding:100px">
    <n-spin size="large" />
  </div>
  <NotFoundView v-else />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { usePostsStore } from '../../stores/posts'
import CommentSection from '../../components/comment/CommentSection.vue'
import NotFoundView from './NotFoundView.vue'

const route = useRoute()
const store = usePostsStore()
const post = computed(() => store.currentPost)

const categoryMap: Record<string, string> = {
  essay: '随笔', diary: '日记', travel: '旅行', photo: '摄影'
}
const categoryLabel = computed(() => post.value ? (categoryMap[post.value.category] || '') : '')

onMounted(() => store.fetchPost(route.params.slug as string))
</script>

<style scoped>
.container { max-width: 780px; margin: 0 auto; padding: 60px 24px 80px; }
.post-header { margin-bottom: 32px; }
.meta { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.date, .views { font-size: 13px; opacity: 0.5; }
h1 { font-size: 36px; font-weight: 700; margin: 0 0 16px; line-height: 1.3; }
.excerpt { font-size: 16px; opacity: 0.65; margin: 0 0 20px; line-height: 1.6; }
.cover { width: 100%; border-radius: 12px; margin-bottom: 40px; max-height: 480px; object-fit: cover; }
.content { line-height: 1.8; font-size: 16px; }
.author-card { display: flex; align-items: center; gap: 16px; margin: 60px 0 40px; padding: 24px; border-radius: 12px; background: rgba(128,128,128,0.08); }
</style>

<style>
.prose h1,.prose h2,.prose h3 { font-weight: 600; margin: 1.5em 0 0.5em; }
.prose p { margin: 0 0 1em; }
.prose img { max-width: 100%; border-radius: 8px; }
.prose blockquote { border-left: 3px solid #aaa; margin: 0; padding: 0 0 0 16px; opacity: 0.75; }
.prose code { background: rgba(128,128,128,0.12); padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
.prose pre { background: rgba(128,128,128,0.1); padding: 16px; border-radius: 8px; overflow: auto; }
.prose a { color: #18a058; }
</style>

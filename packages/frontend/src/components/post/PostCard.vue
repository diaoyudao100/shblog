<template>
  <div class="post-card" @click="$router.push(`/posts/${post.slug}`)">
    <div v-if="post.cover_image" class="cover">
      <img :src="post.cover_image" :alt="post.title" loading="lazy" />
    </div>
    <div class="body">
      <div class="meta">
        <n-tag :bordered="false" size="small" type="info">{{ categoryLabel }}</n-tag>
        <span class="date">{{ dayjs(post.published_at).format('YYYY-MM-DD') }}</span>
      </div>
      <h2 class="title">{{ post.title }}</h2>
      <p v-if="post.excerpt" class="excerpt">{{ post.excerpt }}</p>
      <div class="footer">
        <div class="tags">
          <n-tag v-for="t in post.tags" :key="t.slug" size="small" :bordered="false" style="margin-right:4px">
            {{ t.name }}
          </n-tag>
        </div>
        <span class="views">👁 {{ post.view_count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
const props = defineProps<{ post: any }>()
const categoryMap: Record<string, string> = {
  essay: '随笔', diary: '日记', travel: '旅行', photo: '摄影'
}
const categoryLabel = props.post.category ? categoryMap[props.post.category] || props.post.category : ''
</script>

<style scoped>
.post-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  background: var(--n-color);
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.post-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
.cover { aspect-ratio: 16/9; overflow: hidden; }
.cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.post-card:hover .cover img { transform: scale(1.04); }
.body { padding: 16px 20px 20px; }
.meta { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.date { font-size: 12px; opacity: 0.5; }
.title { font-size: 18px; font-weight: 600; margin: 0 0 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.excerpt { font-size: 14px; opacity: 0.65; line-height: 1.6; margin: 0 0 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.footer { display: flex; justify-content: space-between; align-items: center; }
.views { font-size: 12px; opacity: 0.45; }
</style>

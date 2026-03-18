<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <h1>shblog</h1>
      <p>记录生活、旅行、摄影与思考</p>
    </section>

    <!-- Filters -->
    <div class="filters">
      <n-button-group>
        <n-button
          v-for="cat in categories"
          :key="cat.value"
          :type="activeCategory === cat.value ? 'primary' : 'default'"
          size="small"
          @click="setCategory(cat.value)"
        >{{ cat.label }}</n-button>
      </n-button-group>
    </div>

    <!-- Post Grid -->
    <div class="container">
      <n-spin :show="store.loading">
        <div class="grid">
          <PostCard v-for="post in store.posts" :key="post.id" :post="post" />
        </div>
        <n-empty v-if="!store.loading && store.posts.length === 0" description="暂无文章" style="margin-top:60px" />
      </n-spin>

      <!-- Pagination -->
      <div v-if="store.total > pageSize" style="display:flex;justify-content:center;margin-top:40px">
        <n-pagination v-model:page="page" :page-count="Math.ceil(store.total / pageSize)" @update:page="load" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PostCard from '../../components/post/PostCard.vue'
import { usePostsStore } from '../../stores/posts'

const store = usePostsStore()
const page = ref(1)
const pageSize = 12
const activeCategory = ref('')

const categories = [
  { label: '全部', value: '' },
  { label: '随笔', value: 'essay' },
  { label: '日记', value: 'diary' },
  { label: '旅行', value: 'travel' },
  { label: '摄影', value: 'photo' },
]

function load() {
  store.fetchPosts({ page: page.value, limit: pageSize, category: activeCategory.value || undefined })
}

function setCategory(val: string) {
  activeCategory.value = val
  page.value = 1
  load()
}

onMounted(load)
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 80px 24px 40px;
}
.hero h1 { font-size: 48px; font-weight: 700; margin: 0 0 12px; letter-spacing: -1px; }
.hero p { font-size: 18px; opacity: 0.6; margin: 0; }
.filters { display: flex; justify-content: center; margin-bottom: 40px; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 24px 80px; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}
</style>

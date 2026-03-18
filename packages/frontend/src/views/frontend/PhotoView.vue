<template>
  <div class="container">
    <h1 style="margin-bottom:40px">摄影</h1>
    <n-spin :show="loading">
      <div class="photo-grid">
        <div
          v-for="(img, i) in images"
          :key="img.id"
          class="photo-item"
          @click="openLightbox(i)"
        >
          <img :src="img.url" :alt="img.filename" loading="lazy" />
        </div>
      </div>
      <n-empty v-if="!loading && images.length === 0" description="暂无照片" style="margin-top:60px" />
    </n-spin>

    <vue-easy-lightbox
      :visible="lightboxVisible"
      :imgs="lightboxImgs"
      :index="lightboxIndex"
      @hide="lightboxVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import VueEasyLightbox from 'vue-easy-lightbox'
import { uploadApi } from '../../api/upload'

const loading = ref(false)
const images = ref<any[]>([])
const lightboxVisible = ref(false)
const lightboxIndex = ref(0)
const lightboxImgs = computed(() => images.value.map(img => ({ src: img.url, title: img.filename })))

function openLightbox(i: number) {
  lightboxIndex.value = i
  lightboxVisible.value = true
}

const MOCK_IMAGES = [
  { id: 1, url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80', filename: '山脉晨光' },
  { id: 2, url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80', filename: '绿野仙踪' },
  { id: 3, url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80', filename: '湖光山色' },
  { id: 4, url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80', filename: '秋林小径' },
  { id: 5, url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80', filename: '瀑布飞流' },
  { id: 6, url: 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=800&q=80', filename: '雪山倒影' },
  { id: 7, url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80', filename: '海岸礁石' },
  { id: 8, url: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80', filename: '云海日出' },
  { id: 9, url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&q=80', filename: '星空夜景' },
]

onMounted(async () => {
  loading.value = true
  try {
    const res = await uploadApi.list()
    images.value = res.data.data
  } catch {
    images.value = MOCK_IMAGES
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 60px 24px 80px; }
.photo-grid {
  columns: 3 280px;
  gap: 16px;
}
.photo-item {
  break-inside: avoid;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}
.photo-item img {
  width: 100%;
  display: block;
  transition: transform 0.3s;
}
.photo-item:hover img { transform: scale(1.03); }
</style>

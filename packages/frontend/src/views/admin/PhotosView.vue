<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <span style="opacity:0.6">共 {{ images.length }} 张图片</span>
      <n-upload
        :custom-request="handleUpload"
        accept="image/*"
        :show-file-list="false"
        multiple
      >
        <n-button type="primary">上传图片</n-button>
      </n-upload>
    </div>

    <div class="photo-grid">
      <div v-for="img in images" :key="img.id" class="photo-item">
        <img :src="img.url" :alt="img.filename" />
        <div class="overlay">
          <n-button size="small" type="error" @click="remove(img)">删除</n-button>
          <n-button size="small" @click="copyUrl(img.url)">复制链接</n-button>
        </div>
        <div class="filename">{{ img.filename }}</div>
      </div>
    </div>

    <n-empty v-if="!loading && images.length === 0" description="暂无图片" style="margin-top:60px" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage, type UploadCustomRequestOptions } from 'naive-ui'
import { uploadApi } from '../../api/upload'

const message = useMessage()
const images = ref<any[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await uploadApi.list()
    images.value = res.data.data
  } finally { loading.value = false }
}

async function handleUpload({ file, onFinish, onError }: UploadCustomRequestOptions) {
  try {
    await uploadApi.upload(file.file as File)
    message.success(`${file.name} 上传成功`)
    onFinish()
    load()
  } catch {
    message.error(`${file.name} 上传失败`)
    onError()
  }
}

async function remove(img: any) {
  await uploadApi.remove(img.id)
  message.success('已删除')
  load()
}

function copyUrl(url: string) {
  navigator.clipboard.writeText(url)
  message.success('链接已复制')
}

onMounted(load)
</script>

<style scoped>
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.photo-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(128,128,128,0.08);
}
.photo-item img { width: 100%; height: 160px; object-fit: cover; display: block; }
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.photo-item:hover .overlay { opacity: 1; }
.filename {
  padding: 6px 8px;
  font-size: 12px;
  opacity: 0.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<template>
  <div class="editor-page">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <n-button text @click="$router.push('/admin/posts')">← 返回列表</n-button>
      <n-space>
        <n-select v-model:value="form.status" :options="statusOptions" style="width:120px" />
        <n-button @click="save('draft')">保存草稿</n-button>
        <n-button type="primary" :loading="saving" @click="save()">发布</n-button>
      </n-space>
    </div>

    <n-input v-model:value="form.title" placeholder="文章标题" size="large"
      style="font-size:24px;font-weight:600;margin-bottom:16px" />

    <n-grid :cols="3" :x-gap="16" style="margin-bottom:16px">
      <n-gi>
        <n-input v-model:value="form.slug" placeholder="URL slug" />
      </n-gi>
      <n-gi>
        <n-select v-model:value="form.category" :options="catOptions" placeholder="分类" />
      </n-gi>
      <n-gi>
        <n-select v-model:value="form.tags" :options="tagOptions" multiple placeholder="标签" />
      </n-gi>
    </n-grid>

    <n-input v-model:value="form.excerpt" type="textarea" placeholder="摘要（可选）"
      :rows="2" style="margin-bottom:16px" />

    <n-input v-model:value="form.cover_image" placeholder="封面图片 URL（可选）"
      style="margin-bottom:16px" />

    <div class="editor-wrap">
      <TiptapEditor v-model="form.content" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { postsApi } from '../../api/posts'
import TiptapEditor from '../../components/editor/TiptapEditor.vue'
import client from '../../api/client'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const saving = ref(false)
const tagOptions = ref<any[]>([])

const form = ref({
  title: '',
  slug: '',
  excerpt: '',
  cover_image: '',
  content: '',
  status: 'published',
  category: 'essay',
  tags: [] as number[],
})

const statusOptions = [
  { label: '已发布', value: 'published' },
  { label: '草稿', value: 'draft' },
  { label: '已归档', value: 'archived' },
]
const catOptions = [
  { label: '随笔', value: 'essay' },
  { label: '日记', value: 'diary' },
  { label: '旅行', value: 'travel' },
  { label: '摄影', value: 'photo' },
]

async function loadTags() {
  const res = await client.get('/tags')
  tagOptions.value = res.data.data.map((t: any) => ({ label: t.name, value: t.id }))
}

async function loadPost() {
  const id = route.params.id
  if (!id) return
  // fetch by id for admin — use list with admin status
  const res = await postsApi.list({ status: 'all' as any, limit: 1000 })
  const post = res.data.data.posts.find((p: any) => p.id === Number(id))
  if (post) {
    Object.assign(form.value, {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      cover_image: post.cover_image || '',
      content: post.content,
      status: post.status,
      category: post.category,
      tags: post.tags?.map((t: any) => t.id) || [],
    })
  }
}

async function save(forcedStatus?: string) {
  if (!form.value.title.trim() || !form.value.content.trim()) {
    return message.warning('标题和内容不能为空')
  }
  if (!form.value.slug.trim()) {
    form.value.slug = form.value.title.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '')
  }
  saving.value = true
  const payload = { ...form.value, status: forcedStatus || form.value.status }
  try {
    const id = route.params.id
    if (id) {
      await postsApi.update(Number(id), payload)
      message.success('更新成功')
    } else {
      await postsApi.create(payload)
      message.success('发布成功')
      router.push('/admin/posts')
    }
  } catch (e: any) {
    message.error(e.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => { loadTags(); loadPost() })
</script>

<style scoped>
.editor-page { max-width: 900px; margin: 0 auto; }
.editor-wrap { border: 1px solid rgba(128,128,128,0.2); border-radius: 8px; overflow: hidden; min-height: 480px; }
</style>

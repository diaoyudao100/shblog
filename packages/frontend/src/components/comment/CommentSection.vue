<template>
  <div class="container">
    <h1 style="margin-bottom:40px">评论</h1>

    <!-- Comment List -->
    <div v-if="comments.length" class="comment-list">
      <div v-for="c in topLevel" :key="c.id" class="comment-thread">
        <CommentItem :comment="c" />
        <div v-if="replies(c.id).length" class="replies">
          <CommentItem v-for="r in replies(c.id)" :key="r.id" :comment="r" />
        </div>
      </div>
    </div>
    <n-empty v-else description="暂无评论" style="margin:40px 0" />

    <!-- Submit Form -->
    <div class="comment-form">
      <h3>发表评论</h3>
      <template v-if="!auth.user">
        <div style="display:flex;gap:12px;margin-bottom:12px">
          <n-input v-model:value="form.guest_name" placeholder="昵称 *" style="flex:1" />
          <n-input v-model:value="form.guest_email" placeholder="邮箱 *" style="flex:1" />
        </div>
      </template>
      <n-input
        v-model:value="form.content"
        type="textarea"
        placeholder="写下你的评论…"
        :rows="4"
        style="margin-bottom:12px"
      />
      <n-button type="primary" :loading="submitting" @click="submit">提交评论</n-button>
      <p style="font-size:12px;opacity:0.5;margin-top:8px">评论需审核后显示</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { commentsApi } from '../../api/comments'
import { useAuthStore } from '../../stores/auth'
import CommentItem from './CommentItem.vue'

const props = defineProps<{ postId: number }>()
const auth = useAuthStore()
const message = useMessage()
const comments = ref<any[]>([])
const submitting = ref(false)
const form = ref({ content: '', guest_name: '', guest_email: '' })

const topLevel = computed(() => comments.value.filter(c => !c.parent_id))
const replies = (parentId: number) => comments.value.filter(c => c.parent_id === parentId)

async function load() {
  const res = await commentsApi.list(props.postId)
  comments.value = res.data.data
}

async function submit() {
  if (!form.value.content.trim()) return message.warning('请填写评论内容')
  submitting.value = true
  try {
    await commentsApi.submit(props.postId, form.value)
    message.success('评论已提交，等待审核')
    form.value = { content: '', guest_name: '', guest_email: '' }
  } catch (e: any) {
    message.error(e.response?.data?.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.container { margin-top: 60px; padding-top: 40px; border-top: 1px solid rgba(128,128,128,0.15); }
.comment-list { margin-bottom: 48px; }
.comment-thread { margin-bottom: 16px; }
.replies { margin-left: 48px; margin-top: 8px; }
.comment-form { background: rgba(128,128,128,0.05); border-radius: 12px; padding: 24px; }
.comment-form h3 { margin: 0 0 16px; font-size: 16px; }
</style>

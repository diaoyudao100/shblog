<template>
  <div class="comment-item">
    <n-avatar :size="36" round style="flex-shrink:0">
      {{ displayName.charAt(0).toUpperCase() }}
    </n-avatar>
    <div class="body">
      <div class="header">
        <span class="name">{{ displayName }}</span>
        <span class="date">{{ dayjs(comment.created_at).format('YYYY-MM-DD HH:mm') }}</span>
      </div>
      <p class="content">{{ comment.content }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
const props = defineProps<{ comment: any }>()
const displayName = props.comment.username || props.comment.guest_name || '匿名'
</script>

<style scoped>
.comment-item { display: flex; gap: 12px; padding: 12px 0; }
.body { flex: 1; }
.header { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.name { font-weight: 600; font-size: 14px; }
.date { font-size: 12px; opacity: 0.45; }
.content { margin: 0; font-size: 14px; line-height: 1.7; opacity: 0.85; }
</style>

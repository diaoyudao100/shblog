<template>
  <div class="auth-page">
    <n-card class="auth-card" title="登录">
      <n-form @submit.prevent="submit">
        <n-form-item label="邮箱">
          <n-input v-model:value="form.email" type="email" placeholder="your@email.com" />
        </n-form-item>
        <n-form-item label="密码">
          <n-input v-model:value="form.password" type="password" placeholder="密码" />
        </n-form-item>
        <n-button type="primary" :loading="loading" attr-type="submit" block>登录</n-button>
      </n-form>
      <div style="text-align:center;margin-top:16px;font-size:14px;opacity:0.6">
        没有账号？<router-link to="/register">注册</router-link>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const message = useMessage()
const auth = useAuthStore()
const loading = ref(false)
const form = ref({ email: '', password: '' })

async function submit() {
  if (!form.value.email || !form.value.password) return message.warning('请填写完整信息')
  loading.value = true
  try {
    const user = await auth.login(form.value.email, form.value.password)
    message.success('登录成功')
    router.push('/')
  } catch (e: any) {
    message.error(e.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 64px); padding: 24px; }
.auth-card { width: 100%; max-width: 400px; }
</style>

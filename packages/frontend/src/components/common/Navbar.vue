<template>
  <n-layout-header bordered style="position:fixed;top:0;width:100%;z-index:100;height:64px">
    <div class="nav-inner">
      <router-link to="/" class="logo">{{ site.settings.site_name }}</router-link>
      <div class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/archive">归档</router-link>
        <router-link to="/tags">标签</router-link>
        <router-link to="/photos">摄影</router-link>
        <router-link to="/about">关于</router-link>
      </div>
      <div class="nav-actions">
        <n-button text @click="ui.toggleDark()" style="font-size:20px">
          {{ ui.dark ? '☀️' : '🌙' }}
        </n-button>
        <template v-if="auth.user">
          <n-button v-if="auth.user.role === 'admin'" text tag="a" href="/admin">后台</n-button>
          <n-button text @click="auth.logout()">退出</n-button>
        </template>
        <template v-else>
          <router-link to="/login"><n-button size="small">登录</n-button></router-link>
        </template>
      </div>
    </div>
  </n-layout-header>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth'
import { useUiStore } from '../../stores/ui'
import { useSiteStore } from '../../stores/site'
const auth = useAuthStore()
const ui = useUiStore()
const site = useSiteStore()
</script>

<style scoped>
.nav-inner {
  display: flex;
  align-items: center;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  gap: 32px;
}
.logo {
  font-size: 22px;
  font-weight: 700;
  text-decoration: none;
  color: inherit;
  letter-spacing: -0.5px;
}
.nav-links {
  display: flex;
  gap: 24px;
  flex: 1;
}
.nav-links a {
  text-decoration: none;
  color: inherit;
  font-size: 15px;
  opacity: 0.75;
  transition: opacity 0.2s;
}
.nav-links a:hover, .nav-links a.router-link-active { opacity: 1; }
.nav-actions { display: flex; gap: 12px; align-items: center; }
</style>

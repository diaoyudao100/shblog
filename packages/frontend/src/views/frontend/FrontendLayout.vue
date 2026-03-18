<template>
  <n-layout style="min-height: 100vh">
    <Navbar />
    <n-layout-content style="padding-top: 64px">
      <router-view />
    </n-layout-content>
    <Footer />
  </n-layout>
</template>

<script setup lang="ts">
import Navbar from '../../components/common/Navbar.vue'
import Footer from '../../components/common/Footer.vue'
import { useAuthStore } from '../../stores/auth'
import { useSiteStore } from '../../stores/site'
import { onMounted } from 'vue'

const auth = useAuthStore()
const site = useSiteStore()
onMounted(() => {
  auth.fetchMe()
  site.fetchSettings()
})
</script>

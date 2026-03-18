<template>
  <n-config-provider :theme="theme" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <n-dialog-provider>
        <router-view />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { NConfigProvider, NMessageProvider, NDialogProvider, darkTheme, zhCN, dateZhCN } from 'naive-ui'
import { useUiStore } from './stores/ui'
import { useSiteStore } from './stores/site'

const ui = useUiStore()
const site = useSiteStore()
const theme = computed(() => ui.dark ? darkTheme : null)
onMounted(() => site.fetchSettings())
</script>

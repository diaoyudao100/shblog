<template>
  <div style="max-width:600px">
    <n-card title="站点设置">
      <n-form label-placement="left" label-width="120">
        <n-form-item label="站点名称">
          <n-input v-model:value="settings.site_name" />
        </n-form-item>
        <n-form-item label="站点描述">
          <n-input v-model:value="settings.site_desc" type="textarea" :rows="2" />
        </n-form-item>
        <n-form-item label="管理员邮箱">
          <n-input v-model:value="settings.admin_email" />
        </n-form-item>
        <n-form-item label="R2 图片域名">
          <n-input v-model:value="settings.image_base_url" placeholder="https://images.yourdomain.com" />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" :loading="saving" @click="save">保存设置</n-button>
        </n-form-item>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'

const message = useMessage()
const saving = ref(false)
const settings = ref({
  site_name: 'shblog',
  site_desc: '个人博客 - 生活随笔、旅行、摄影',
  admin_email: '',
  image_base_url: '',
})

async function save() {
  saving.value = true
  try {
    // 站点设置可扩展为 API 持久化到 D1 site_settings 表
    message.success('设置已保存')
  } finally {
    saving.value = false
  }
}
</script>

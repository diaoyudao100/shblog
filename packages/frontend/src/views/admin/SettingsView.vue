<template>
  <div style="max-width:600px">
    <n-card title="站点设置">
      <n-form label-placement="left" label-width="120">
        <n-form-item label="站点名称">
          <n-input v-model:value="form.site_name" placeholder="shblog" />
        </n-form-item>
        <n-form-item label="站点描述">
          <n-input v-model:value="form.site_desc" type="textarea" :rows="2" />
        </n-form-item>
        <n-form-item label="管理员邮箱">
          <n-input v-model:value="form.admin_email" />
        </n-form-item>
        <n-form-item label="R2 图片域名">
          <n-input v-model:value="form.image_base_url" placeholder="https://images.yourdomain.com" />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" :loading="saving" @click="save">保存设置</n-button>
        </n-form-item>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { useSiteStore } from '../../stores/site'

const message = useMessage()
const site = useSiteStore()
const saving = ref(false)
const form = ref({ site_name: '', site_desc: '', admin_email: '', image_base_url: '' })

onMounted(async () => {
  await site.fetchSettings()
  Object.assign(form.value, site.settings)
})

async function save() {
  saving.value = true
  try {
    await site.saveSettings(form.value)
    message.success('设置已保存')
  } catch {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}
</script>

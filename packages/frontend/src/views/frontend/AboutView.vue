<template>
  <div class="container">
    <div class="about-card">
      <n-avatar :size="120" round style="margin-bottom:24px" />
      <h1>你好，我是 sh</h1>
      <p class="bio">热爱生活、旅行和摄影。这里是我记录思考与故事的地方。</p>
      <div class="links">
        <n-button text tag="a" href="mailto:hello@example.com">✉️ 联系我</n-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container { max-width: 600px; margin: 0 auto; padding: 80px 24px; }
.about-card { text-align: center; }
h1 { font-size: 32px; font-weight: 700; margin: 0 0 16px; }
.bio { font-size: 16px; opacity: 0.65; line-height: 1.8; margin: 0 0 32px; }
.links { display: flex; gap: 16px; justify-content: center; }
</style>

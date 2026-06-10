<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import PageContainer from './PageContainer.vue'
</script>

<template>
  <div class="app-layout">
    <Sidebar />
    <PageContainer>
      <slot />
    </PageContainer>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(17, 24, 39, 0.06), transparent 28%),
    linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
}
</style>

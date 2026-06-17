<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import PageContainer from './PageContainer.vue'
</script>

<template>
  <div class="flex min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(17,24,39,0.06),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
    <Sidebar />
    <PageContainer>
      <slot />
    </PageContainer>
  </div>
</template>

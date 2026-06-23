<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import PageContainer from './PageContainer.vue'

const menuOpen = ref(false)
</script>

<template>
  <div class="flex min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(17,24,39,0.06),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
    <!-- Backdrop -->
    <div
      v-if="menuOpen"
      class="fixed inset-0 bg-black/50 z-200 md:hidden"
      @click="menuOpen = false"
    />

    <Sidebar :open="menuOpen" @close="menuOpen = false" />

    <div class="flex flex-col flex-1 min-w-0">
      <!-- Mobile header -->
      <header class="flex items-center gap-3 px-4 h-14 bg-gray-900 text-white md:hidden shrink-0">
        <button
          class="text-2xl text-gray-300 hover:text-white border-0 bg-transparent cursor-pointer leading-none"
          type="button"
          @click="menuOpen = true"
        >
          ☰
        </button>
        <span class="font-bold">AECB</span>
      </header>

      <PageContainer>
        <slot />
      </PageContainer>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<template>
  <main class="page-container">
    <slot />
  </main>
</template>

<style scoped>
.page-container {
  flex: 1;
  padding: 24px;
  min-width: 0;
}
</style>
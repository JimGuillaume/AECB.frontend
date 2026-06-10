<script setup lang="ts">
import { ref, onMounted } from 'vue'
import HandsonTable from '@/components/handson_table/handson_table.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { get } from '@/services/api'
import type { User } from '@/types/user'

const data = ref<User[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    data.value = (await get('/get_users.php')) as User[]
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppLayout>
    <div class="worker-view">
      <h1 class="worker-view__title">Workers</h1>
      <HandsonTable :data="data" :hidden-keys="['id']" :loading="loading" :error="error" />
    </div>
  </AppLayout>
</template>

<style scoped>
.worker-view {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.worker-view__title {
  margin: 0;
  font-size: 1.75rem;
  color: #111827;
}
</style>

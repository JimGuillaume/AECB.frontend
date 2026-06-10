<script setup lang="ts">
import { computed } from 'vue'
import { HotTable } from '@handsontable/vue3'
import { registerAllModules } from 'handsontable/registry'
import 'handsontable/styles/handsontable.min.css'
import 'handsontable/styles/ht-theme-main.min.css'

registerAllModules()

const props = defineProps<{
  data: Record<string, unknown>[]
  hiddenKeys?: string[]
  loading?: boolean
  error?: string | null
}>()


//Get -> Nom collonnes 
const visibleKeys = computed(() => {
  const first = props.data[0]
  if (!first) return []
  return Object.keys(first).filter(k => !props.hiddenKeys?.includes(k))
})

const colHeaders = computed(() => visibleKeys.value)

const columns = computed(() =>
  visibleKeys.value.map(k => ({ data: k }))
)
</script>

<template>
  <div class="table-wrapper">
    <div v-if="props.loading" class="table-state">Chargement…</div>
    <div v-else-if="props.error" class="table-state table-state--error">{{ props.error }}</div>

    <HotTable
      v-else
      :data="props.data"
      :col-headers="colHeaders"
      :columns="columns"
      :row-headers="true"
      :read-only="true"
      :stretch-h="'all'"
      :height="400"
      license-key="non-commercial-and-evaluation"
    />
  </div>
</template>

<style scoped>
.table-wrapper {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(17, 24, 39, 0.06);
}

.table-state {
  padding: 32px;
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;
}

.table-state--error {
  color: #dc2626;
}
</style>

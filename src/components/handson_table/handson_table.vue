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
  <div class="w-full rounded-xl overflow-hidden border border-gray-200 shadow-[0_4px_12px_rgba(17,24,39,0.06)]">
    <div v-if="props.loading" class="p-8 text-center text-gray-500 text-[0.95rem]">Chargement…</div>
    <div v-else-if="props.error" class="p-8 text-center text-[0.95rem] text-red-600">{{ props.error }}</div>

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

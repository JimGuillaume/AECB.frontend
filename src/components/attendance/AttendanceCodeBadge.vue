<script setup lang="ts">
import { computed } from 'vue'
import { useAttendanceCodes } from '@/composables/useAttendanceCodes'

const props = defineProps<{
  code: string
  size?: 'sm' | 'md' | 'lg'
}>()

const { getLabel, getColor } = useAttendanceCodes()

const label = computed(() => getLabel(props.code))
const color = computed(() => getColor(props.code))

const padding = computed(() => {
  return props.size === 'sm' ? '4px 8px' : props.size === 'lg' ? '8px 12px' : '6px 10px'
})
</script>

<template>
  <span
    class="inline-block rounded-full text-white font-semibold text-[0.85rem]"
    :style="{ backgroundColor: color, padding }"
  >{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getAttendanceLabel, getAttendanceColor } from '@/utils/attendanceCodes'

const props = defineProps<{
  code: string
  size?: 'sm' | 'md' | 'lg'
}>()

const label = computed(() => getAttendanceLabel(props.code))
const color = computed(() => getAttendanceColor(props.code))

const padding = computed(() => {
  return props.size === 'sm' ? '4px 8px' : props.size === 'lg' ? '8px 12px' : '6px 10px'
})
</script>

<template>
  <span class="badge" :style="{ backgroundColor: color, padding }">{{ label }}</span>
</template>

<style scoped>
.badge {
  display: inline-block;
  border-radius: 9999px;
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
}
</style>

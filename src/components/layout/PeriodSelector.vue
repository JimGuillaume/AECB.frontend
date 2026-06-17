<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  year: number
  month: number
  label: string
  title: string
  description: string
}>()

const emit = defineEmits<{
  'update:year': [value: number]
  'update:month': [value: number]
}>()

const currentYear = new Date().getFullYear()

const monthOptions = [
  { value: 1,  label: 'Janvier' },
  { value: 2,  label: 'Février' },
  { value: 3,  label: 'Mars' },
  { value: 4,  label: 'Avril' },
  { value: 5,  label: 'Mai' },
  { value: 6,  label: 'Juin' },
  { value: 7,  label: 'Juillet' },
  { value: 8,  label: 'Août' },
  { value: 9,  label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' },
]

const yearOptions = computed(() =>
  Array.from({ length: 6 }, (_, i) => currentYear - i),
)
</script>

<template>
  <section
    class="flex items-end justify-between gap-4 p-6 rounded-3xl bg-[linear-gradient(135deg,#111827_0%,#1f2937_100%)] text-gray-50 shadow-[0_20px_50px_rgba(17,24,39,0.18)]"
  >
    <div>
      <p class="m-0 mb-2 uppercase tracking-[0.12em] text-[0.75rem] text-gray-400">{{ label }}</p>
      <h1 class="m-0 text-[clamp(1.6rem,3vw,2.4rem)]">{{ title }}</h1>
      <p class="mt-2.5 mb-0 text-gray-300">{{ description }}</p>
    </div>

    <div class="flex gap-3 flex-wrap">
      <label class="flex flex-col gap-2 min-w-35 text-[0.85rem] text-gray-300">
        <span>Mois</span>
        <select
          :value="month"
          class="px-3 py-2.5 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(156,155,155,0.384)] text-white font-[inherit] focus:outline-none focus:border-[rgba(255,255,255,0.35)] focus:shadow-[0_0_0_4px_rgba(255,255,255,0.08)]"
          @change="emit('update:month', +($event.target as HTMLSelectElement).value)"
        >
          <option v-for="opt in monthOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </label>

      <label class="flex flex-col gap-2 min-w-35 text-[0.85rem] text-gray-300">
        <span>Année</span>
        <select
          :value="year"
          class="px-3 py-2.5 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(156,155,155,0.384)] text-white font-[inherit] focus:outline-none focus:border-[rgba(255,255,255,0.35)] focus:shadow-[0_0_0_4px_rgba(255,255,255,0.08)]"
          @change="emit('update:year', +($event.target as HTMLSelectElement).value)"
        >
          <option v-for="opt in yearOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </label>
    </div>
  </section>
</template>

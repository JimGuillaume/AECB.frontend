import { ref } from 'vue'

//Les fonctions envoie un useAsync(true) quand elles doivent charger des
//infos
export function useAsync(initialLoading = false) {
  const loading = ref(initialLoading)
  const error = ref<string | null>(null)

  async function run(fn: () => Promise<void>) {
    loading.value = true
    error.value = null
    try {
      await fn()
    } catch (e: any) {
      error.value = e?.message ?? 'Erreur de chargement'
    } finally {
      loading.value = false
    }
  }

  return { loading, error, run }
}

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { ApiError } from '@/services/api'
import type { Credentials } from '@/types/auth'

const ERROR_MESSAGES: Record<number, string> = {
  401: 'Email ou mot de passe incorrect.',
  422: 'Veuillez renseigner votre email et votre mot de passe.',
  429: 'Trop de tentatives. Veuillez réessayer dans quelques instants.',
  500: 'Une erreur serveur est survenue. Veuillez réessayer plus tard.',
}

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleSubmit() {
    errorMessage.value = ''
    successMessage.value = ''
    loading.value = true

    try {
        const credentials: Credentials = {
            email: email.value,
            password: password.value,
        }

        const response = await authStore.login(credentials)

        successMessage.value = response.message ?? 'Login Successful'

        email.value = ''
        password.value = ''

        const redirect = (router.currentRoute.value.query.redirect as string) || '/dashboard'
        await router.push(redirect)
    }
    catch (error) {
        if (error instanceof ApiError) {
            errorMessage.value = ERROR_MESSAGES[error.status] ?? 'Une erreur est survenue. Veuillez réessayer.'
        } else {
            errorMessage.value = 'Impossible de contacter le serveur. Vérifiez votre connexion.'
        }
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <main class="min-h-screen flex items-center justify-center p-6 sm:p-4 bg-[radial-gradient(circle_at_top_left,rgba(17,24,39,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(229,231,235,0.9),transparent_26%),linear-gradient(180deg,#f9fafb_0%,#eef2f7_100%)]">
        <form
            class="w-full max-w-105 sm:max-w-full flex flex-col gap-3.5 p-7 sm:p-6 rounded-[20px] border border-gray-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.14)] text-gray-900 relative overflow-hidden before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-1.5 before:bg-[linear-gradient(90deg,#111827_0%,#374151_100%)]"
            @submit.prevent="handleSubmit"
        >
            <h1 class="mt-2.5 mb-0 text-[1.6rem] text-gray-900">Connexion</h1>

            <label class="flex flex-col gap-2 font-semibold text-gray-700">
                Email
                <input
                    v-model="email"
                    type="email"
                    autocomplete="email"
                    required
                    placeholder="email@aecb.be"
                    class="px-3.5 py-3 rounded-xl border border-gray-300 bg-gray-50 font-[inherit] text-gray-900 transition-[border-color,box-shadow,background-color] duration-200 ease-in-out placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(17,24,39,0.08)]"
                />
            </label>

            <label class="flex flex-col gap-2 font-semibold text-gray-700">
                Password
                <input
                    v-model="password"
                    type="password"
                    autocomplete="current-password"
                    required
                    placeholder="Mot de Passe"
                    class="px-3.5 py-3 rounded-xl border border-gray-300 bg-gray-50 font-[inherit] text-gray-900 transition-[border-color,box-shadow,background-color] duration-200 ease-in-out placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(17,24,39,0.08)]"
                />
            </label>

            <p v-if="errorMessage" class="text-red-700 m-0 text-[0.95rem]">{{ errorMessage }}</p>
            <p v-if="successMessage" class="text-green-700 m-0 text-[0.95rem]">{{ successMessage }}</p>

            <button
                type="submit"
                :disabled="loading"
                class="px-3.5 py-3 border-0 rounded-xl bg-gray-900 text-white font-bold cursor-pointer transition-[transform,background-color,opacity] duration-200 ease-in-out hover:enabled:bg-[#0f172a] hover:enabled:-translate-y-px disabled:opacity-70 disabled:cursor-wait"
            >
                {{ loading ? 'Connexion en cours' : 'Connexion' }}
            </button>
        </form>
    </main>
</template>

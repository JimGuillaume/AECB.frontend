<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import type { Credentials } from '@/types/auth'

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
        errorMessage.value = error instanceof Error ? error.message : 'Login Failed'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <main class="login-page">
        <form class="login-card" @submit.prevent="handleSubmit">
            <h1>Connexion</h1>

            <label>
                Email
                <input
                    v-model="email"
                    type="email"
                    autocomplete="email"
                    required
                    placeholder="email@aecb.be"
                />
            </label>

            <label>
                Password
                <input
                    v-model="password"
                    type="password"
                    autocomplete="current-password"
                    required
                    placeholder="Mot de Passe"
                />
            </label>

            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
            <p v-if="successMessage" class="success">{{ successMessage }}</p>

            <button type="submit" :disabled="loading">
                {{ loading ? 'Connexion en cours' : 'Connexion' }}
            </button>
        </form>
    </main>
</template>

<style scoped>

.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background:
        radial-gradient(circle at top left, rgba(17, 24, 39, 0.08), transparent 30%),
        radial-gradient(circle at bottom right, rgba(229, 231, 235, 0.9), transparent 26%),
        linear-gradient(180deg, #f9fafb 0%, #eef2f7 100%);
}

.login-card {
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 28px;
    border-radius: 20px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.14);
    color: #111827;
    position: relative;
    overflow: hidden;
}

.login-card::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 6px;
    background: linear-gradient(90deg, #111827 0%, #374151 100%);
}

.login-card h1 {
    margin: 10px 0 0;
    font-size: 1.6rem;
    color: #111827;
}

label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-weight: 600;
    color: #374151;
}

input {
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid #d1d5db;
    background: #f9fafb;
    font: inherit;
    color: #111827;
    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        background-color 0.2s ease;
}

input::placeholder {
    color: #9ca3af;
}

input:focus {
    outline: none;
    border-color: #9ca3af;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.08);
}

button {
    padding: 12px 14px;
    border: 0;
    border-radius: 12px;
    background: #111827;
    color: white;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease, background-color 0.2s ease, opacity 0.2s ease;
}

button:hover:not(:disabled) {
    background: #0f172a;
    transform: translateY(-1px);
}

button:disabled {
    opacity: 0.7;
    cursor: wait;
}

.error {
    color: #b91c1c;
    margin: 0;
    font-size: 0.95rem;
}

.success {
    color: #15803d;
    margin: 0;
    font-size: 0.95rem;
}

@media (max-width: 640px) {
    .login-page {
        padding: 16px;
    }

    .login-card {
        max-width: 100%;
        padding: 24px;
    }
}
</style>

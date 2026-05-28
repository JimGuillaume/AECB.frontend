<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const API_BASE_URL = 'http://127.0.0.1:8000'

async function handleSubmit() {
    errorMessage.value = ''
    successMessage.value = ''
    loading.value = true

    try {
        const response = await fetch(`${API_BASE_URL}/login.php`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type' : 'application/json',
                                        },
                                        credentials: 'include',
                                        body: JSON.stringify({
                                            email: email.value,
                                            password: password.value,
                                        }),
                                    })
        const data = await response.json().catch(() => null)

        if (!response.ok) {
            errorMessage.value = data?.message ?? 'Login Failed'
            return
        }

        successMessage.value = data?.message ?? 'Login Successful'

        email.value = ''
        password.value = ''

        router.push('/dashboard')
    }
        catch {
            errorMessage.value = 'Error A1'
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


</style>

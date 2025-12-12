<template>
  <div class="container mx-auto px-4 py-12 max-w-md">
    <div class="card">
      <h1 class="text-2xl font-bold mb-6 text-center">Login to Vintage Vinyl</h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input v-model="email" type="email" required class="input" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <input v-model="password" type="password" required class="input" />
        </div>

        <button type="submit" :disabled="loading" class="btn btn-primary w-full">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm">
        Don't have an account?
        <router-link to="/register" class="text-primary hover:underline font-medium">
          Register
        </router-link>
      </p>

      <p v-if="error" class="mt-4 text-red-600 text-sm">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  try {
    error.value = '';
    loading.value = true;
    await authStore.login({ email: email.value, password: password.value });
    router.push('/auctions');
  } catch (err) {
    error.value = err.response?.data?.error_message || 'Login failed';
  } finally {
    loading.value = false;
  }
};
</script>

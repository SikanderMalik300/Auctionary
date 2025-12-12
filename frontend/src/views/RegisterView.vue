<template>
  <div class="container mx-auto px-4 py-12 max-w-md">
    <div class="card">
      <h1 class="text-2xl font-bold mb-6 text-center">Register for Vintage Vinyl</h1>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">First Name</label>
          <input v-model="firstName" type="text" required class="input" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Last Name</label>
          <input v-model="lastName" type="text" required class="input" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input v-model="email" type="email" required class="input" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <input v-model="password" type="password" required class="input" />
          <p class="text-xs text-gray-500 mt-1">
            8-40 chars, uppercase, lowercase, number, special char
          </p>
        </div>

        <button type="submit" :disabled="loading" class="btn btn-primary w-full">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm">
        Already have an account?
        <router-link to="/login" class="text-primary hover:underline font-medium">
          Login
        </router-link>
      </p>

      <p v-if="error" class="mt-4 text-red-600 text-sm">{{ error }}</p>
      <p v-if="success" class="mt-4 text-green-600 text-sm">{{ success }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);

const handleRegister = async () => {
  try {
    error.value = '';
    success.value = '';
    loading.value = true;

    await authStore.register({
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      password: password.value,
    });

    success.value = 'Registration successful! Redirecting to login...';
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  } catch (err) {
    error.value = err.response?.data?.error_message || 'Registration failed';
  } finally {
    loading.value = false;
  }
};
</script>

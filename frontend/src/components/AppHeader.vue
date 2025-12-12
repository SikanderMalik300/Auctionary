<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="container mx-auto px-4 py-4">
      <div class="flex justify-between items-center">
        <router-link to="/" class="text-2xl font-bold text-primary flex items-center gap-2">
          <span class="text-3xl">🎵</span>
          <span>Vintage Vinyl Auctions</span>
        </router-link>

        <nav class="flex items-center gap-4">
          <template v-if="!isAuthenticated">
            <router-link to="/login" class="btn btn-secondary">
              Login
            </router-link>
            <router-link to="/register" class="btn btn-primary">
              Register
            </router-link>
          </template>

          <template v-if="isAuthenticated">
            <router-link to="/auctions" class="hover:text-primary transition-colors">
              Browse
            </router-link>
            <router-link to="/create" class="hover:text-primary transition-colors">
              Create Auction
            </router-link>
            <router-link to="/my-auctions" class="hover:text-primary transition-colors">
              My Auctions
            </router-link>
            <button @click="handleLogout" class="btn btn-secondary">
              Logout
            </button>
          </template>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

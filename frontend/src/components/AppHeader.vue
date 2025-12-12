<template>
  <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2">
          <Disc class="h-8 w-8 text-secondary" />
          <span class="font-serif text-xl font-bold text-primary-dark tracking-tight">
            Vintage Vinyl Auctions
          </span>
        </RouterLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex space-x-8 items-center">
          <RouterLink to="/" :class="isActive('/')">Browse</RouterLink>
          <template v-if="authStore.isAuthenticated">
            <RouterLink to="/create" :class="isActive('/create')">Create Auction</RouterLink>
            <RouterLink to="/my-auctions" :class="isActive('/my-auctions')">My Auctions</RouterLink>
            <div class="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
              <span class="text-sm font-medium text-primary">
                Hello, {{ authStore.user?.username || 'User' }}
              </span>
              <button @click="authStore.logout" class="text-sm text-accent hover:text-red-700 font-medium">
                Logout
              </button>
            </div>
          </template>
          <div v-else class="flex items-center gap-4">
            <RouterLink to="/login" class="text-primary hover:text-primary-dark font-medium">Login</RouterLink>
            <RouterLink to="/register" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-sm">
              Register
            </RouterLink>
          </div>
        </nav>

        <!-- Mobile Menu Button -->
        <button @click="isMenuOpen = !isMenuOpen" class="md:hidden text-gray-500 hover:text-primary">
          <component :is="isMenuOpen ? X : Menu" :size="24" />
        </button>
      </div>
    </div>

    <!-- Mobile Nav -->
    <div v-if="isMenuOpen" class="md:hidden bg-white border-t border-gray-100">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <RouterLink to="/" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" @click="isMenuOpen = false">Browse</RouterLink>
        <template v-if="authStore.isAuthenticated">
          <RouterLink to="/create" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" @click="isMenuOpen = false">Create Auction</RouterLink>
          <RouterLink to="/my-auctions" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" @click="isMenuOpen = false">My Auctions</RouterLink>
          <button @click="handleMobileLogout" class="block w-full text-left px-3 py-2 text-accent font-medium">Logout</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="block px-3 py-2 text-primary font-medium" @click="isMenuOpen = false">Login</RouterLink>
          <RouterLink to="/register" class="block px-3 py-2 text-primary font-medium" @click="isMenuOpen = false">Register</RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { Menu, X, Disc } from 'lucide-vue-next';

const authStore = useAuthStore();
const route = useRoute();
const isMenuOpen = ref(false);

const isActive = (path: string) => {
  return route.path === path ? 'text-secondary font-semibold' : 'text-gray-600 hover:text-primary';
};

const handleMobileLogout = () => {
  authStore.logout();
  isMenuOpen.value = false;
};
</script>

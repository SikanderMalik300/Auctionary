<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    <main>
      <RouterView />
    </main>
    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
        <p>🎵 Vintage Vinyl Auctions - Full Stack Web Development Assignment 2025/26</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue';
import { RouterView } from 'vue-router';
</script>

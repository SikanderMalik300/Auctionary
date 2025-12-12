<template>
  <form @submit.prevent="handleSubmit" class="w-full max-w-3xl mx-auto flex flex-col sm:flex-row gap-2">
    <div class="relative flex-grow">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search class="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary shadow-sm text-sm"
        placeholder="Search for vinyls, artists, memorabilia..."
        v-model="query"
      />
    </div>

    <select
      v-model="categoryId"
      class="block w-full sm:w-48 pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg shadow-sm"
    >
      <option value="">All Categories</option>
      <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
    </select>

    <div class="flex gap-2">
      <button
        type="submit"
        class="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-sm whitespace-nowrap"
      >
        Search
      </button>
      <button
        v-if="query || categoryId"
        type="button"
        @click="handleClear"
        class="bg-white text-gray-700 border border-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
      >
        Clear
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Search } from 'lucide-vue-next';
import { api } from '../services/api';
import type { Category } from '../types';

interface Emits {
  (e: 'search', query: string, categoryId: string): void;
}

const emit = defineEmits<Emits>();

const query = ref('');
const categoryId = ref('');
const categories = ref<Category[]>([]);

onMounted(async () => {
  try {
    categories.value = await api.getCategories();
  } catch (error) {
    console.error('Failed to fetch categories', error);
  }
});

function handleSubmit() {
  emit('search', query.value, categoryId.value);
}

function handleClear() {
  query.value = '';
  categoryId.value = '';
  emit('search', '', '');
}
</script>

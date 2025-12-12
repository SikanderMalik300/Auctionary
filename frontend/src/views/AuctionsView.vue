<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-4">Vintage Vinyl Auctions</h1>

      <div class="flex gap-4 flex-wrap">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search vinyl records..."
          class="input flex-1 min-w-[200px]"
          @keyup.enter="search"
        />

        <select v-model="selectedCategory" class="input w-64" @change="search">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat.category_id" :value="cat.category_id">
            {{ cat.name }}
          </option>
        </select>

        <button @click="search" class="btn btn-primary">
          Search
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-600">Loading auctions...</p>
    </div>

    <div v-else-if="items.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AuctionCard v-for="item in items" :key="item.item_id" :item="item" />
    </div>

    <div v-else class="text-center py-12 text-gray-500">
      <p class="text-lg">No auctions found</p>
      <p class="text-sm mt-2">Try adjusting your search criteria</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { itemsAPI, categoriesAPI } from '@/services/api';
import AuctionCard from '@/components/AuctionCard.vue';

const items = ref([]);
const categories = ref([]);
const searchQuery = ref('');
const selectedCategory = ref('');
const loading = ref(false);

const search = async () => {
  loading.value = true;
  try {
    const params = {};
    if (searchQuery.value) params.q = searchQuery.value;
    if (selectedCategory.value) params.category = selectedCategory.value;

    const response = await itemsAPI.search(params);
    items.value = response.data;
  } catch (error) {
    console.error('Search failed:', error);
    items.value = [];
  } finally {
    loading.value = false;
  }
};

const loadCategories = async () => {
  try {
    const response = await categoriesAPI.getAll();
    categories.value = response.data;
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
};

onMounted(() => {
  search();
  loadCategories();
});
</script>

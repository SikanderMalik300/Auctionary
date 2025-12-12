<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">My Auctions</h1>

    <div class="space-y-8">
      <!-- My Listings -->
      <div class="card">
        <h2 class="text-2xl font-semibold mb-4">My Listings</h2>
        <div v-if="loadingOpen" class="text-center py-8 text-gray-600">Loading...</div>
        <div v-else-if="openItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AuctionCard v-for="item in openItems" :key="item.item_id" :item="item" />
        </div>
        <p v-else class="text-gray-500">You don't have any active listings</p>
      </div>

      <!-- Items I'm Bidding On -->
      <div class="card">
        <h2 class="text-2xl font-semibold mb-4">Items I'm Bidding On</h2>
        <div v-if="loadingBid" class="text-center py-8 text-gray-600">Loading...</div>
        <div v-else-if="bidItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AuctionCard v-for="item in bidItems" :key="item.item_id" :item="item" />
        </div>
        <p v-else class="text-gray-500">You haven't placed any bids yet</p>
      </div>

      <!-- Ended Auctions -->
      <div class="card">
        <h2 class="text-2xl font-semibold mb-4">Ended Auctions</h2>
        <div v-if="loadingArchive" class="text-center py-8 text-gray-600">Loading...</div>
        <div v-else-if="archiveItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AuctionCard v-for="item in archiveItems" :key="item.item_id" :item="item" />
        </div>
        <p v-else class="text-gray-500">No ended auctions</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { itemsAPI } from '@/services/api';
import AuctionCard from '@/components/AuctionCard.vue';

const openItems = ref([]);
const bidItems = ref([]);
const archiveItems = ref([]);
const loadingOpen = ref(true);
const loadingBid = ref(true);
const loadingArchive = ref(true);

const loadOpenItems = async () => {
  try {
    const response = await itemsAPI.search({ status: 'OPEN' });
    openItems.value = response.data;
  } catch (error) {
    console.error('Failed to load open items:', error);
  } finally {
    loadingOpen.value = false;
  }
};

const loadBidItems = async () => {
  try {
    const response = await itemsAPI.search({ status: 'BID' });
    bidItems.value = response.data;
  } catch (error) {
    console.error('Failed to load bid items:', error);
  } finally {
    loadingBid.value = false;
  }
};

const loadArchiveItems = async () => {
  try {
    const response = await itemsAPI.search({ status: 'ARCHIVE' });
    archiveItems.value = response.data;
  } catch (error) {
    console.error('Failed to load archive items:', error);
  } finally {
    loadingArchive.value = false;
  }
};

onMounted(() => {
  loadOpenItems();
  loadBidItems();
  loadArchiveItems();
});
</script>

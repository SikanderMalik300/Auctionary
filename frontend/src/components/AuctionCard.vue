<template>
  <div class="card hover:shadow-lg transition-shadow cursor-pointer" @click="viewDetails">
    <h3 class="text-lg font-semibold mb-2 text-gray-900">{{ item.name }}</h3>
    <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ item.description }}</p>

    <div class="flex justify-between items-center">
      <div>
        <p class="text-xs text-gray-500">Starting Bid</p>
        <p class="text-lg font-bold text-primary">${{ item.starting_bid }}</p>
      </div>

      <div class="text-right">
        <p class="text-xs text-gray-500">Ends</p>
        <p class="text-sm font-medium">{{ formatDate(item.end_date) }}</p>
      </div>
    </div>

    <div class="mt-4 flex items-center text-xs text-gray-500">
      <span>Seller: {{ item.first_name }} {{ item.last_name }}</span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const router = useRouter();

const viewDetails = () => {
  router.push(`/auctions/${props.item.item_id}`);
};

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString();
};
</script>

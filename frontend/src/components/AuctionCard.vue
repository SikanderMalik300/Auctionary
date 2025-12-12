<template>
  <RouterLink :to="`/auction/${item.id}`" class="block group">
    <div class="bg-white rounded-xl border border-border shadow-card hover:shadow-lift transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col overflow-hidden">
      <!-- Image Area -->
      <div class="aspect-square w-full bg-gray-100 relative overflow-hidden">
        <img
          :src="item.imageUrl || `https://picsum.photos/400/400?random=${item.id}`"
          :alt="item.title"
          class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div class="absolute top-2 right-2">
          <span class="bg-secondary text-white text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wide">
            {{ item.categoryName || 'Vinyl' }}
          </span>
        </div>
      </div>

      <div class="p-4 flex flex-col flex-grow">
        <h3 class="text-lg font-semibold text-text group-hover:text-primary transition-colors line-clamp-2 mb-2">
          {{ item.title }}
        </h3>

        <div class="mt-auto pt-4 flex items-end justify-between border-t border-gray-100">
          <div>
            <p class="text-xs text-text-muted mb-1">Current Bid</p>
            <p class="text-xl font-bold text-primary font-sans">${{ price.toFixed(2) }}</p>
          </div>
          <div :class="`flex items-center gap-1 text-sm font-medium ${isExpired ? 'text-red-600' : 'text-success'}`">
            <Clock :size="14" />
            <span>{{ timeLeftText }}</span>
          </div>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Clock } from 'lucide-vue-next';
import type { AuctionItem } from '../types';

interface Props {
  item: AuctionItem;
}

const props = defineProps<Props>();

const timeLeft = computed(() => new Date(props.item.endDate).getTime() - Date.now());
const isExpired = computed(() => timeLeft.value <= 0);

const formatTimeLeft = (ms: number): string => {
  if (ms <= 0) return "Ended";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${hours}h`;
};

const timeLeftText = computed(() => formatTimeLeft(timeLeft.value));
const price = computed(() => props.item.currentBid > 0 ? props.item.currentBid : props.item.startingBid);
</script>

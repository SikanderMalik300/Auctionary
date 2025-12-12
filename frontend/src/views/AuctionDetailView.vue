<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-600">Loading auction details...</p>
    </div>

    <div v-else-if="item" class="space-y-6">
      <!-- Item Details -->
      <div class="card">
        <h1 class="text-3xl font-bold mb-4">{{ item.name }}</h1>
        <p class="text-gray-700 mb-6">{{ item.description }}</p>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p class="text-sm text-gray-500">Starting Bid</p>
            <p class="text-xl font-bold">${{ item.starting_bid }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Current Bid</p>
            <p class="text-xl font-bold text-primary">${{ item.current_bid }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Seller</p>
            <p class="text-sm">{{ item.first_name }} {{ item.last_name }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Ends</p>
            <p class="text-sm">{{ formatDate(item.end_date) }}</p>
          </div>
        </div>

        <div v-if="item.current_bid_holder" class="text-sm text-gray-600">
          Leading bidder: {{ item.current_bid_holder.first_name }} {{ item.current_bid_holder.last_name }}
        </div>
      </div>

      <!-- Bid Form -->
      <div v-if="authStore.isAuthenticated && !isOwnItem" class="card">
        <h2 class="text-xl font-bold mb-4">Place a Bid</h2>
        <form @submit.prevent="placeBid" class="flex gap-2">
          <input
            v-model.number="bidAmount"
            type="number"
            :min="item.current_bid + 1"
            step="0.01"
            required
            class="input flex-1"
            placeholder="Enter bid amount"
          />
          <button type="submit" :disabled="bidLoading" class="btn btn-primary">
            {{ bidLoading ? 'Placing...' : 'Place Bid' }}
          </button>
        </form>
        <p v-if="bidError" class="mt-2 text-red-600 text-sm">{{ bidError }}</p>
        <p v-if="bidSuccess" class="mt-2 text-green-600 text-sm">{{ bidSuccess }}</p>
      </div>

      <div v-else-if="isOwnItem" class="card">
        <p class="text-gray-600">This is your auction listing</p>
      </div>

      <div v-else class="card">
        <p class="text-gray-600">Please <router-link to="/login" class="text-primary hover:underline">login</router-link> to place a bid</p>
      </div>

      <!-- Questions -->
      <div class="card">
        <h2 class="text-xl font-bold mb-4">Questions</h2>

        <!-- Ask Question Form -->
        <form
          v-if="authStore.isAuthenticated && !isOwnItem"
          @submit.prevent="askQuestion"
          class="mb-6"
        >
          <textarea
            v-model="questionText"
            class="input h-20 mb-2"
            placeholder="Ask a question about this vinyl..."
            required
          />
          <button type="submit" :disabled="questionLoading" class="btn btn-primary">
            {{ questionLoading ? 'Asking...' : 'Ask Question' }}
          </button>
          <p v-if="questionError" class="mt-2 text-red-600 text-sm">{{ questionError }}</p>
        </form>

        <!-- Questions List -->
        <div v-if="questions.length > 0" class="space-y-4">
          <div
            v-for="q in questions"
            :key="q.question_id"
            class="border border-gray-200 rounded p-4"
          >
            <p class="font-medium mb-2">
              <span class="text-primary">Q:</span> {{ q.question_text }}
            </p>
            <p v-if="q.answer_text" class="text-gray-700 ml-4">
              <span class="font-medium text-green-600">A:</span> {{ q.answer_text }}
            </p>
            <p v-else class="text-gray-500 text-sm italic ml-4">Not yet answered</p>

            <!-- Answer Form (for seller only) -->
            <form
              v-if="isOwnItem && !q.answer_text"
              @submit.prevent="answerQuestion(q.question_id)"
              class="mt-4 ml-4"
            >
              <textarea
                v-model="answerTexts[q.question_id]"
                class="input h-16 mb-2"
                placeholder="Your answer..."
                required
              />
              <button type="submit" class="btn btn-sm btn-primary">
                Answer
              </button>
            </form>
          </div>
        </div>
        <p v-else class="text-gray-500">No questions yet. Be the first to ask!</p>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-600">Auction not found</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { itemsAPI, bidsAPI, questionsAPI } from '@/services/api';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const authStore = useAuthStore();

const item = ref(null);
const questions = ref([]);
const loading = ref(true);
const bidAmount = ref(0);
const bidError = ref('');
const bidSuccess = ref('');
const bidLoading = ref(false);
const questionText = ref('');
const questionError = ref('');
const questionLoading = ref(false);
const answerTexts = reactive({});

const isOwnItem = computed(() =>
  item.value && authStore.userId &&
  item.value.creator_id.toString() === authStore.userId
);

const loadItem = async () => {
  try {
    const response = await itemsAPI.getById(route.params.id);
    item.value = response.data;
    bidAmount.value = Math.ceil(response.data.current_bid + 1);
  } catch (error) {
    console.error('Failed to load item:', error);
    item.value = null;
  }
};

const loadQuestions = async () => {
  try {
    const response = await questionsAPI.getAll(route.params.id);
    questions.value = response.data;
  } catch (error) {
    console.error('Failed to load questions:', error);
  }
};

const placeBid = async () => {
  try {
    bidError.value = '';
    bidSuccess.value = '';
    bidLoading.value = true;

    await bidsAPI.place(route.params.id, bidAmount.value);

    bidSuccess.value = 'Bid placed successfully!';
    await loadItem();
    bidAmount.value = Math.ceil(item.value.current_bid + 1);

    setTimeout(() => {
      bidSuccess.value = '';
    }, 3000);
  } catch (err) {
    bidError.value = err.response?.data?.error_message || 'Failed to place bid';
  } finally {
    bidLoading.value = false;
  }
};

const askQuestion = async () => {
  try {
    questionError.value = '';
    questionLoading.value = true;

    await questionsAPI.ask(route.params.id, questionText.value);
    questionText.value = '';
    await loadQuestions();
  } catch (err) {
    questionError.value = err.response?.data?.error_message || 'Failed to ask question';
  } finally {
    questionLoading.value = false;
  }
};

const answerQuestion = async (questionId) => {
  try {
    await questionsAPI.answer(questionId, answerTexts[questionId]);
    await loadQuestions();
    delete answerTexts[questionId];
  } catch (err) {
    alert(err.response?.data?.error_message || 'Failed to answer question');
  }
};

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

onMounted(async () => {
  await Promise.all([loadItem(), loadQuestions()]);
  loading.value = false;
});
</script>

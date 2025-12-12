<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Create Auction</h1>
      <button @click="showDrafts = !showDrafts" class="btn btn-secondary">
        📝 Drafts ({{ draftsStore.drafts.length }})
      </button>
    </div>

    <!-- Drafts List -->
    <div v-if="showDrafts" class="card mb-6">
      <h3 class="font-semibold mb-4">Saved Drafts</h3>
      <div v-if="draftsStore.drafts.length > 0" class="space-y-2">
        <div
          v-for="draft in draftsStore.drafts"
          :key="draft.id"
          class="flex justify-between items-center p-3 border border-gray-200 rounded hover:bg-gray-50"
        >
          <div class="flex-1">
            <p class="font-medium">{{ draft.name || 'Untitled' }}</p>
            <p class="text-xs text-gray-500">{{ formatDate(draft.updatedAt) }}</p>
          </div>
          <div class="flex gap-2">
            <button @click="loadDraft(draft)" class="btn btn-sm btn-secondary">
              Load
            </button>
            <button @click="deleteDraft(draft.id)" class="btn btn-sm bg-red-500 text-white hover:bg-red-600">
              Delete
            </button>
          </div>
        </div>
      </div>
      <p v-else class="text-gray-500 text-sm">No drafts saved</p>
    </div>

    <div class="card">
      <form @submit.prevent="createAuction" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Title</label>
          <input
            v-model="form.name"
            @input="autoSaveDraft"
            type="text"
            required
            class="input"
            placeholder="e.g., Pink Floyd - Dark Side of the Moon"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Description</label>
          <textarea
            v-model="form.description"
            @input="autoSaveDraft"
            required
            class="input h-32"
            placeholder="Describe the condition, pressing, special features..."
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Starting Bid ($)</label>
          <input
            v-model.number="form.starting_bid"
            @input="autoSaveDraft"
            type="number"
            min="0"
            step="0.01"
            required
            class="input"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">End Date & Time</label>
          <input
            v-model="endDate"
            @input="autoSaveDraft"
            type="datetime-local"
            required
            class="input"
            :min="minDateTime"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Categories</label>
          <div class="grid grid-cols-2 gap-2">
            <label
              v-for="cat in categories"
              :key="cat.category_id"
              class="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                :value="cat.category_id"
                v-model="form.categories"
                @change="autoSaveDraft"
                class="rounded"
              />
              <span class="text-sm">{{ cat.name }}</span>
            </label>
          </div>
        </div>

        <div v-if="currentDraftId" class="text-xs text-gray-500">
          Auto-saved as draft
        </div>

        <div class="flex gap-2">
          <button type="submit" :disabled="loading" class="btn btn-primary flex-1">
            {{ loading ? 'Creating...' : 'Create Auction' }}
          </button>
          <button type="button" @click="saveAsDraft" class="btn btn-secondary">
            Save Draft
          </button>
        </div>
      </form>

      <p v-if="error" class="mt-4 text-red-600 text-sm">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { itemsAPI, categoriesAPI } from '@/services/api';
import { useDraftsStore } from '@/stores/drafts';

const router = useRouter();
const draftsStore = useDraftsStore();

const form = reactive({
  name: '',
  description: '',
  starting_bid: 0,
  categories: [],
});

const endDate = ref('');
const categories = ref([]);
const showDrafts = ref(false);
const error = ref('');
const loading = ref(false);
const currentDraftId = ref(null);
const autoSaveTimeout = ref(null);

const minDateTime = computed(() => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  return now.toISOString().slice(0, 16);
});

const autoSaveDraft = () => {
  if (autoSaveTimeout.value) {
    clearTimeout(autoSaveTimeout.value);
  }

  autoSaveTimeout.value = setTimeout(() => {
    if (form.name || form.description) {
      const draft = {
        ...form,
        endDate: endDate.value,
        id: currentDraftId.value,
      };
      const saved = draftsStore.saveDraft(draft);
      if (!currentDraftId.value) {
        currentDraftId.value = saved.id;
      }
    }
  }, 1000);
};

const saveAsDraft = () => {
  const draft = {
    ...form,
    endDate: endDate.value,
    id: currentDraftId.value,
  };
  const saved = draftsStore.saveDraft(draft);
  currentDraftId.value = saved.id;
  alert('Draft saved successfully!');
};

const loadDraft = (draft) => {
  form.name = draft.name || '';
  form.description = draft.description || '';
  form.starting_bid = draft.starting_bid || 0;
  form.categories = draft.categories || [];
  endDate.value = draft.endDate || '';
  currentDraftId.value = draft.id;
  showDrafts.value = false;
};

const deleteDraft = (id) => {
  if (confirm('Delete this draft?')) {
    draftsStore.deleteDraft(id);
    if (currentDraftId.value === id) {
      currentDraftId.value = null;
    }
  }
};

const createAuction = async () => {
  try {
    error.value = '';
    loading.value = true;

    const itemData = {
      name: form.name,
      description: form.description,
      starting_bid: form.starting_bid,
      end_date: new Date(endDate.value).getTime(),
    };

    if (form.categories.length > 0) {
      itemData.categories = form.categories;
    }

    await itemsAPI.create(itemData);

    // Delete draft after successful creation
    if (currentDraftId.value) {
      draftsStore.deleteDraft(currentDraftId.value);
    }

    router.push('/auctions');
  } catch (err) {
    error.value = err.response?.data?.error_message || 'Failed to create auction';
  } finally {
    loading.value = false;
  }
};

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

const loadCategories = async () => {
  try {
    const response = await categoriesAPI.getAll();
    categories.value = response.data;
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
};

onMounted(loadCategories);
</script>

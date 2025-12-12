import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Draft {
  title: string;
  description: string;
  startingBid: string;
  endDate: string;
  categoryId: string;
  timestamp: number;
}

export const useDraftsStore = defineStore('drafts', () => {
  const drafts = ref<Record<string, Draft>>({});

  // Load drafts from localStorage
  function loadDrafts() {
    const stored = localStorage.getItem('vv_auction_drafts');
    if (stored) {
      try {
        drafts.value = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse drafts', e);
      }
    }
  }

  // Persist drafts to localStorage
  function persist(newDrafts: Record<string, Draft>) {
    localStorage.setItem('vv_auction_drafts', JSON.stringify(newDrafts));
  }

  function saveDraft(id: string, data: Omit<Draft, 'timestamp'>) {
    drafts.value = {
      ...drafts.value,
      [id]: { ...data, timestamp: Date.now() }
    };
    persist(drafts.value);
  }

  function deleteDraft(id: string) {
    const newDrafts = { ...drafts.value };
    delete newDrafts[id];
    drafts.value = newDrafts;
    persist(newDrafts);
  }

  function loadDraft(id: string): Draft | null {
    return drafts.value[id] || null;
  }

  function getAllDrafts(): { id: string; draft: Draft }[] {
    return Object.entries(drafts.value)
      .map(([id, draft]) => ({ id, draft }))
      .sort((a, b) => b.draft.timestamp - a.draft.timestamp);
  }

  // Initialize on store creation
  loadDrafts();

  return {
    drafts,
    saveDraft,
    deleteDraft,
    loadDraft,
    getAllDrafts
  };
});

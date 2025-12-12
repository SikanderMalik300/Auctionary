import { defineStore } from 'pinia';

export const useDraftsStore = defineStore('drafts', {
  state: () => ({
    drafts: JSON.parse(localStorage.getItem('auction_drafts') || '[]'),
  }),

  actions: {
    saveDraft(draft) {
      const index = this.drafts.findIndex(d => d.id === draft.id);
      const timestamp = Date.now();

      if (index > -1) {
        this.drafts[index] = { ...draft, updatedAt: timestamp };
      } else {
        this.drafts.push({
          ...draft,
          id: draft.id || timestamp,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }
      this.persistDrafts();
      return this.drafts[this.drafts.length - 1];
    },

    deleteDraft(id) {
      this.drafts = this.drafts.filter(d => d.id !== id);
      this.persistDrafts();
    },

    getDraft(id) {
      return this.drafts.find(d => d.id === id);
    },

    persistDrafts() {
      localStorage.setItem('auction_drafts', JSON.stringify(this.drafts));
    },
  },
});

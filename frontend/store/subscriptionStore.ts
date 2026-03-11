import { create } from 'zustand';
import { subscriptionAPI } from '@/lib/api';

interface SubscriptionState {
  subscription: any | null;
  plan: any | null;
  isLoading: boolean;
  isPremium: boolean;
  fetchSubscription: () => Promise<void>;
  clearSubscription: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscription: null,
  plan: null,
  isLoading: false,
  isPremium: false,

  fetchSubscription: async () => {
    set({ isLoading: true });
    try {
      const data = await subscriptionAPI.getMySubscription();
      // API returns SubscriptionResponse (with nested plan) or null
      set({
        subscription: data,
        plan: data?.plan ?? null,
        isPremium: data?.plan?.tts_enabled === true,
        isLoading: false,
      });
    } catch {
      set({
        subscription: null,
        plan: null,
        isPremium: false,
        isLoading: false,
      });
    }
  },

  clearSubscription: () => {
    set({ subscription: null, plan: null, isPremium: false });
  },
}));

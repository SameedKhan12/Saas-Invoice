import { create } from "zustand";

interface UserState {
  id: string | null;
  email: string | null;
  stripeAccountId: string | null;
  stripeConnected: boolean;
  stripeOnboardingComplete: boolean;
  fetched: boolean;
  fetching: boolean;
  fetch: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  id: null,
  email: null,
  stripeAccountId: null,
  stripeConnected: false,
  stripeOnboardingComplete: false,
  fetched: false,
  fetching: false,

  fetch: async () => {
    // Don't fetch again if already fetched or currently fetching
    if (get().fetched || get().fetching) return;

    set({ fetching: true });

    try {
      const res = await fetch("/api/user");
      const data = await res.json();

      set({
        id: data.id ?? null,
        email: data.email ?? null,
        stripeAccountId: data.stripeAccountId ?? null,
        stripeConnected: data.stripeConnected ?? false,
        stripeOnboardingComplete: data.stripeOnboardingComplete ?? false,
        fetched: true,
      });
    } catch {
      set({ fetched: true }); // mark as fetched even on error to avoid infinite retries
    } finally {
      set({ fetching: false });
    }
  },
}));
import { create } from "zustand";
import { BookReview } from "@/lib/supabase";

interface ReviewFilter {
  category?: string;
  search?: string;
  sortBy: "latest" | "popular" | "rating";
}

interface ReviewState {
  reviews: BookReview[];
  filter: ReviewFilter;
  isLoading: boolean;
  setReviews: (reviews: BookReview[]) => void;
  setFilter: (filter: Partial<ReviewFilter>) => void;
  setLoading: (loading: boolean) => void;
  addReview: (review: BookReview) => void;
  updateReview: (id: string, updates: Partial<BookReview>) => void;
  deleteReview: (id: string) => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  reviews: [],
  filter: {
    sortBy: "latest",
  },
  isLoading: false,
  setReviews: (reviews) => set({ reviews, isLoading: false }),
  setFilter: (filter) =>
    set((state) => ({
      filter: { ...state.filter, ...filter },
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  addReview: (review) =>
    set((state) => ({
      reviews: [review, ...state.reviews],
    })),
  updateReview: (id, updates) =>
    set((state) => ({
      reviews: state.reviews.map((review) =>
        review.id === id ? { ...review, ...updates } : review,
      ),
    })),
  deleteReview: (id) =>
    set((state) => ({
      reviews: state.reviews.filter((review) => review.id !== id),
    })),
}));

import { create } from 'zustand';

type BorrowState = {
  bookId: string | null;
  setBookId: (id: string) => void;
  clearBookId: () => void;
};

export const useBorrowStore = create<BorrowState>((set) => ({
  bookId: null,
  setBookId: (id) => set({ bookId: id }),
  clearBookId: () => set({ bookId: null }),
}));

'use client'

import { create } from 'zustand'

/** Non-persisted UI state for global overlays. Cart drawer state lives in the cart store. */
type UiState = {
  menuOpen: boolean
  searchOpen: boolean
  setMenuOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>()((set) => ({
  menuOpen: false,
  searchOpen: false,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
}))

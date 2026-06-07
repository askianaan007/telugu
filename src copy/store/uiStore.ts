'use client'

import { create } from 'zustand'

export interface UiStoreState {
  isNavOpen: boolean
  isContactModalOpen: boolean
  isBookingModalOpen: boolean
  toggleNav: () => void
  closeNav: () => void
  openContactModal: () => void
  closeContactModal: () => void
  openBookingModal: () => void
  closeBookingModal: () => void
}

export const useUiStore = create<UiStoreState>((set) => ({
  isNavOpen: false,
  isContactModalOpen: false,
  isBookingModalOpen: false,
  toggleNav: () => set((state) => ({ isNavOpen: !state.isNavOpen })),
  closeNav: () => set({ isNavOpen: false }),
  openContactModal: () => set({ isContactModalOpen: true }),
  closeContactModal: () => set({ isContactModalOpen: false }),
  openBookingModal: () => set({ isBookingModalOpen: true }),
  closeBookingModal: () => set({ isBookingModalOpen: false }),
}))

"use client";

import { create } from "zustand";
import type { Booking } from "./types";

/** Transient UI state shared across the app shell (not persisted). */
type UI = {
  leadForm: boolean;
  bookingForm: { open: boolean; booking?: Booking; leadId?: string; start?: string };
  palette: boolean;
  mobileNav: boolean;
  openLeadForm: () => void;
  closeLeadForm: () => void;
  openBookingForm: (opts?: { booking?: Booking; leadId?: string; start?: string }) => void;
  closeBookingForm: () => void;
  setPalette: (v: boolean) => void;
  setMobileNav: (v: boolean) => void;
};

export const useUI = create<UI>()((set) => ({
  leadForm: false,
  bookingForm: { open: false },
  palette: false,
  mobileNav: false,
  openLeadForm: () => set({ leadForm: true }),
  closeLeadForm: () => set({ leadForm: false }),
  openBookingForm: (opts) => set({ bookingForm: { open: true, ...opts } }),
  closeBookingForm: () => set({ bookingForm: { open: false } }),
  setPalette: (palette) => set({ palette }),
  setMobileNav: (mobileNav) => set({ mobileNav }),
}));

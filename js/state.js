// ──────────────────────────────────────────────
// Shared mutable state — import { state, bkCache }
// ──────────────────────────────────────────────
export const state = {
  petType:     "dog",
  dogCount:    1,
  catRoom:     "small",
  dayCareDuration: "4",       // "4" or "8"
  lateCheckout: false,
  lateCheckoutDuration: "4",  // "4" or "8"
  groomApiE:   null,   // estimate grooming form API
  groomApiF:   null,   // final-bill grooming form API
  loadedBooking: null, // { id, data } of currently-loaded booking
  lastEst:     null,   // last generated estimate payload
  lastFin:     null,   // last generated final-bill payload
};

export const bkCache = {};
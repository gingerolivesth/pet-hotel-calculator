# Project: Untitled



## Files

### BLUEPRINT.md
- Summary: —
- Key elements: —
- Depends on: —
- Notes: —
- Lines: 123 | Tokens: ~512
- Flagged: No
- Last updated: 2026-08-02T01:43:07

### css/styles.css
- Summary: Global styles for the Pet Hotel Calculator UI
- Key elements: dc-reveal, dcSlideIn
- Depends on: —
- Notes: Added .dc-reveal animation class used by JS when showing the late-checkout duration selector. The animation plays a subtle 250ms slide-down.
- Lines: 475 | Tokens: ~2650
- Flagged: No
- Last updated: 2026-08-02T02:29:06

### index.html
- Summary: Main HTML page with estimate and final bill views
- Key elements: daycareDurationF, daycareSeg, lateCheckoutF, lateCheckoutCb, lateCheckoutDurF, lateCheckoutSeg
- Depends on: css/styles.css, js/app.js
- Notes: Added daycareDurationF (day care duration selector in boarding card, shown when dates match), lateCheckoutF + lateCheckoutDurF (late checkout checkbox + duration in final-bill hotel extras). Footer text updated. If you add/remove day care segment buttons, update state.dayCareDuration defaults in state.js.
- Lines: 252 | Tokens: ~2968
- Flagged: No
- Last updated: 2026-08-02T02:29:06

### js/app.js
- Summary: —
- Key elements: —
- Depends on: —
- Notes: —
- Lines: 45 | Tokens: ~324
- Flagged: No
- Last updated: 2026-08-02T01:30:21

### js/boarding.js
- Summary: Boarding cost calculator with day care mode detection and form event handlers
- Key elements: setupBoardingUI, calcBoarding, updateDateMode, showPetFields
- Depends on: ./i18n.js, ./pricing.js, ./state.js, ./utils.js
- Notes: When dates match (nights === 0), enters day care mode: hides pet count/room size/squeeze, shows day care duration selector, returns isDayCare:true result. Validation relaxed: nights < 0 errors (not <= 0). calcBoarding returns {isDayCare, raw.dayCareHours, raw.dayCarePrice} for day care mode.
- Lines: 178 | Tokens: ~1526
- Flagged: No
- Last updated: 2026-08-02T02:29:06

### js/estimate.js
- Summary: Estimate tab — generate receipt, copy to clipboard, save to Firebase
- Key elements: setupEstimateUI, hideEstReceipt
- Depends on: ./i18n.js, ./state.js, ./utils.js, ./boarding.js, ./grooming.js, ./firebase-config.js
- Notes: Day care estimates skip the deposit message. Saved bookings now include isDayCare and dayCareHours in the boarding object for final-bill consumption.
- Lines: 113 | Tokens: ~1274
- Flagged: No
- Last updated: 2026-08-02T02:29:06

### js/final-bill.js
- Summary: Final Bill tab — bookings CRUD, final receipt with day care and late checkout support
- Key elements: setupFinalBillUI, loadAllBookings, loadBooking
- Depends on: ./i18n.js, ./pricing.js, ./state.js, ./utils.js, ./grooming.js, ./firebase-config.js
- Notes: Late Checkout: shows for multi-night (nights>1) non-day-care bookings. Charge appears after deposit line with separators, not subject to boarding discount. Day care bookings: hide extra boarding card, late pickup, and late checkout; show day care receipt format; deposit hint says 'no deposit required'. Late checkout amount saved as lateCheckoutAmt in finalBill payload. If you change DAYCARE_4H/8H in pricing.js, both boarding.js and final-bill.js will pick up the change automatically.
- Lines: 509 | Tokens: ~6402
- Flagged: No
- Last updated: 2026-08-02T02:29:06

### js/firebase-config.js
- Summary: —
- Key elements: —
- Depends on: —
- Notes: —
- Lines: 25 | Tokens: ~251
- Flagged: No
- Last updated: 2026-08-02T01:30:21

### js/grooming.js
- Summary: —
- Key elements: —
- Depends on: —
- Notes: —
- Lines: 166 | Tokens: ~2074
- Flagged: No
- Last updated: 2026-08-02T01:30:21

### js/i18n.js
- Summary: Language system with EN/TH translations and UI label application
- Key elements: lang, T, def, applyLang, setLang, pctOff, nightLbl, uLabel, fmt, thb
- Depends on: —
- Notes: Added day care translation keys: dayCare, dayCareDuration, dc4h, dc8h, lateCheckout, rcptDayCare, dayCare4h, dayCare8h, dayCareNoDep. Updated footer text to 'Deposit is 50% of boarding subtotal.'
- Lines: 200 | Tokens: ~3091
- Flagged: No
- Last updated: 2026-08-02T02:29:06

### js/pricing.js
- Summary: Pricing constants and display helpers for boarding, grooming, and day care
- Key elements: R, DAYCARE_4H, DAYCARE_8H, DC_RATE, RANGE, DEMAT, rLbl, eRate, petS
- Depends on: ./i18n.js
- Notes: DAYCARE_4H (200) and DAYCARE_8H (300) are the flat day care rates. Used by boarding.js (estimate calc) and final-bill.js (late checkout charge).
- Lines: 73 | Tokens: ~671
- Flagged: No
- Last updated: 2026-08-02T02:29:06

### js/state.js
- Summary: Shared mutable state object imported across all modules
- Key elements: state, bkCache
- Depends on: —
- Notes: dayCareDuration and lateCheckoutDuration hold "4" or "8" as strings matching segment button data-v values. lateCheckout is a boolean for the final-bill checkbox.
- Lines: 18 | Tokens: ~168
- Flagged: No
- Last updated: 2026-08-02T02:29:06

### js/utils.js
- Summary: —
- Key elements: —
- Depends on: —
- Notes: —
- Lines: 93 | Tokens: ~757
- Flagged: No
- Last updated: 2026-08-02T01:30:21

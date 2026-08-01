# Project: Untitled



## Files

### BLUEPRINT.md
- Summary: Project documentation — file map, key elements, dependencies, and editing notes
- Key elements: BLUEPRINT.md
- Depends on: —
- Notes: This is the project blueprint. Keep it in sync when adding, removing, or significantly changing tracked files.
- Lines: 123 | Tokens: ~1315
- Flagged: No
- Last updated: 2026-08-02T03:23:02

### css/styles.css
- Summary: Global styles for the Pet Hotel Calculator UI
- Key elements: dc-reveal, dcSlideIn, groom-entry, groom-entry-head, groom-entry-title
- Depends on: —
- Notes: Added .groom-entry/.groom-entry-head/.groom-entry-title/.groom-entry-head .rm rules for the new multi-pet grooming list UI built by js/grooming.js's buildGroomList(). Reuses the existing .add-line-btn style for the 'add another pet' button. .dc-reveal animation class unchanged.
- Lines: 508 | Tokens: ~2813
- Flagged: No
- Last updated: 2026-08-02T03:23:15

### index.html
- Summary: Main HTML page with estimate and final bill views
- Key elements: daycareDurationF, daycareSeg, lateCheckoutF, lateCheckoutCb, lateCheckoutDurF, lateCheckoutSeg, confirmGroomList, addGroomF
- Depends on: css/styles.css, js/app.js
- Notes: Grooming card containers (#groomBlkE, #groomBlkF) are unchanged empty divs — js/grooming.js's buildGroomList() renders up to 3 per-pet forms plus an 'add another pet' button into them dynamically. Replaced the static single '#actualGroom' input + '#groomHint'/'#groomDiscHint' with an empty '#confirmGroomList' container that js/final-bill.js populates with one row per pre-booked grooming record needing confirmation (ids actualGroom0, actualGroom1, actualGroom2). Replaced the static '#addGroomPrice' input + '#addGroomHint' with an empty '#addGroomF' container that js/final-bill.js's updAddG() populates per pet (ids addGroomPrice0, addGroomPrice1, addGroomPrice2). If you rename these dynamic-container ids, update js/final-bill.js accordingly.
- Lines: 244 | Tokens: ~2842
- Flagged: No
- Last updated: 2026-08-02T03:23:15

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
- Notes: state.groomApiE now holds a buildGroomList() API (up to 3 pets) instead of a single buildGroom() API; grooming totals come from calcGroomAll(). Saved 'grooming' field in Firebase is now an array of per-pet grooming records (was a single object) — final-bill.js's loadBooking()/genFinBtn were updated to read this as an array. Day care estimates skip the deposit message.
- Lines: 116 | Tokens: ~1276
- Flagged: No
- Last updated: 2026-08-02T03:23:15

### js/final-bill.js
- Summary: Final Bill tab — bookings CRUD, final receipt with day care, late checkout, and up to 3 individually-itemized grooming records
- Key elements: setupFinalBillUI, loadAllBookings, loadBooking, updAddG
- Depends on: ./i18n.js, ./pricing.js, ./state.js, ./utils.js, ./grooming.js, ./firebase-config.js
- Notes: data.grooming is now an array (0-3 entries) instead of a single object — loadBooking() summarizes and confirms each entry individually, building dynamic inputs (#actualGroom0/1/2) into #confirmGroomList for any pre-booked entry that isRange. Additional Grooming uses buildGroomList (state.groomApiF) instead of buildGroom; updAddG() rebuilds #addGroomF with one field per range entry (#addGroomPrice0/1/2). genFinBtn loops both pre-booked and additional grooming entries, itemizing each in the receipt ('Pet N:' prefix when >1) and validating each range entry's actual-price input before generating. state.lastFin.preGroomActual is now an array (per-entry actual prices); addGroomEntries is a new array of per-entry additional-grooming amounts saved to finalBill.addGroomEntries. If pricing.js's DAYCARE_4H/8H change, this file and boarding.js pick it up automatically (unrelated to this change).
- Lines: 574 | Tokens: ~7236
- Flagged: No
- Last updated: 2026-08-02T03:23:15

### js/firebase-config.js
- Summary: —
- Key elements: —
- Depends on: —
- Notes: —
- Lines: 25 | Tokens: ~251
- Flagged: No
- Last updated: 2026-08-02T01:30:21

### js/grooming.js
- Summary: Grooming form builder & cost calculator — now supports up to 3 repeatable per-pet grooming records via buildGroomList/calcGroomAll
- Key elements: buildGroom, buildGroomList, calcGroom, calcGroomAll
- Depends on: ./i18n.js, ./pricing.js, ./utils.js
- Notes: buildGroom now returns `px` on its API object (needed by calcGroom, which dropped its separate px argument — call as calcGroom(bk), not calcGroom(bk, px)). buildGroomList(container, px, defSp, onChg, max=3) manages 1-3 buildGroom() entries with add/remove UI, using a monotonic counter for id suffixes (px+0, px+1, px+2...) so ids never collide even after removing/re-adding entries. calcGroomAll(listApi) sums entries and numbers receipt lines 'Pet N' when there's more than one. estimate.js and final-bill.js now call buildGroomList/calcGroomAll instead of buildGroom/calcGroom directly (final-bill.js still calls calcGroom per-entry for its 'Additional Grooming' actual-price overrides). Requires new i18n keys addAnotherPet/petLabel and new CSS classes .groom-entry/.groom-entry-head/.groom-entry-title (added to css/styles.css).
- Lines: 272 | Tokens: ~2928
- Flagged: No
- Last updated: 2026-08-02T03:23:15

### js/i18n.js
- Summary: Language system with EN/TH translations and UI label application
- Key elements: lang, T, def, applyLang, setLang, pctOff, nightLbl, uLabel, fmt
- Depends on: —
- Notes: Added addAnotherPet and petLabel keys used by the new multi-pet grooming UI (js/grooming.js, js/final-bill.js). Everything else unchanged.
- Lines: 203 | Tokens: ~3126
- Flagged: No
- Last updated: 2026-08-02T03:23:15

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

// ──────────────────────────────────────────────
// Pricing constants & display helper functions
// ──────────────────────────────────────────────
import { T } from './i18n.js';

/* ── Boarding rates (THB / night) ── */
export const R = { dogBase: 500, dogAdd: 300, catSm: 400, catBg: 600, catSq: 50 };

/* ── Misc constants ── */
export const DC_RATE = 50;   // late-pickup per hour
export const RANGE   = 300;  // grooming price range for cats / long-coat dogs
export const DEMAT   = 300;  // dematting per hour

/* ── Grooming price tables ── */
export const CAT_G = {
  basic: { "0-2": 450, "2-5": 550, ">5": 650 },
  full:  { "0-2": 650, "2-5": 750, ">5": 850 },
};
export const DOG_G = {
  basic: {
    short: { "<2": 300, "2-5": 350, "5-10": 450, "10-15": 550 },
    long:  { "<2": 450, "2-5": 500, "5-10": 600, "10-15": 700 },
  },
  full: {
    short: { "<2": 500, "2-5": 550, "5-10": 650, "10-15": 750 },
    long:  { "<2": 600, "2-5": 700, "5-10": 800, "10-15": 950 },
  },
};

/* ── A la carte menus ── */
export const CAT_A  = [["Trim Cut",100],["Clipping of nails",100],["Eyes and Ears Cleaning",100],["Paw Belly Sanitary Trim",100],["Conditioning Treatment",100],["Paw Pad Moisturizing",100],["Coat Detox",100]];
export const CAT_AK = ["ala0","ala1","ala2","ala3","ala4","ala5","ala6"];
export const DOG_A  = [["Trim Cut",100],["Clipping of nails",100],["Eyes and Ears Cleaning",100],["Paw Belly Sanitary Trim",100],["Conditioning Treatment",100],["Paw Pad Moisturizing",100]];
export const DOG_AK = ["ala0","ala1","ala2","ala3","ala4","ala5"];

/* ── Display helpers (booking → human-readable) ── */

export function rLbl(b) {
  if (!b) return "";
  if (b.petType === "dog") return b.dogCount === 2 ? T("rDogRoom2") : T("rDogRoom");
  return b.catRoom === "small" ? T("smRoom") : T("bgRoom");
}

export function eRate(b) {
  if (!b) return 0;
  if (b.petType === "dog") {
    var r = R.dogBase;
    if (b.dogCount === 2) r += R.dogAdd;
    return r;
  }
  var r2 = b.catRoom === "small" ? R.catSm : R.catBg;
  if (b.catSqueeze) r2 += R.catSq;
  return r2;
}

export function petS(b) {
  if (!b) return "";
  if (b.petType === "dog") return b.dogCount === 2 ? T("petS2Dogs") : T("petS1Dog");
  var base = b.catRoom === "small" ? T("petS1CatS") : T("petS2CatB");
  return b.catSqueeze ? base + T("petSSqueeze") : base;
}

export function wB(sp, v) {
  if (!v) return "";
  var m = sp === "cat"
    ? { "0-2": "0\u20132kg", "2-5": "2\u20135kg", ">5": ">5kg" }
    : { "<2": "<2kg", "2-5": "2\u20135kg", "5-10": "5\u201310kg", "10-15": "10\u201315kg" };
  return m[v] || "";
}
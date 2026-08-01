// ──────────────────────────────────────────────
// Boarding cost calculator & form event handlers
// ──────────────────────────────────────────────
import { T, pctOff, nightLbl, uLabel, fmt } from './i18n.js';
import { R } from './pricing.js';
import { state } from './state.js';
import { $, pR, pL, drS, setA } from './utils.js';

/**
 * Wire up the boarding form. onChange() fires whenever
 * any boarding input changes (used to hide the receipt).
 */
export function setupBoardingUI(onChange) {
  var hide = function () { if (onChange) onChange(); };

  $("incBoard").onchange = function () {
    $("boardBlock").style.display = $("incBoard").checked ? "block" : "none";
    hide();
  };

  $("petSeg").onclick = function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    state.petType = b.dataset.v;
    setA($("petSeg"), state.petType);
    $("dogCF").style.display  = state.petType === "dog" ? "block" : "none";
    $("catRF").style.display  = state.petType === "cat" ? "block" : "none";
    $("catSF").style.display  = state.petType === "cat" ? "block" : "none";
    hide();
  };

  $("dogCSeg").onclick = function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    state.dogCount = parseInt(b.dataset.v);
    setA($("dogCSeg"), String(state.dogCount));
    hide();
  };

  $("catRSeg").onclick = function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    state.catRoom = b.dataset.v;
    setA($("catRSeg"), state.catRoom);
    hide();
  };

  $("catSq").onchange = hide;
  ["dStart", "dEnd", "discBoard"].forEach(function (id) { $(id).onchange = hide; });
}

/**
 * Read boarding form inputs and calculate costs.
 * Returns { error } or { error:null, ...receiptData }.
 */
export function calcBoarding() {
  var sv = $("dStart").value, ev = $("dEnd").value, dp = parseInt($("discBoard").value);
  if (!sv || !ev) return { error: T("selBoth") };
  var s = new Date(sv + "T00:00:00"), e = new Date(ev + "T00:00:00");
  var nights = Math.round((e - s) / 86400000);
  if (nights <= 0) return { error: T("endAfter") };

  var items = [], ht = "", rl = "", u = uLabel();

  if (state.petType === "dog") {
    ht = state.dogCount === 2 ? T("r2Dogs") : T("r1Dog");
    rl = T("rDogRoom");
    items.push([T("rDogBoarding"), R.dogBase]);
    if (state.dogCount === 2) items.push([T("rAddDog"), R.dogAdd]);
  } else {
    var sq  = $("catSq").checked;
    var br  = state.catRoom === "small" ? R.catSm : R.catBg;
    var bl  = T(state.catRoom === "small" ? "smRoom" : "bgRoom");
    var bc  = state.catRoom === "small" ? 1 : 2;
    var tc  = sq ? bc + 1 : bc;
    ht = tc === 1 ? T("r1Cat") : tc + T("rNCatsSuffix");
    rl = bl;
    items.push([bl, br]);
    if (sq) items.push([T("rExtraCat"), R.catSq]);
  }

  var spn = items.reduce(function (s, i) { return s + i[1]; }, 0);
  var tbd = spn * nights;
  var da  = Math.round(tbd * dp / 100);
  var sad = tbd - da;
  var dr  = drS(s, e), nl = nightLbl(nights);
  var LW = 22, RW = 11, lines = [];

  lines.push(T("rcptBoarding") + " \u2014 " + ht);
  lines.push("\u2501".repeat(23));
  lines.push(rl + " \u00b7 " + nl + " (" + dr + ")" + (dp > 0 ? " \u00b7 " + pctOff(dp) : ""));
  lines.push(T("rcptRate"));
  items.forEach(function (i) { lines.push("  " + pR(i[0] + ":", LW) + pL(fmt(i[1]) + " " + u, RW)); });
  if (items.length > 1) {
    lines.push("  " + "\u2500".repeat(31));
    lines.push("  " + pR(T("rcptSubN") + ":", LW) + pL(fmt(spn) + " " + u, RW));
  }
  lines.push(T("rcptCalc"));
  lines.push("  " + fmt(spn) + " " + u + " \u00d7 " + nights + " = " + fmt(tbd) + " " + u);
  if (dp > 0) lines.push("  " + T("rcptPromotion") + " (" + pctOff(dp) + ") = -" + fmt(da) + " " + u);
  lines.push("  " + "\u2500".repeat(31));
  lines.push("  " + pR(T("rcptTotal"), 20) + "=  " + fmt(sad) + " " + u);

  return {
    error: null, nights: nights, dateRange: dr, discountPct: dp,
    totalBeforeDiscount: tbd, discountAmount: da, totalDue: sad, lines: lines,
    raw: {
      petType: state.petType, dogCount: state.dogCount,
      catRoom: state.catRoom, catSqueeze: $("catSq").checked,
      startVal: sv, endVal: ev,
    },
  };
}
// ──────────────────────────────────────────────
// Estimate tab — generate, copy, save
// ──────────────────────────────────────────────
import { T, pctOff, uLabel, fmt } from './i18n.js';
import { state } from './state.js';
import { $, copyToClipboard } from './utils.js';
import { calcBoarding } from './boarding.js';
import { buildGroom, calcGroom } from './grooming.js';
import { db, collection, addDoc, serverTimestamp } from './firebase-config.js';

export function hideEstReceipt() {
  $("estRW").classList.remove("show");
  $("estErr").style.display = "none";
}

export function setupEstimateUI() {
  /* Grooming toggle */
  $("incGroom").onchange = function () {
    $("groomBlkE").style.display = $("incGroom").checked ? "block" : "none";
    if ($("incGroom").checked && !state.groomApiE)
      state.groomApiE = buildGroom($("groomBlkE"), "gE", state.petType);
    hideEstReceipt();
  };

  /* Generate estimate */
  $("genEstBtn").onclick = function () {
    var gn = $("guestName").value.trim();
    if (!gn) { $("estErr").textContent = T("enterGn"); $("estErr").style.display = "block"; return; }

    var hasBoard = $("incBoard").checked, hasGroom = $("incGroom").checked;
    if (!hasBoard && !hasGroom) { $("estErr").textContent = T("incLeast"); $("estErr").style.display = "block"; return; }

    var brd = null, grm = null, u = uLabel();
    if (hasBoard) { brd = calcBoarding(); if (brd.error) { $("estErr").textContent = brd.error; $("estErr").style.display = "block"; return; } }
    if (hasGroom) { if (!state.groomApiE) state.groomApiE = buildGroom($("groomBlkE"), "gE", state.petType); grm = calcGroom(state.groomApiE, "gE"); }

    $("estErr").style.display = "none";

    var lines = [];
    lines.push(T("rcptEst") + " \u2014 " + gn);
    lines.push("\u2501".repeat(23));
    if (brd) lines = lines.concat(brd.lines);
    if (brd && grm) lines.push("");
    if (grm) lines = lines.concat(grm.lines);

    var bD = brd ? brd.totalDue : 0;
    var gL = grm ? grm.discTotalLow : 0, gH = grm ? grm.discTotalHigh : 0;
    var tL = bD + gL, tH = bD + gH;
    lines.push("");
    lines.push("\u2501".repeat(23));
    if (grm && grm.isRange) lines.push(T("rcptGrand") + ":      " + fmt(tL) + " \u2013 " + fmt(tH) + " " + u);
    else lines.push(T("rcptGrand") + ":      " + fmt(tL) + " " + u);
    lines.push("");
    if (!hasBoard && hasGroom) lines.push(T("groomOnlyMsg"));
    else if (hasBoard && hasGroom) lines.push(T("depositBoardMsg") + " (" + fmt(Math.round(bD * 0.5)) + " " + u + ").");
    else if (hasBoard) lines.push(T("depositMsg") + " (" + fmt(Math.round(bD * 0.5)) + " " + u + ").");

    $("estRT").textContent = lines.join("\n");
    $("estRW").classList.add("show");
    $("estRW").scrollIntoView({ behavior: "smooth", block: "nearest" });

    state.lastEst = {
      guestName: gn, boarding: brd, grooming: grm,
      grandLow: tL, grandHigh: tH, boardOnly: bD,
    };
    $("estSaveSt").textContent = "";
  };

  /* Copy */
  $("estCopyBtn").onclick = function () { copyToClipboard($("estRT").textContent, $("estCopyBtn")); };

  /* Save */
  $("estSaveBtn").onclick = async function () {
    if (!state.lastEst) return;
    var s = $("estSaveSt");
    s.textContent = T("saving"); s.className = "smsg";
    try {
      var le = state.lastEst;
      await addDoc(collection(db, "bookings"), {
        guestName:      le.guestName,
        guestNameLower: le.guestName.toLowerCase(),
        boarding: le.boarding ? {
          petType: le.boarding.raw.petType, dogCount: le.boarding.raw.dogCount,
          catRoom: le.boarding.raw.catRoom, catSqueeze: le.boarding.raw.catSqueeze,
          startDate: le.boarding.raw.startVal, endDate: le.boarding.raw.endVal,
          nights: le.boarding.nights, totalDue: le.boarding.totalDue,
          discountPct: le.boarding.discountPct,
          totalBeforeDiscount: le.boarding.totalBeforeDiscount,
          discountAmount: le.boarding.discountAmount,
        } : null,
        grooming: le.grooming ? {
          species: le.grooming.raw.species, weight: le.grooming.raw.weight,
          coat: le.grooming.raw.coat, groomType: le.grooming.raw.groomType,
          alacarte: le.grooming.raw.alacarte, demattingHrs: le.grooming.raw.demattingHrs,
          total: le.grooming.discTotalLow, totalHigh: le.grooming.discTotalHigh,
          origLow: le.grooming.origLow, origHigh: le.grooming.origHigh,
          discountPct: le.grooming.discountPct, isRange: le.grooming.isRange,
        } : null,
        grandTotal:      le.grandLow,
        grandTotalHigh:  le.grandHigh || null,
        boardOnlyTotal:  le.boardOnly || 0,
        estimateReceiptText: $("estRT").textContent,
        status:    "estimate",
        createdAt: serverTimestamp(),
      });
      s.textContent = T("savedOk"); s.className = "smsg ok";
    } catch (e) { s.textContent = "Error: " + e.message; s.className = "smsg err"; }
  };
}
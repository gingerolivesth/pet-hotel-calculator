// ──────────────────────────────────────────────
// Final Bill tab — bookings CRUD, final receipt
// ──────────────────────────────────────────────
import { T, pctOff, nightLbl, uLabel, fmt, thb, lang } from './i18n.js';
import { R, DC_RATE, eRate, petS, rLbl, CAT_G, DOG_G } from './pricing.js';
import { state, bkCache } from './state.js';
import { $, pR, pL, copyToClipboard, showInlineConfirm } from './utils.js';
import { buildGroom, calcGroom } from './grooming.js';
import { db, collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy, serverTimestamp } from './firebase-config.js';

/* ────────────────── Delete helper ────────────────── */

function doDelete(bookingId, parentDiv) {
  deleteDoc(doc(db, "bookings", bookingId)).then(function () {
    if (parentDiv) parentDiv.remove();
    delete bkCache[bookingId];
    var items = $("bookList").querySelectorAll(".result-item");
    if (items.length === 0) $("bookList").innerHTML = '<div class="bempty">' + T("noBookings") + '</div>';
    if (state.loadedBooking && state.loadedBooking.id === bookingId) {
      $("finForm").style.display = "none";
      state.loadedBooking = null;
      $("bookWrap").style.display = "block";
      loadAllBookings();
    }
  }).catch(function (err) { console.error("Delete failed:", err); });
}

function makeDelBtn(parentDiv, bookingId) {
  var btn = document.createElement("button");
  btn.type = "button"; btn.className = "del-btn"; btn.textContent = T("delete");
  parentDiv.appendChild(btn);
  btn.addEventListener("click", function (e) {
    e.stopPropagation(); e.preventDefault();
    showInlineConfirm(parentDiv, function () { doDelete(bookingId, parentDiv); });
  });
}

/* ────────────────── Load bookings list ────────────────── */

export async function loadAllBookings() {
  var list = $("bookList");
  list.innerHTML = '<div class="bempty">' + T("loading") + '</div>';
  for (var k in bkCache) delete bkCache[k];
  try {
    var snap = await getDocs(query(collection(db, "bookings"), orderBy("createdAt", "desc")));
    var docs = [];
    snap.forEach(function (d) { docs.push({ id: d.id, data: d.data() }); });
    if (!docs.length) { list.innerHTML = '<div class="bempty">' + T("noBookings") + '</div>'; return; }
    list.innerHTML = "";
    docs.forEach(function (item) {
      bkCache[item.id] = item.data;
      var div = document.createElement("div"); div.className = "result-item";
      if (item.data.status === "finalized") div.classList.add("fin-item");

      var nameDiv = document.createElement("div"); nameDiv.className = "ri-name"; nameDiv.textContent = item.data.guestName;
      var badge = document.createElement("span");
      badge.className = item.data.status === "finalized" ? "badge bf" : "badge be";
      badge.textContent = item.data.status === "finalized" ? (lang === "th" ? "เสร็จสิ้น" : "Finalized") : (lang === "th" ? "ประมาณ" : "Estimate");
      nameDiv.appendChild(badge); div.appendChild(nameDiv);

      var detDiv = document.createElement("div"); detDiv.className = "ri-detail";
      var di = item.data.boarding ? item.data.boarding.startDate + "\u2192" + item.data.boarding.endDate + " \u00b7 " + item.data.boarding.nights + "N" : (lang === "th" ? "ไม่มีฝากเลี้ยง" : "No boarding");
      var tot;
      if (item.data.status === "finalized" && item.data.finalBill) tot = thb(item.data.finalBill.totalOutstanding);
      else if (item.data.grandTotalHigh) tot = fmt(item.data.grandTotal || 0) + " \u2013 " + thb(item.data.grandTotalHigh);
      else tot = thb(item.data.grandTotal || 0);
      detDiv.textContent = di + " \u00b7 " + tot; div.appendChild(detDiv);

      makeDelBtn(div, item.id);
      div.addEventListener("click", function (e) {
        if (e.target.closest(".del-btn") || e.target.closest(".confirm-bar")) return;
        loadBooking(item.id, item.data);
        $("bookWrap").style.display = "none";
      });
      list.appendChild(div);
    });
  } catch (e) {
    console.error("loadAllBookings:", e);
    list.innerHTML = '<div class="bempty">Error: ' + e.message + '</div>';
  }
}

/* ────────────────── Load single booking ────────────────── */

function loadBooking(id, data) {
  state.loadedBooking = { id: id, data: data };
  $("finForm").style.display = "block";

  try {
    if (data) {
      var html = T("loaded") + " <b>" + data.guestName + "</b>";
      if (data.boarding) html += "<br>" + petS(data.boarding) + " \u00b7 " + data.boarding.nights + "N \u00b7 " + data.boarding.startDate + "\u2192" + data.boarding.endDate + "<br>" + T("boarding") + " <b>" + thb(data.boarding.totalDue) + "</b>";
      if (data.grooming) {
        var gt = data.grooming.isRange ? fmt(data.grooming.total) + "\u2013" + fmt(data.grooming.totalHigh) : fmt(data.grooming.total);
        html += "<br>" + T("grooming") + " <b>" + gt + " THB</b>";
      }
      html += '<div class="bactions"><button type="button" class="alm" id="unloadBtn">' + T("chooseOther") + '</button>';
      if (id) html += '<button type="button" class="alm" id="delBannerBtn">' + T("deleteBooking") + '</button>';
      html += '</div>';
      $("loadedBan").innerHTML = html;

      var dbb = $("delBannerBtn");
      if (dbb) dbb.onclick = function () { showInlineConfirm($("loadedBan"), function () { doDelete(id, null); }); };
      $("unloadBtn").onclick = function () {
        $("finForm").style.display = "none"; state.loadedBooking = null;
        $("finRW").classList.remove("show"); $("bookWrap").style.display = "block"; loadAllBookings();
      };

      if (data.boarding) {
        $("datesCard").style.display = "block";
        var dp = data.boarding.discountPct || 0;
        $("discInfoBox").innerHTML = dp > 0 ? '<span style="font-size:13px;font-weight:600;color:var(--teal-700);">' + T("boardDisc") + " " + pctOff(dp) + " (" + T("saved") + " " + fmt(data.boarding.discountAmount || 0) + " " + uLabel() + ")</span>" : "";
        if (data.confirmedDates) {
          $("finDStart").value = data.confirmedStartDate; $("finDEnd").value = data.confirmedEndDate;
          $("depPaid").value = data.depositPaid || 0;
          $("datesEdit").style.display = "none"; $("datesLock").style.display = "block"; $("confirmBtn").style.display = "none";
          var sd2 = new Date(data.confirmedStartDate + "T00:00:00"), ed2 = new Date(data.confirmedEndDate + "T00:00:00");
          $("datesLabel").textContent = "\u2713 " + data.confirmedStartDate + " \u2192 " + data.confirmedEndDate + " (" + nightLbl(Math.round((ed2 - sd2) / 86400000)) + ")";
        } else {
          $("finDStart").value = data.boarding.startDate; $("finDEnd").value = data.boarding.endDate;
          $("depPaid").value = 0;
          $("datesEdit").style.display = "block"; $("datesLock").style.display = "none"; $("confirmBtn").style.display = "block";
        }
        var bOnly = data.boardOnlyTotal || data.boarding.totalDue;
        $("depHint").textContent = T("depSug") + " " + fmt(Math.round(bOnly * 0.5)) + " " + uLabel();
      } else { $("datesCard").style.display = "none"; }

      if (data.grooming && data.grooming.isRange) {
        $("confirmGroom").style.display = "block";
        var gdp = data.grooming.discountPct || 0;
        $("groomHint").textContent = (lang === "th" ? "ประมาณ: " : "Estimated: ") + fmt(data.grooming.origLow || data.grooming.total) + "\u2013" + fmt(data.grooming.origHigh || data.grooming.totalHigh) + " " + uLabel() + (gdp > 0 ? " (" + pctOff(gdp) + ")" : "");
        $("actualGroom").value = "";
        $("groomDiscHint").textContent = gdp > 0 ? pctOff(gdp) + " \u2014 " + (lang === "th" ? "ใส่ราคาก่อนลด" : "Enter pre-discount price") : T("enterActual");
      } else { $("confirmGroom").style.display = "none"; }

      if (data.boarding) {
        $("extraCard").style.display = "block";
        $("incExtra").checked = false; $("extraBlock").style.display = "none";
        $("extraRateH").textContent = rLbl(data.boarding) + ": " + fmt(eRate(data.boarding)) + " " + uLabel() + "/" + (lang === "th" ? "คืน" : "night");
        $("extraCalc").textContent = ""; $("extraDisc").value = "0";
      } else { $("extraCard").style.display = "none"; }

      $("daycareF").style.display = data.boarding ? "block" : "none";
    } else {
      $("datesCard").style.display = "none"; $("confirmGroom").style.display = "none";
      $("extraCard").style.display = "none"; $("daycareF").style.display = "none";
    }
  } catch (e) { console.error("loadBooking:", e); }

  $("finRW").classList.remove("show");
  $("incGroomF").checked = false; $("groomBlkF").style.display = "none";
  $("addGroomF").style.display = "none"; state.groomApiF = null;
  $("finForm").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ────────────────── Extra boarding preview ────────────────── */

function updExtra() {
  if (!$("incExtra").checked || !$("extraStart").value || !$("extraEnd").value || !state.loadedBooking || !state.loadedBooking.data || !state.loadedBooking.data.boarding) {
    $("extraCalc").textContent = ""; return;
  }
  var es = new Date($("extraStart").value + "T00:00:00"), ee = new Date($("extraEnd").value + "T00:00:00");
  var n = Math.round((ee - es) / 86400000);
  if (n <= 0) { $("extraCalc").textContent = T("endMustBe"); return; }
  var rate = eRate(state.loadedBooking.data.boarding), dp = parseInt($("extraDisc").value) || 0;
  var tb = rate * n, da = Math.round(tb * dp / 100), ta = tb - da, u = uLabel();
  var txt = fmt(rate) + " " + u + " \u00d7 " + n + " = " + fmt(tb) + " " + u;
  if (dp > 0) txt += "\n" + T("rcptDiscount") + " (" + pctOff(dp) + ") = -" + fmt(da) + " " + u + "\n" + T("rcptAfterDisc") + ": " + fmt(ta) + " " + u;
  $("extraCalc").textContent = txt;
}

/* ────────────────── Additional grooming hint ────────────────── */

function updAddG() {
  var f = $("addGroomF");
  if (!state.groomApiF || !$("incGroomF").checked) { f.style.display = "none"; return; }
  if (state.groomApiF.isRange()) {
    f.style.display = "block";
    var st = state.groomApiF.getState(), p = 0;
    if (st.groomType === "basic") p = st.species === "cat" ? CAT_G.basic[st.weight] : DOG_G.basic[st.coat][st.weight];
    else if (st.groomType === "full") p = st.species === "cat" ? CAT_G.full[st.weight] : DOG_G.full[st.coat][st.weight];
    var dp = parseInt(state.groomApiF.container.querySelector("#gFDisc").value) || 0;
    $("addGroomHint").textContent = pctOff(dp) + ": " + fmt(p - Math.round(p * dp / 100)) + "\u2013" + fmt(p + R - Math.round((p + R) * dp / 100)) + " " + uLabel();
  } else { f.style.display = "none"; }
}

/* ────────────────── Food row helpers ────────────────── */

function addFoodRow() {
  var r = document.createElement("div"); r.className = "receipt-row-add";
  r.innerHTML = '<input type="number" min="0" inputmode="numeric" placeholder="Receipt ' + ($("foodRows").children.length + 1) + ' amount (THB)"><button type="button" class="rm">\u00d7</button>';
  r.querySelector(".rm").onclick = function () {
    r.remove();
    [...$("foodRows").children].forEach(function (c, i) { c.querySelector("input").placeholder = "Receipt " + (i + 1) + " amount (THB)"; });
  };
  $("foodRows").appendChild(r);
}

/* ────────────────── Setup ────────────────── */

export function setupFinalBillUI() {
  /* Refresh */
  $("refreshBtn").onclick = loadAllBookings;

  /* Search */
  $("searchBtn").onclick = async function () {
    var t2 = $("searchNm").value.trim().toLowerCase();
    if (!t2) return;
    $("searchRes").innerHTML = '<div class="hint">' + T("searching") + '</div>';
    try {
      var snap = await getDocs(query(collection(db, "bookings"), where("guestNameLower", "==", t2)));
      var docs = []; snap.forEach(function (d) { docs.push({ id: d.id, data: d.data() }); });
      docs.sort(function (a, b) { return (b.data.createdAt && b.data.createdAt.toMillis ? b.data.createdAt.toMillis() : 0) - (a.data.createdAt && a.data.createdAt.toMillis ? a.data.createdAt.toMillis() : 0); });
      if (!docs.length) { $("searchRes").innerHTML = '<div class="hint">' + T("noSearch") + '</div>'; return; }
      $("searchRes").innerHTML = "";
      docs.forEach(function (item) {
        bkCache[item.id] = item.data;
        var div = document.createElement("div"); div.className = "result-item";
        var nameDiv = document.createElement("div"); nameDiv.className = "ri-name"; nameDiv.textContent = item.data.guestName; div.appendChild(nameDiv);
        var detDiv = document.createElement("div"); detDiv.className = "ri-detail";
        var di = item.data.boarding ? item.data.boarding.startDate + "\u2192" + item.data.boarding.endDate : (lang === "th" ? "ไม่มีฝากเลี้ยง" : "No boarding");
        detDiv.textContent = di + " \u00b7 " + fmt(item.data.grandTotal || 0) + " THB"; div.appendChild(detDiv);
        makeDelBtn(div, item.id);
        div.addEventListener("click", function (e) { if (e.target.closest(".del-btn") || e.target.closest(".confirm-bar")) return; loadBooking(item.id, item.data); $("bookWrap").style.display = "none"; });
        $("searchRes").appendChild(div);
      });
    } catch (e) { $("searchRes").innerHTML = '<div class="hint">Error: ' + e.message + '</div>'; }
  };

  /* Extra boarding toggle */
  $("incExtra").onchange = function () { $("extraBlock").style.display = $("incExtra").checked ? "block" : "none"; updExtra(); };
  $("extraStart").onchange = updExtra;
  $("extraEnd").onchange   = updExtra;
  $("extraDisc").onchange  = updExtra;

  /* Confirm booking */
  $("confirmBtn").onclick = function () {
    $("datesEdit").style.display = "none"; $("datesLock").style.display = "block"; $("confirmBtn").style.display = "none";
    var s = $("finDStart").value, e = $("finDEnd").value;
    var sd = new Date(s + "T00:00:00"), ed = new Date(e + "T00:00:00");
    $("datesLabel").textContent = "\u2713 " + s + " \u2192 " + e + " (" + nightLbl(Math.round((ed - sd) / 86400000)) + ")";
    if (state.loadedBooking && state.loadedBooking.id) {
      updateDoc(doc(db, "bookings", state.loadedBooking.id), {
        confirmedDates: true, confirmedStartDate: s, confirmedEndDate: e,
        depositPaid: parseFloat($("depPaid").value) || 0,
      }).catch(function (e2) { console.error(e2); });
    }
  };
  $("editDatesBtn").onclick = function () {
    $("datesEdit").style.display = "block"; $("datesLock").style.display = "none"; $("confirmBtn").style.display = "block";
  };

  /* Additional grooming toggle */
  $("incGroomF").onchange = function () {
    $("groomBlkF").style.display = $("incGroomF").checked ? "block" : "none";
    if ($("incGroomF").checked && !state.groomApiF) state.groomApiF = buildGroom($("groomBlkF"), "gF", "dog", updAddG);
    updAddG();
  };

  /* Food rows */
  $("addFoodBtn").onclick = addFoodRow;
  addFoodRow();

  /* ── Generate final bill ── */
  $("genFinBtn").onclick = function () {
    $("finErr").style.display = "none";
    if (!state.loadedBooking || !state.loadedBooking.data) { $("finErr").textContent = T("loadBookingFirst"); $("finErr").style.display = "block"; return; }

    var data = state.loadedBooking.data, gn = data.guestName, u = uLabel();
    var boardAmt = data.boarding ? data.boarding.totalDue : 0;

    /* Extra boarding */
    var exBrd = null;
    if (data.boarding && $("incExtra").checked) {
      var es = $("extraStart").value, ee = $("extraEnd").value;
      if (es && ee) {
        var esD = new Date(es + "T00:00:00"), eeD = new Date(ee + "T00:00:00");
        var n = Math.round((eeD - esD) / 86400000);
        if (n > 0) {
          var rate = eRate(data.boarding), dp = parseInt($("extraDisc").value) || 0;
          var tb = rate * n, da = Math.round(tb * dp / 100), ta = tb - da;
          exBrd = { start: es, end: ee, nights: n, rate: rate, tb: tb, dp: dp, da: da, total: ta };
        }
      }
    }

    /* Pre-booked grooming */
    var preGA = 0, preGAct = 0;
    if (data.grooming) {
      if (data.grooming.isRange) {
        preGAct = parseFloat($("actualGroom").value);
        if (isNaN(preGAct) || preGAct < 0) { $("finErr").textContent = T("enterActual"); $("finErr").style.display = "block"; return; }
        var gdp = data.grooming.discountPct || 0;
        preGA = preGAct - Math.round(preGAct * gdp / 100);
      } else { preGA = data.grooming.total; }
    }

    /* Additional grooming */
    var addGA = 0;
    if ($("incGroomF").checked) {
      if (!state.groomApiF) state.groomApiF = buildGroom($("groomBlkF"), "gF", "dog", updAddG);
      var gr = calcGroom(state.groomApiF, "gF");
      if (gr.isRange) {
        var av = parseFloat($("addGroomPrice").value);
        if (isNaN(av) || av < 0) { $("finErr").textContent = T("enterActualAdd"); $("finErr").style.display = "block"; return; }
        addGA = av - Math.round(av * gr.discountPct / 100);
      } else { addGA = gr.total; }
    }

    var afterH = parseFloat($("afterHrs").value) || 0;
    var dcH    = data.boarding ? (parseFloat($("dcHrs").value) || 0) : 0;
    var dcA    = dcH * DC_RATE;
    var foods  = [...$("foodRows").children].map(function (r) { return parseFloat(r.querySelector("input").value) || 0; }).filter(function (v) { return v > 0; });
    var foodT  = foods.reduce(function (s, v) { return s + v; }, 0);
    var depA   = parseFloat($("depPaid").value) || 0;
    var sub    = boardAmt + (exBrd ? exBrd.total : 0) + preGA + addGA + afterH + dcA + foodT;
    var out    = sub - depA;

    var lines = [];
    lines.push(T("rcptFinal") + " \u2014 " + gn);
    lines.push("\u2501".repeat(23));

    if (data.boarding) {
      var bd = data.boarding, bdp = bd.discountPct || 0;
      lines.push(T("rcptBoarding"));
      lines.push("  " + rLbl(bd) + " \u00b7 " + nightLbl(bd.nights) + (bdp > 0 ? " \u00b7 " + pctOff(bdp) : ""));
      lines.push("  " + $("finDStart").value + " \u2192 " + $("finDEnd").value);
      lines.push("  " + fmt(boardAmt) + " " + u);
      lines.push("");
    }

    if (exBrd) {
      lines.push(T("rcptAddBoard"));
      lines.push("  " + rLbl(data.boarding) + " \u00b7 " + nightLbl(exBrd.nights));
      lines.push("  " + exBrd.start + " \u2192 " + exBrd.end);
      lines.push("  " + fmt(exBrd.rate) + " " + u + " \u00d7 " + exBrd.nights + " = " + fmt(exBrd.tb) + " " + u);
      if (exBrd.dp > 0) lines.push("  " + T("rcptDiscount") + " (" + pctOff(exBrd.dp) + ") = -" + fmt(exBrd.da) + " " + u);
      lines.push("  " + T("rcptTotal") + ": " + fmt(exBrd.total) + " " + u);
      lines.push("");
    }

    if (data.grooming) {
      var gd = data.grooming, gdp2 = gd.discountPct || 0;
      lines.push(T("rcptPreGroom"));
      if (gd.isRange) {
        lines.push("  " + fmt(preGAct) + " " + u);
        if (gdp2 > 0) {
          lines.push("  " + T("rcptDiscount") + " (" + pctOff(gdp2) + "): -" + fmt(Math.round(preGAct * gdp2 / 100)) + " " + u);
          lines.push("  " + T("rcptTotal") + ": " + fmt(preGA) + " " + u);
        }
      } else { lines.push("  " + fmt(preGA) + " " + u); }
      lines.push("");
    }

    var items = [];
    if (addGA > 0) items.push([T("rcptGroomAdd"), addGA]);
    if (afterH > 0) items.push([T("rcptAfterHrs"), afterH]);
    if (dcA > 0) items.push([T("rcptLatePick") + " (" + dcH + "h)", dcA]);
    foods.forEach(function (a, i) { items.push([T("rcptFood") + " #" + (i + 1), a]); });
    if (items.length > 0) {
      lines.push(T("rcptAddItems"));
      lines.push("\u2500".repeat(30));
      items.forEach(function (item, i) { lines.push("  " + (i + 1) + ". " + pR(item[0], 24) + pL(fmt(item[1]), 6) + " " + u); });
      lines.push("");
    }

    lines.push("\u2500".repeat(30));
    lines.push("  " + pR(T("rcptSubtotal"), 24) + pL(fmt(sub), 6) + " " + u);
    lines.push("");
    if (depA > 0) lines.push("  " + pR(T("rcptDepPaid"), 24) + pL("-" + fmt(depA), 6) + " " + u);
    lines.push("");
    lines.push("\u2501".repeat(23));
    lines.push("  " + pR(T("rcptTotalOut"), 24) + pL(fmt(out), 6) + " " + u);

    $("finRT").textContent = lines.join("\n");
    $("finRW").classList.add("show");
    $("finRW").scrollIntoView({ behavior: "smooth", block: "nearest" });

    state.lastFin = {
      guestName: gn, data: data, preGroomAmt: preGA, preGroomActual: preGAct,
      addGroomAmt: addGA, exBrd: exBrd, afterH: afterH, dcH: dcH, dcAmt: dcA,
      depAmt: depA, foods: foods, subtot: sub, outstanding: out,
    };
    $("finSaveSt").textContent = "";
  };

  /* Copy */
  $("finCopyBtn").onclick = function () { copyToClipboard($("finRT").textContent, $("finCopyBtn")); };

  /* Save / finalize */
  $("finSaveBtn").onclick = function () {
    if (!state.lastFin) return;
    var s = $("finSaveSt"); s.textContent = T("saving"); s.className = "smsg";
    var lf = state.lastFin;
    var payload = {
      finalBill: {
        preGroomActual: lf.preGroomActual || null,
        addGroomActual: lf.addGroomAmt > 0 ? lf.addGroomAmt : null,
        extraBoarding:  lf.exBrd,
        afterHoursFee:  lf.afterH,
        daycareHrs:     lf.dcH,
        daycareTotal:   lf.dcAmt,
        depositPaid:    lf.depAmt,
        foodReceipts:   lf.foods,
        totalOutstanding: lf.outstanding,
        receiptText:    $("finRT").textContent,
      },
      status: "finalized",
      finalizedAt: serverTimestamp(),
    };
    var p;
    if (state.loadedBooking && state.loadedBooking.id) {
      p = updateDoc(doc(db, "bookings", state.loadedBooking.id), payload);
    } else {
      p = addDoc(collection(db, "bookings"), Object.assign({
        guestName: lf.guestName, guestNameLower: lf.guestName.toLowerCase(),
        boarding: null, grooming: null, grandTotal: 0, createdAt: serverTimestamp(),
      }, payload));
    }
    p.then(function () { s.textContent = "Saved \u2713"; s.className = "smsg ok"; })
     .catch(function (e) { s.textContent = "Error: " + e.message; s.className = "smsg err"; });
  };
}
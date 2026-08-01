// ──────────────────────────────────────────────
// Final Bill tab — bookings CRUD, final receipt
// ──────────────────────────────────────────────
import { T, pctOff, nightLbl, uLabel, fmt, thb, lang } from './i18n.js';
import { R, DC_RATE, eRate, petS, rLbl, CAT_G, DOG_G, DAYCARE_4H, DAYCARE_8H } from './pricing.js';
import { state, bkCache } from './state.js';
import { $, pR, pL, copyToClipboard, showInlineConfirm, setA } from './utils.js';
import { buildGroomList, calcGroom } from './grooming.js';
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
      if (data.boarding) {
        if (data.boarding.isDayCare) {
          var _dch = data.boarding.dayCareHours || 4;
          var _dcl = _dch === 4 ? T("dayCare4h") : T("dayCare8h");
          html += "<br>" + petS(data.boarding) + " \u00b7 " + T("dayCare") + " \u00b7 " + data.boarding.startDate + " \u00b7 " + _dcl;
          html += "<br>" + T("dayCare") + " <b>" + thb(data.boarding.totalDue) + "</b>";
        } else {
          html += "<br>" + petS(data.boarding) + " \u00b7 " + data.boarding.nights + "N \u00b7 " + data.boarding.startDate + "\u2192" + data.boarding.endDate;
          html += "<br>" + T("boarding") + " <b>" + thb(data.boarding.totalDue) + "</b>";
        }
      }
      if (data.grooming && data.grooming.length) {
        var gTotalLow = data.grooming.reduce(function (s, g) { return s + g.total; }, 0);
        var gTotalHigh = data.grooming.reduce(function (s, g) { return s + (g.isRange ? g.totalHigh : g.total); }, 0);
        var gAnyRange = data.grooming.some(function (g) { return g.isRange; });
        var gt = gAnyRange ? fmt(gTotalLow) + "\u2013" + fmt(gTotalHigh) : fmt(gTotalLow);
        html += "<br>" + T("grooming") + " <b>" + gt + " THB</b>" + (data.grooming.length > 1 ? " (" + data.grooming.length + " " + (lang === "th" ? "ตัว" : "pets") + ")" : "");
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
          if (data.boarding.isDayCare) {
            var _dch2 = data.boarding.dayCareHours || 4;
            var _dcl2 = _dch2 === 4 ? T("dayCare4h") : T("dayCare8h");
            $("datesLabel").textContent = "\u2713 " + data.confirmedStartDate + " \u00b7 " + _dcl2;
          } else {
            var sd2 = new Date(data.confirmedStartDate + "T00:00:00"), ed2 = new Date(data.confirmedEndDate + "T00:00:00");
            $("datesLabel").textContent = "\u2713 " + data.confirmedStartDate + " \u2192 " + data.confirmedEndDate + " (" + nightLbl(Math.round((ed2 - sd2) / 86400000)) + ")";
          }
        } else {
          $("finDStart").value = data.boarding.startDate; $("finDEnd").value = data.boarding.endDate;
          $("depPaid").value = 0;
          $("datesEdit").style.display = "block"; $("datesLock").style.display = "none"; $("confirmBtn").style.display = "block";
        }
        var bOnly = data.boardOnlyTotal || data.boarding.totalDue;
        if (data.boarding.isDayCare) {
          $("depHint").textContent = T("dayCareNoDep");
        } else {
          $("depHint").textContent = T("depSug") + " " + fmt(Math.round(bOnly * 0.5)) + " " + uLabel();
        }
      } else { $("datesCard").style.display = "none"; }

      var groomList = $("confirmGroomList");
      groomList.innerHTML = "";
      if (data.grooming && data.grooming.some(function (g) { return g.isRange; })) {
        $("confirmGroom").style.display = "block";
        data.grooming.forEach(function (g, gi) {
          if (!g.isRange) return;
          var gdp = g.discountPct || 0;
          var wrap = document.createElement("div");
          wrap.className = "field";
          var lbl = document.createElement("label");
          lbl.textContent = (data.grooming.length > 1 ? T("petLabel") + " " + (gi + 1) + " \u2014 " : "") + T("actualGroomAmt");
          var inp = document.createElement("input");
          inp.type = "number"; inp.min = "0"; inp.inputMode = "numeric"; inp.id = "actualGroom" + gi;
          var hint1 = document.createElement("div");
          hint1.className = "hint";
          hint1.textContent = (lang === "th" ? "ประมาณ: " : "Estimated: ") + fmt(g.origLow || g.total) + "\u2013" + fmt(g.origHigh || g.totalHigh) + " " + uLabel() + (gdp > 0 ? " (" + pctOff(gdp) + ")" : "");
          var hint2 = document.createElement("div");
          hint2.className = "hint";
          hint2.textContent = gdp > 0 ? pctOff(gdp) + " \u2014 " + (lang === "th" ? "ใส่ราคาก่อนลด" : "Enter pre-discount price") : T("enterActual");
          wrap.appendChild(lbl); wrap.appendChild(inp); wrap.appendChild(hint1); wrap.appendChild(hint2);
          groomList.appendChild(wrap);
        });
      } else {
        $("confirmGroom").style.display = "none";
      }

      if (data.boarding && !data.boarding.isDayCare) {
        $("extraCard").style.display = "block";
        $("incExtra").checked = false; $("extraBlock").style.display = "none";
        $("extraRateH").textContent = rLbl(data.boarding) + ": " + fmt(eRate(data.boarding)) + " " + uLabel() + "/" + (lang === "th" ? "คืน" : "night");
        $("extraCalc").textContent = ""; $("extraDisc").value = "0";
      } else { $("extraCard").style.display = "none"; }

      $("daycareF").style.display = (data.boarding && !data.boarding.isDayCare) ? "block" : "none";

      /* Late Checkout — only for multi-night, non-day-care stays */
      if (data.boarding && data.boarding.nights > 1 && !data.boarding.isDayCare) {
        $("lateCheckoutF").style.display = "block";
        $("lateCheckoutCb").checked = false;
        $("lateCheckoutDurF").style.display = "none";
        state.lateCheckout = false;
        state.lateCheckoutDuration = "4";
        setA($("lateCheckoutSeg"), "4");
      } else {
        $("lateCheckoutF").style.display = "none";
        $("lateCheckoutDurF").style.display = "none";
        state.lateCheckout = false;
      }
    } else {
      $("datesCard").style.display = "none"; $("confirmGroom").style.display = "none";
      $("extraCard").style.display = "none"; $("daycareF").style.display = "none";
      $("lateCheckoutF").style.display = "none"; $("lateCheckoutDurF").style.display = "none";
    }
  } catch (e) { console.error("loadBooking:", e); }

  $("finRW").classList.remove("show");
  $("incGroomF").checked = false; $("groomBlkF").style.display = "none"; $("groomBlkF").innerHTML = "";
  $("addGroomF").style.display = "none"; $("addGroomF").innerHTML = ""; state.groomApiF = null;
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

/* ────────────────── Additional grooming hints ────────────────── */

function updAddG() {
  var f = $("addGroomF");
  if (!state.groomApiF || !$("incGroomF").checked) { f.style.display = "none"; f.innerHTML = ""; return; }
  var apis = state.groomApiF.getEntries();
  var rangeEntries = [];
  apis.forEach(function (api, i) { if (api.isRange()) rangeEntries.push({ api: api, i: i }); });
  if (rangeEntries.length === 0) { f.style.display = "none"; f.innerHTML = ""; return; }
  f.style.display = "block";
  f.innerHTML = "";
  rangeEntries.forEach(function (entry) {
    var st = entry.api.getState(), p = 0;
    if (st.groomType === "basic") p = st.species === "cat" ? CAT_G.basic[st.weight] : DOG_G.basic[st.coat][st.weight];
    else if (st.groomType === "full") p = st.species === "cat" ? CAT_G.full[st.weight] : DOG_G.full[st.coat][st.weight];
    var dp = parseInt(entry.api.container.querySelector("#" + entry.api.px + "Disc").value) || 0;

    var wrap = document.createElement("div");
    wrap.className = "field";
    var lbl = document.createElement("label");
    lbl.textContent = (apis.length > 1 ? T("petLabel") + " " + (entry.i + 1) + " \u2014 " : "") + T("actualAddGroomAmt");
    var inp = document.createElement("input");
    inp.type = "number"; inp.min = "0"; inp.inputMode = "numeric"; inp.id = "addGroomPrice" + entry.i;
    var hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = pctOff(dp) + ": " + fmt(p - Math.round(p * dp / 100)) + "\u2013" + fmt(p + R - Math.round((p + R) * dp / 100)) + " " + uLabel();

    wrap.appendChild(lbl); wrap.appendChild(inp); wrap.appendChild(hint);
    f.appendChild(wrap);
  });
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
    if (state.loadedBooking && state.loadedBooking.data && state.loadedBooking.data.boarding && state.loadedBooking.data.boarding.isDayCare) {
      var _dcH = state.loadedBooking.data.boarding.dayCareHours || 4;
      var _dcL = _dcH === 4 ? T("dayCare4h") : T("dayCare8h");
      $("datesLabel").textContent = "\u2713 " + s + " \u00b7 " + _dcL;
    } else {
      $("datesLabel").textContent = "\u2713 " + s + " \u2192 " + e + " (" + nightLbl(Math.round((ed - sd) / 86400000)) + ")";
    }
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

  /* Late Checkout toggle */
  $("lateCheckoutCb").onchange = function () {
    state.lateCheckout = $("lateCheckoutCb").checked;
    if (state.lateCheckout) {
      $("lateCheckoutDurF").style.display = "block";
      $("lateCheckoutDurF").classList.remove("dc-reveal");
      void $("lateCheckoutDurF").offsetWidth;
      $("lateCheckoutDurF").classList.add("dc-reveal");
    } else {
      $("lateCheckoutDurF").style.display = "none";
    }
  };
  $("lateCheckoutSeg").onclick = function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    state.lateCheckoutDuration = b.dataset.v;
    setA($("lateCheckoutSeg"), state.lateCheckoutDuration);
  };

  /* Additional grooming toggle */
  $("incGroomF").onchange = function () {
    $("groomBlkF").style.display = $("incGroomF").checked ? "block" : "none";
    if ($("incGroomF").checked && !state.groomApiF) state.groomApiF = buildGroomList($("groomBlkF"), "gF", "dog", updAddG);
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
    if (data.boarding && !data.boarding.isDayCare && $("incExtra").checked) {
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

    /* Pre-booked grooming (up to 3 records) */
    var preGA = 0, preGActArr = [];
    if (data.grooming && data.grooming.length) {
      for (var pgi = 0; pgi < data.grooming.length; pgi++) {
        var pgEntry = data.grooming[pgi];
        if (pgEntry.isRange) {
          var pgActEl = $("actualGroom" + pgi);
          var pgAct = parseFloat(pgActEl ? pgActEl.value : NaN);
          if (isNaN(pgAct) || pgAct < 0) { $("finErr").textContent = T("enterActual"); $("finErr").style.display = "block"; return; }
          var pgdp = pgEntry.discountPct || 0;
          preGActArr.push(pgAct);
          preGA += pgAct - Math.round(pgAct * pgdp / 100);
        } else {
          preGActArr.push(null);
          preGA += pgEntry.total;
        }
      }
    }

    /* Additional grooming (up to 3 records) */
    var addGA = 0, addGAEntries = [];
    if ($("incGroomF").checked) {
      if (!state.groomApiF) state.groomApiF = buildGroomList($("groomBlkF"), "gF", "dog", updAddG);
      var apis2 = state.groomApiF.getEntries();
      for (var ai = 0; ai < apis2.length; ai++) {
        var rE = calcGroom(apis2[ai]);
        var amtE;
        if (rE.isRange) {
          var avEl = $("addGroomPrice" + ai);
          var avv = parseFloat(avEl ? avEl.value : NaN);
          if (isNaN(avv) || avv < 0) { $("finErr").textContent = T("enterActualAdd"); $("finErr").style.display = "block"; return; }
          amtE = avv - Math.round(avv * rE.discountPct / 100);
        } else {
          amtE = rE.total;
        }
        addGA += amtE;
        addGAEntries.push(amtE);
      }
    }

    var afterH = parseFloat($("afterHrs").value) || 0;
    var dcH    = (data.boarding && !data.boarding.isDayCare) ? (parseFloat($("dcHrs").value) || 0) : 0;
    var dcA    = dcH * DC_RATE;
    var foods  = [...$("foodRows").children].map(function (r) { return parseFloat(r.querySelector("input").value) || 0; }).filter(function (v) { return v > 0; });
    var foodT  = foods.reduce(function (s, v) { return s + v; }, 0);
    var depA   = parseFloat($("depPaid").value) || 0;

    /* Late Checkout */
    var lcAmt = 0;
    if (state.lateCheckout && data.boarding && data.boarding.nights > 1 && !data.boarding.isDayCare) {
      var lcHrs = parseInt(state.lateCheckoutDuration) || 4;
      lcAmt = lcHrs === 4 ? DAYCARE_4H : DAYCARE_8H;
    }

    var sub    = boardAmt + (exBrd ? exBrd.total : 0) + preGA + addGA + afterH + dcA + foodT;
    var out    = sub - depA + lcAmt;

    var lines = [];
    lines.push(T("rcptFinal") + " \u2014 " + gn);
    lines.push("\u2501".repeat(23));

    if (data.boarding) {
      if (data.boarding.isDayCare) {
        var petLbl = data.boarding.petType === "dog" ? "DOG" : "CAT";
        var dcHrs2 = data.boarding.dayCareHours || 4;
        var dcLbl = dcHrs2 === 4 ? T("dayCare4h") : T("dayCare8h");
        lines.push(T("rcptDayCare") + " \u2014 " + petLbl);
        lines.push("  " + data.boarding.startDate + " \u00b7 " + dcLbl);
        lines.push("  " + fmt(boardAmt) + " " + u);
        lines.push("");
      } else {
        var bd = data.boarding, bdp = bd.discountPct || 0;
        lines.push(T("rcptBoarding"));
        lines.push("  " + rLbl(bd) + " \u00b7 " + nightLbl(bd.nights) + (bdp > 0 ? " \u00b7 " + pctOff(bdp) : ""));
        lines.push("  " + $("finDStart").value + " \u2192 " + $("finDEnd").value);
        lines.push("  " + fmt(boardAmt) + " " + u);
        lines.push("");
      }
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

    if (data.grooming && data.grooming.length) {
      lines.push(T("rcptPreGroom"));
      data.grooming.forEach(function (pgEntry, pgi) {
        var pfx = data.grooming.length > 1 ? T("petLabel") + " " + (pgi + 1) + ": " : "";
        if (pgEntry.isRange) {
          var pgAct2 = preGActArr[pgi];
          var pgdp2 = pgEntry.discountPct || 0;
          lines.push("  " + pfx + fmt(pgAct2) + " " + u);
          if (pgdp2 > 0) {
            lines.push("  " + T("rcptDiscount") + " (" + pctOff(pgdp2) + "): -" + fmt(Math.round(pgAct2 * pgdp2 / 100)) + " " + u);
            lines.push("  " + T("rcptTotal") + ": " + fmt(pgAct2 - Math.round(pgAct2 * pgdp2 / 100)) + " " + u);
          }
        } else {
          lines.push("  " + pfx + fmt(pgEntry.total) + " " + u);
        }
      });
      lines.push("");
    }

    var items = [];
    addGAEntries.forEach(function (amtE, aei) {
      if (amtE > 0) items.push([T("rcptGroomAdd") + (addGAEntries.length > 1 ? " (" + T("petLabel") + " " + (aei + 1) + ")" : ""), amtE]);
    });
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
    if (lcAmt > 0) {
      var lcLabel = state.lateCheckoutDuration === "4" ? T("dayCare4h") : T("dayCare8h");
      lines.push("\u2500".repeat(30));
      lines.push("  " + pR(T("dayCare") + " (" + lcLabel + ")", 24) + pL(fmt(lcAmt), 6) + " " + u);
      lines.push("\u2500".repeat(30));
      lines.push("");
    }
    lines.push("\u2501".repeat(23));
    lines.push("  " + pR(T("rcptTotalOut"), 24) + pL(fmt(out), 6) + " " + u);

    $("finRT").textContent = lines.join("\n");
    $("finRW").classList.add("show");
    $("finRW").scrollIntoView({ behavior: "smooth", block: "nearest" });

    state.lastFin = {
      guestName: gn, data: data, preGroomAmt: preGA, preGroomActual: preGActArr,
      addGroomAmt: addGA, addGroomEntries: addGAEntries, exBrd: exBrd, afterH: afterH, dcH: dcH, dcAmt: dcA,
      depAmt: depA, foods: foods, subtot: sub, outstanding: out, lcAmt: lcAmt,
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
        preGroomActual: (lf.preGroomActual && lf.preGroomActual.length) ? lf.preGroomActual : null,
        addGroomActual: lf.addGroomAmt > 0 ? lf.addGroomAmt : null,
        addGroomEntries: (lf.addGroomEntries && lf.addGroomEntries.length) ? lf.addGroomEntries : null,
        extraBoarding:  lf.exBrd,
        afterHoursFee:  lf.afterH,
        daycareHrs:     lf.dcH,
        daycareTotal:   lf.dcAmt,
        depositPaid:    lf.depAmt,
        foodReceipts:   lf.foods,
        lateCheckoutAmt: lf.lcAmt || 0,
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

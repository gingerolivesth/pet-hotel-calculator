// ──────────────────────────────────────────────
// Grooming form builder & cost calculator
// ──────────────────────────────────────────────
import { T, pctOff, uLabel, fmt } from './i18n.js';
import { RANGE, DEMAT, CAT_G, DOG_G, CAT_A, CAT_AK, DOG_A, DOG_AK } from './pricing.js';
import { $, pR, pL, setA } from './utils.js';

/**
 * Build a grooming form into `container` with element-id prefix `px`.
 * Returns { getState(), isRange(), container, px }.
 */
export function buildGroom(container, px, defSp, onChg) {
  container.innerHTML =
    '<div class="field"><label>' + T("species") + '</label>' +
      '<div class="seg" id="' + px + 'Sp"><button type="button" data-v="dog">' + T("dog") + '</button>' +
      '<button type="button" data-v="cat">' + T("cat") + '</button></div></div>' +
    '<div class="field" id="' + px + 'Wf"><label>' + T("weightBand") + '</label>' +
      '<select id="' + px + 'W"></select></div>' +
    '<div class="field" id="' + px + 'Cf" style="display:none;"><label>' + T("coatLen") + '</label>' +
      '<div class="seg" id="' + px + 'Co"><button type="button" data-v="short">' + T("short") + '</button>' +
      '<button type="button" data-v="long">' + T("long") + '</button></div></div>' +
    '<div class="field"><label>' + T("groomType") + '</label>' +
      '<div class="seg" id="' + px + 'Gt"><button type="button" data-v="basic">' + T("basic") + '</button>' +
      '<button type="button" data-v="full">' + T("full") + '</button>' +
      '<button type="button" data-v="alacarte">' + T("alacarte") + '</button></div></div>' +
    '<div class="field" id="' + px + 'Af" style="display:none;"><label>' + T("selectItems") + '</label>' +
      '<div id="' + px + 'Al"></div></div>' +
    '<div class="field" id="' + px + 'Df" style="display:none;"><label>' + T("dematHrs") + '</label>' +
      '<input type="number" id="' + px + 'Dm" min="0" step="0.5" placeholder="0" inputmode="decimal"></div>' +
    '<div class="field"><label>' + T("discGroomLbl") + '</label>' +
      '<select id="' + px + 'Disc"><option value="0">' + T("noDisc") + '</option>' +
      '<option value="10">' + T("d10") + '</option><option value="20">' + T("d20") + '</option>' +
      '<option value="30">' + T("d30") + '</option><option value="40">' + T("d40") + '</option>' +
      '<option value="50">' + T("d50") + '</option></select></div>';

  var st = { species: defSp, weight: null, coat: "short", groomType: "basic", alacarte: {} };
  var spS = $(px + "Sp"), wS = $(px + "W"), cF = $(px + "Cf"), cS = $(px + "Co");
  var gS  = $(px + "Gt"), aF = $(px + "Af"), aL = $(px + "Al");
  var dF  = $(px + "Df"), dS = $(px + "Disc");

  function wO() {
    return st.species === "cat"
      ? [["0-2","wb02"],["2-5","wb25"],[">5","wbGt5"]]
      : [["<2","wbLt2"],["2-5","wb25"],["5-10","wb510"],["10-15","wb1015"]];
  }
  function rW() {
    wS.innerHTML = "";
    wO().forEach(function (o) {
      var opt = document.createElement("option");
      opt.value = o[0]; opt.textContent = T(o[1]);
      wS.appendChild(opt);
    });
    st.weight = wS.value;
  }
  function rA() {
    var li = st.species === "cat" ? CAT_A : DOG_A;
    var keys = st.species === "cat" ? CAT_AK : DOG_AK;
    aL.innerHTML = "";
    st.alacarte = {};
    li.forEach(function (item, i) {
      var w = document.createElement("label");
      w.className = "checkline";
      w.innerHTML = '<input type="checkbox"><span>' + T(keys[i]) + " (+" + item[1] + " " + uLabel() + ")</span>";
      aL.appendChild(w);
      w.querySelector("input").onchange = function (e) {
        st.alacarte[item[0]] = e.target.checked ? item[1] : 0;
        if (onChg) onChg();
      };
    });
  }
  function sync() {
    aF.style.display = st.groomType === "alacarte" ? "block" : "none";
    dF.style.display = st.groomType === "alacarte" ? "block" : "none";
  }

  spS.onclick = function (e) { var b = e.target.closest("button"); if (!b) return; st.species = b.dataset.v; setA(spS, st.species); cF.style.display = st.species === "dog" ? "block" : "none"; rW(); rA(); sync(); if (onChg) onChg(); };
  wS.onchange  = function () { st.weight = wS.value; if (onChg) onChg(); };
  cS.onclick   = function (e) { var b = e.target.closest("button"); if (!b) return; st.coat = b.dataset.v; setA(cS, st.coat); if (onChg) onChg(); };
  gS.onclick   = function (e) { var b = e.target.closest("button"); if (!b) return; st.groomType = b.dataset.v; setA(gS, st.groomType); sync(); if (onChg) onChg(); };
  dS.onchange  = function () { if (onChg) onChg(); };

  setA(spS, st.species);
  cF.style.display = st.species === "dog" ? "block" : "none";
  rW();
  setA(cS, "short");
  setA(gS, "basic");
  rA();

  return {
    getState:  function () { return st; },
    isRange:   function () { return (st.groomType !== "alacarte") && (st.species === "cat" || (st.species === "dog" && st.coat === "long")); },
    container: container,
    px: px,
  };
}

/**
 * Build a repeatable list (1–3) of grooming forms into `container`, with
 * an "add another pet" button and per-entry remove buttons. Used so up to
 * 3 pets (e.g. cats sharing a big room) can each get their own grooming
 * charge, itemized individually in estimates and final bills.
 * Returns { getEntries(), container }.
 */
export function buildGroomList(container, px, defSp, onChg, max) {
  max = max || 3;
  var entries = [];
  var counter = 0;

  var listDiv = document.createElement("div");
  var addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "add-line-btn";
  addBtn.textContent = T("addAnotherPet");

  container.innerHTML = "";
  container.appendChild(listDiv);
  container.appendChild(addBtn);

  function relabel() {
    entries.forEach(function (e, i) {
      e.title.textContent = T("petLabel") + " " + (i + 1);
      e.rm.style.display = entries.length > 1 ? "inline-block" : "none";
    });
    addBtn.style.display = entries.length >= max ? "none" : "block";
  }

  function addEntry() {
    if (entries.length >= max) return;
    var idx = counter++;
    var wrap = document.createElement("div");
    wrap.className = "groom-entry";
    var head = document.createElement("div");
    head.className = "groom-entry-head";
    var title = document.createElement("span");
    title.className = "groom-entry-title";
    var rm = document.createElement("button");
    rm.type = "button";
    rm.className = "rm";
    rm.textContent = "\u00d7";
    head.appendChild(title);
    head.appendChild(rm);
    var formDiv = document.createElement("div");
    wrap.appendChild(head);
    wrap.appendChild(formDiv);
    listDiv.appendChild(wrap);

    var api = buildGroom(formDiv, px + idx, defSp, onChg);
    var entry = { api: api, wrap: wrap, title: title, rm: rm };
    entries.push(entry);

    rm.onclick = function () {
      var i = entries.indexOf(entry);
      if (i === -1) return;
      wrap.remove();
      entries.splice(i, 1);
      relabel();
      if (onChg) onChg();
    };

    relabel();
  }

  addBtn.onclick = function () { addEntry(); if (onChg) onChg(); };

  addEntry();

  return {
    getEntries: function () { return entries.map(function (e) { return e.api; }); },
    container: container,
  };
}

/**
 * Calculate grooming costs from a single buildGroom() API.
 */
export function calcGroom(bk) {
  var st = bk.getState(), ct = bk.container, px = bk.px, u = uLabel();
  var dm = st.groomType === "alacarte"
    ? (parseFloat(ct.querySelector("#" + px + "Dm").value) || 0) : 0;
  var discPct = parseInt(ct.querySelector("#" + px + "Disc").value) || 0;
  var isR = bk.isRange(), items = [], label = "";

  if (st.groomType === "basic") {
    var p = st.species === "cat" ? CAT_G.basic[st.weight] : DOG_G.basic[st.coat][st.weight];
    label = T("rBasicGroom"); items.push([label, p]);
  } else if (st.groomType === "full") {
    var p2 = st.species === "cat" ? CAT_G.full[st.weight] : DOG_G.full[st.coat][st.weight];
    label = T("rFullGroom"); items.push([label, p2]);
  } else {
    label = T("alacarte");
    var keys = st.species === "cat" ? CAT_AK : DOG_AK;
    var alaArr = st.species === "cat" ? CAT_A : DOG_A;
    Object.entries(st.alacarte).forEach(function (e) {
      if (e[1] > 0) {
        var idx = alaArr.findIndex(function (a) { return a[0] === e[0]; });
        items.push([idx >= 0 ? T(keys[idx]) : e[0], e[1]]);
      }
    });
    if (dm > 0) items.push([T("rDematting") + " (" + dm + "h)", dm * DEMAT]);
  }

  var oL = items.reduce(function (s, i) { return s + i[1]; }, 0);
  var oH = isR ? oL + RANGE : oL;
  var dAL = Math.round(oL * discPct / 100), dAH = Math.round(oH * discPct / 100);
  var dTL = oL - dAL, dTH = oH - dAH;

  var sL = st.species === "cat" ? T("cat") : T("dog");
  var cL = st.species === "dog" ? (st.coat === "short" ? T("rShortCoat") : T("rLongCoat")) : "";
  var sub = [wB(st.species, st.weight), cL].filter(Boolean).join(", ");
  var LW = 28, RW = 12, lines = [];

  lines.push(T("grooming") + " \u2014 " + sL + ", " + label + (sub ? " (" + sub + ")" : "") + (discPct > 0 ? " \u00b7 " + pctOff(discPct) : ""));
  items.forEach(function (i) {
    if (isR && i[1] === oL) lines.push("  " + pR(i[0] + ":", LW) + fmt(i[1]) + "\u2013" + fmt(i[1] + RANGE) + " " + u);
    else lines.push("  " + pR(i[0] + ":", LW) + pL(fmt(i[1]) + " " + u, RW));
  });
  lines.push("  " + "\u2500".repeat(38));
  if (isR) lines.push("  " + pR(T("rcptGroomTot") + ":", LW) + fmt(oL) + "\u2013" + fmt(oH) + " " + u);
  else     lines.push("  " + pR(T("rcptGroomTot") + ":", LW) + pL(fmt(oL) + " " + u, RW));

  if (discPct > 0) {
    if (isR) lines.push("  " + pR(T("rcptPromotion") + " (" + pctOff(discPct) + "):", LW) + "-" + fmt(dAL) + "\u2013" + fmt(dAH) + " " + u);
    else     lines.push("  " + pR(T("rcptPromotion") + " (" + pctOff(discPct) + "):", LW) + pL("-" + fmt(dAL) + " " + u, RW));
    lines.push("  " + "\u2500".repeat(38));
    if (isR) lines.push("  " + pR(T("rcptAfterDisc") + ":", LW) + fmt(dTL) + "\u2013" + fmt(dTH) + " " + u);
    else     lines.push("  " + pR(T("rcptAfterDisc") + ":", LW) + pL(fmt(dTL) + " " + u, RW));
  }

  return {
    total: dTL, discTotalLow: dTL, discTotalHigh: dTH,
    origLow: oL, origHigh: oH, isRange: isR, discountPct: discPct,
    lines: lines,
    raw: { species: st.species, weight: st.weight, coat: st.coat, groomType: st.groomType, alacarte: st.alacarte, demattingHrs: dm },
  };
}

/**
 * Calculate + combine grooming costs for every entry in a buildGroomList()
 * API. Aggregates totals and prefixes each entry's receipt lines with a
 * "Pet N" label when there is more than one entry.
 */
export function calcGroomAll(listApi) {
  var apis = listApi.getEntries();
  var results = apis.map(function (api) { return calcGroom(api); });
  var multi = results.length > 1;
  var lines = [];
  results.forEach(function (r, i) {
    if (multi) lines.push(T("petLabel") + " " + (i + 1));
    lines = lines.concat(r.lines);
    if (i < results.length - 1) lines.push("");
  });

  return {
    entries: results,
    total: results.reduce(function (s, r) { return s + r.discTotalLow; }, 0),
    discTotalLow: results.reduce(function (s, r) { return s + r.discTotalLow; }, 0),
    discTotalHigh: results.reduce(function (s, r) { return s + r.discTotalHigh; }, 0),
    origLow: results.reduce(function (s, r) { return s + r.origLow; }, 0),
    origHigh: results.reduce(function (s, r) { return s + r.origHigh; }, 0),
    isRange: results.some(function (r) { return r.isRange; }),
    lines: lines,
  };
}

function wB(sp, v) {
  if (!v) return "";
  var m = sp === "cat"
    ? { "0-2": "0\u20132kg", "2-5": "2\u20135kg", ">5": ">5kg" }
    : { "<2": "<2kg", "2-5": "2\u20135kg", "5-10": "5\u201310kg", "10-15": "10\u201315kg" };
  return m[v] || "";
}

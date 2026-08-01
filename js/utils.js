// ──────────────────────────────────────────────
// DOM helpers, clipboard, inline confirm dialog
// ──────────────────────────────────────────────
import { T, lang } from './i18n.js';

export function $(id) { return document.getElementById(id); }

export function pR(s, l) {
  s = String(s);
  return s + " ".repeat(Math.max(0, l - s.length));
}

export function pL(s, l) {
  s = String(s);
  return " ".repeat(Math.max(0, l - s.length)) + s;
}

export function drS(s, e) {
  var sd  = s.getDate(), ed = e.getDate();
  var my  = e.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  var sm  = s.toLocaleDateString("en-GB", { month: "short" });
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear())
    return sd + "\u2013" + ed + " " + my;
  return sd + " " + sm + " \u2013 " + ed + " " +
    e.toLocaleDateString("en-GB", { month: "short" }) + " " + e.getFullYear();
}

export function setA(seg, val) {
  [...seg.children].forEach(function (b) {
    b.classList.toggle("active", b.dataset.v === val);
  });
}

/* ── Copy (sandbox-safe, no alert) ── */
export function copyToClipboard(text, btnEl) {
  var ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  var ok = false;
  try { ok = document.execCommand("copy"); } catch (_) {}
  document.body.removeChild(ta);

  function flash() {
    var orig = btnEl.textContent;
    btnEl.textContent = T("copiedOk");
    btnEl.classList.add("copied");
    setTimeout(function () { btnEl.textContent = orig; btnEl.classList.remove("copied"); }, 1500);
  }

  if (ok) { flash(); return; }
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(flash).catch(function () {
      btnEl.textContent = T("copyFail");
      setTimeout(function () { btnEl.textContent = T("copyText"); }, 2000);
    });
  } else {
    btnEl.textContent = T("copyFail");
    setTimeout(function () { btnEl.textContent = T("copyText"); }, 2000);
  }
}

/* ── Inline confirm dialog (sandbox-safe) ── */
export function showInlineConfirm(parentDiv, onYes) {
  var existing = parentDiv.querySelector(".confirm-bar");
  if (existing) { existing.remove(); return; }

  var bar = document.createElement("div");
  bar.className = "confirm-bar";

  var msg = document.createElement("span");
  msg.textContent = T("confirmDel");
  bar.appendChild(msg);

  var noBtn = document.createElement("button");
  noBtn.type = "button";
  noBtn.className = "cb-no";
  noBtn.textContent = lang === "th" ? "ไม่" : "No";
  noBtn.onclick = function (e) { e.stopPropagation(); bar.remove(); };
  bar.appendChild(noBtn);

  var yesBtn = document.createElement("button");
  yesBtn.type = "button";
  yesBtn.className = "cb-yes";
  yesBtn.textContent = lang === "th" ? "ใช่" : "Yes";
  yesBtn.onclick = function (e) { e.stopPropagation(); bar.remove(); onYes(); };
  bar.appendChild(yesBtn);

  parentDiv.appendChild(bar);
  yesBtn.focus();
}
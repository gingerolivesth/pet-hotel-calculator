// ──────────────────────────────────────────────
// Main entry — wires modules, tabs, lang toggle
// ──────────────────────────────────────────────
import { lang, setLang, applyLang } from './i18n.js';
import { $ } from './utils.js';
import { setupBoardingUI } from './boarding.js';
import { setupEstimateUI, hideEstReceipt } from './estimate.js';
import { setupFinalBillUI, loadAllBookings } from './final-bill.js';

/* ── Wire up boarding → hide receipt on change ── */
setupBoardingUI(hideEstReceipt);

/* ── Estimate tab ── */
setupEstimateUI();

/* ── Final bill tab ── */
setupFinalBillUI();

/* ── Tab switching ── */
$("tabEst").onclick = function () {
  $("tabEst").classList.add("active");
  $("tabFin").classList.remove("active");
  $("estView").style.display = "block";
  $("finView").style.display = "none";
};

$("tabFin").onclick = function () {
  $("tabFin").classList.add("active");
  $("tabEst").classList.remove("active");
  $("finView").style.display = "block";
  $("estView").style.display = "none";
  loadAllBookings();
};

/* ── Language toggle ── */
$("langBtn").onclick = function () {
  setLang(lang === "en" ? "th" : "en");
  applyLang();
  loadAllBookings();
};

/* ── Initial language pass ── */
applyLang();

console.log("Pet Hotel Calculator loaded. Lang:", lang);
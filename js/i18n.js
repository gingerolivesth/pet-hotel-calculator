// ──────────────────────────────────────────────
// Language system — EN / TH translations
// ──────────────────────────────────────────────
export let lang = localStorage.getItem("petLang") || "en";

const L = {};

export function def(k, en, th)   { L[k] = [en, th]; }
export function T(k)             { return (L[k] && L[k][lang === "th" ? 1 : 0]) || k; }
export function pctOff(p)        { return lang === "th" ? " ลด " + p + "%" : p + "% off"; }
export function nightLbl(n)      { return lang === "th" ? n + " คืน" : n + (n === 1 ? " Night" : " Nights"); }
export function uLabel()         { return lang === "th" ? "บาท" : "THB"; }
export function fmt(n)           { return Math.round(n).toLocaleString("en-US"); }
export function thb(n)           { return fmt(n) + " " + uLabel(); }

export function setLang(newLang) {
  lang = newLang;
  localStorage.setItem("petLang", lang);
}

/* ── UI labels ── */
def("brand",        "🐾 Pet Hotel Calculator",     "🐾 ระบบคำนวณโรงแรมสัตว์");
def("staff",        "Staff Tool",                   "เครื่องมือพนักงาน");
def("tEst",         "New Estimate",                 "ใบประมาณราคา");
def("tFin",         "Final Bill",                   "ใบเสร็จ");
def("guestN",       "Guest Name",                   "ชื่อลูกค้า");
def("guestPh",      "e.g. Somchai / Bella's owner", "เช่น สมชาย");
def("guestNamePh",  "Guest name",                   "ชื่อลูกค้า");
def("boarding",     "Boarding",                     "ฝากเลี้ยง");
def("petType",      "Pet Type",                     "ประเภทสัตว์");
def("dog",          "Dog",                          "สุนัข");
def("cat",          "Cat",                          "แมว");
def("numDogs",      "Number of Dogs",               "จำนวนสุนัข");
def("oneDog",       "1 Dog",                        "1 ตัว");
def("twoDogs",      "2 Dogs",                       "2 ตัว");
def("roomSize",     "Room Size",                    "ขนาดห้อง");
def("smRoom",       "Small Room (1 cat)",           "ห้องเล็ก (1 ตัว)");
def("bgRoom",       "Big Room (2 cats)",            "ห้องใหญ่ (2 ตัว)");
def("extraCat",     "Extra Cat",                    "แมวเพิ่ม");
def("extraCatLbl",  "Extra cat (+50 THB/night)",    "แมวเพิ่ม (+50 บาท/คืน)");
def("startD",       "Start Date",                   "วันเริ่มต้น");
def("endD",         "End Date",                     "วันสิ้นสุด");
def("discBoardLbl", "Discount (boarding only)",      "ส่วนลด (ค่าฝากเลี้ยง)");
def("noDisc",       "No discount",                  "ไม่มีส่วนลด");
def("d10",          "10% off",                      "ลด 10%");
def("d20",          "20% off",                      "ลด 20%");
def("d30",          "30% off",                      "ลด 30%");
def("d40",          "40% off",                      "ลด 40%");
def("d50",          "50% off",                      "ลด 50%");
def("grooming",     "Grooming",                     "อาบน้ำตัดขน");
def("species",      "Species",                      "ประเภท");
def("weightBand",   "Weight Band",                  "ช่วงน้ำหนัก");
def("coatLen",      "Coat Length",                  "ความยาวขน");
def("short",        "Short",                        "สั้น");
def("long",         "Long",                         "ยาว");
def("groomType",    "Groom Type",                   "ประเภทบริการ");
def("basic",        "Basic",                        "Basic");
def("full",         "Full",                         "Full");
def("alacarte",     "A la carte",                   "เลือกรายการ");
def("selectItems",  "Select Items",                 "เลือกรายการ");
def("dematHrs",     "Intensive Dematting (hours)",   "กำจัดขนสัก (ชม.)");
def("discGroomLbl", "Discount (grooming)",           "ส่วนลด (อาบน้ำตัดขน)");
def("genEst",       "Generate Estimate",            "สร้างใบประมาณราคา");
def("copyText",     "Copy Text",                    "คัดลอก");
def("saveBooking",  "Save Booking",                 "บันทึกการจอง");
def("allBookings",  "All Saved Bookings",           "การจองทั้งหมด");
def("refresh",      "Refresh",                      "รีเฟรช");
def("searchByName", "Search by Name",               "ค้นหาตามชื่อ");
def("find",         "Find",                         "ค้นหา");
def("delete",       "Delete",                       "ลบ");
def("noBookings",   "No saved bookings yet.",       "ยังไม่มีการจอง");
def("loading",      "Loading...",                   "กำลังโหลด...");
def("chooseOther",  "Choose a different booking",   "เลือกการจองอื่น");
def("deleteBooking","Delete booking",               "ลบการจอง");
def("bookingDates", "Booking Dates & Deposit",      "วันที่จอง & เงินมัดจำ");
def("checkin",      "Check-in",                     "เช็คอิน");
def("checkout",     "Check-out",                    "เช็คเอาท์");
def("depPaid",      "Deposit Paid (THB)",           "เงินมัดจำ (บาท)");
def("confirmBooking","Confirm Booking",             "ยืนยันการจอง");
def("editDates",    "Edit Dates",                   "แก้ไขวันที่");
def("confirmGroomTitle","Confirm Pre-booked Grooming","ยืนยันค่าอาบน้ำตัดขน");
def("actualGroomAmt","Actual grooming amount (THB)","ราคาจริง (บาท)");
def("addBoarding",  "Additional Boarding",          "ฝากเลี้ยงเพิ่มเติม");
def("discount",     "Discount",                     "ส่วนลด");
def("addGrooming",  "Additional Grooming",          "อาบน้ำตัดขนเพิ่ม");
def("actualAddGroomAmt","Actual additional grooming amount (THB)","ราคาจริงเพิ่ม (บาท)");
def("hotelExtras",  "Hotel Extras",                 "ค่าใช้จ่ายเพิ่มเติม");
def("afterHours",   "After-Hours Fee (leave blank if none)","ค่ารับช้า (เว้นว่างหากไม่มี)");
def("latePickup",   "Late Pickup (hours after 3pm on checkout)","รับช้า (ชม.หลัง 15:00)");
def("latePickupHint","50 THB per hour. Pickup by 3pm is free.","50 บาท/ชม. รับก่อน 15:00 ฟรี");
def("foodTreats",   "Food / Treats (from supermarket)","อาหาร / ขนม");
def("addReceipt",   "+ Add Receipt",                "+ เพิ่มใบเสร็จ");
def("genFinBill",   "Generate Final Bill",          "สร้างใบเสร็จ");
def("markFin",      "Mark as Finalized",            "บันทึกเสร็จสิ้น");
def("footer",       "Deposit is always 50% of the boarding total.","มัดจำคือ 50% ของค่าฝากเลี้ยง");
def("enterGn",      "Please enter a guest name.",   "กรุณาใส่ชื่อลูกค้า");
def("incLeast",     "Include at least Boarding or Grooming.","เลือกอย่างน้อย 1 อย่าง");
def("selBoth",      "Please select both dates.",    "กรุณาเลือกวันที่");
def("endAfter",     "End date must be after start date.","วันสิ้นสุดต้องหลังวันเริ่ม");
def("endMustBe",    "End must be after start.",     "วันสิ้นสุดต้องหลังวันเริ่ม");
def("noSearch",     "No bookings found.",           "ไม่พบการจอง");
def("searching",    "Searching...",                 "กำลังค้นหา...");
def("enterActual",  "Enter actual grooming price.", "ใส่ราคาจริง");
def("enterActualAdd","Enter actual additional grooming price.","ใส่ราคาจริงเพิ่มเติม");
def("saving",       "Saving...",                    "กำลังบันทึก...");
def("savedOk",      "Saved ✓",                      "บันทึกแล้ว ✓");
def("copiedOk",     "Copied ✓",                     "คัดลอกแล้ว ✓");
def("boardDisc",    "Boarding discount:",           "ส่วนลดค่าฝากเลี้ยง:");
def("saved",        "saved",                        "ประหยัด");
def("depSug",       "Suggested 50% deposit:",       "มัดจำ 50% แนะนำ:");
def("loaded",       "Loaded:",                      "โหลด:");
def("confirmDel",   "Delete this booking?",         "ลบการจองนี้?");
def("groomOnlyMsg", "Please let us know which date you would like to come over.","กรุณาแจ้งวันที่ต้องการเข้ามา");
def("depositBoardMsg","If you would like to confirm, please make a 50% deposit for boarding","หากต้องการยืนยัน กรุณาชำระมัดจำ 50% สำหรับค่าฝากเลี้ยง");
def("depositMsg",   "If you would like to confirm this booking, please make a 50% deposit","หากต้องการยืนยัน กรุณาชำระมัดจำ 50%");
def("loadBookingFirst","Please load a booking first.","กรุณาโหลดการจองก่อน");
def("copyFail",     "Copy failed",                  "คัดลอกไม่สำเร็จ");

/* ── Receipt labels ── */
def("rcptBoarding",  "BOARDING",               "ค่าฝากเลี้ยง");
def("rcptAddBoard",  "ADDITIONAL BOARDING",    "ฝากเลี้ยงเพิ่มเติม");
def("rcptPreGroom",  "PRE-BOOKED GROOMING",    "ค่าอาบน้ำตัดขนที่จองไว้");
def("rcptAddItems",  "ADDITIONAL ITEMS",        "รายการเพิ่มเติม");
def("rcptAfterHrs",  "After-Hours Fee",        "ค่ารับช้า");
def("rcptLatePick",  "Late Pickup",            "รับช้า");
def("rcptFood",      "Food/Treats",            "อาหาร/ขนม");
def("rcptGroomAdd",  "Grooming (add-on)",      "อาบน้ำตัดขน (เพิ่ม)");
def("rcptSubtotal",  "Subtotal",               "รวม");
def("rcptDepPaid",   "Deposit Paid",           "มัดจำ");
def("rcptTotalOut",  "TOTAL OUTSTANDING",      "ยอดคงค้าง");
def("rcptTotal",     "Total",                  "รวม");
def("rcptDiscount",  "Discount",               "ส่วนลด");
def("rcptAfterDisc", "After Discount",         "หลังลด");
def("rcptPromotion", "Promotion",              "โปรโมชั่น");
def("rcptRate",      "Rate per night",         "ราคาต่อคืน");
def("rcptCalc",      "Calculation",            "การคำนวณ");
def("rcptSubN",      "Subtotal/night",         "รวม/คืน");
def("rcptEst",       "ESTIMATE",               "ใบประมาณราคา");
def("rcptFinal",     "FINAL BILL",             "ใบเสร็จ");
def("rcptGrand",     "ESTIMATED TOTAL",        "ยอดรวมประมาณ");
def("rcptGroomTot",  "Grooming Total",         "รวมค่าอาบน้ำตัดขน");

/* ── Room / pet labels ── */
def("rDogRoom",    "Dog Room",              "ห้องสุนัข");
def("rDogRoom2",   "Dog Room (2 dogs)",     "ห้องสุนัข (2 ตัว)");
def("rDogBoarding","Dog boarding",           "ค่าฝากสุนัข");
def("rAddDog",     "Additional dog",         "สุนัขตัวที่ 2");
def("rExtraCat",   "Extra cat",             "แมวเพิ่ม");
def("r1Dog",       "1 DOG",                 "สุนัข 1 ตัว");
def("r2Dogs",      "2 DOGS",                "สุนัข 2 ตัว");
def("r1Cat",       "1 CAT",                 "แมว 1 ตัว");
def("rNCatsSuffix"," CATS",                 " ตัว");
def("rBasicGroom", "Basic Groom",           "Basic Groom");
def("rFullGroom",  "Full Groom",            "Full Groom");
def("rDematting",  "Dematting",             "กำจัดขนสัก");
def("rShortCoat",  "Short Coat",            "ขนสั้น");
def("rLongCoat",   "Long Coat",             "ขนยาว");
def("petS1Dog",    "1 Dog",                 "สุนัข 1 ตัว");
def("petS2Dogs",   "2 Dogs",                "สุนัข 2 ตัว");
def("petS1CatS",   "1 Cat (Small)",         "แมว 1 ตัว (เล็ก)");
def("petS2CatB",   "2 Cats (Big)",          "แมว 2 ตัว (ใหญ่)");
def("petSSqueeze", " +squeeze",             "+ บีบ");
def("wbLt2",       "< 2 kg",               "< 2 กก.");
def("wb25",        "2–5 kg",               "2–5 กก.");
def("wb510",       "5–10 kg",              "5–10 กก.");
def("wb1015",      "10–15 kg",             "10–15 กก.");
def("wb02",        "0–2 kg",               "0–2 กก.");
def("wbGt5",       "> 5 kg",               "> 5 กก.");
def("ala0",        "Trim Cut",              "ตัดขน");
def("ala1",        "Clipping of nails",     "ตัดเล็บ");
def("ala2",        "Eyes and Ears Cleaning","ทำความสะอาดหูตา");
def("ala3",        "Paw Belly Sanitary Trim","ตัดขนอุ้งเท้า/ท้อง");
def("ala4",        "Conditioning Treatment","ทรีตเมนต์");
def("ala5",        "Paw Pad Moisturizing",  "เพิ่มความชุ่มชื้นอุ้งเท้า");
def("ala6",        "Coat Detox",            "ดีท็อกซ์ขน");

/* ── Apply all [data-t] / [data-tp] attributes ── */
export function applyLang() {
  document.querySelectorAll("[data-t]").forEach(function (el) {
    var k = el.dataset.t;
    if (L[k]) el.textContent = L[k][lang === "th" ? 1 : 0];
  });
  document.querySelectorAll("[data-tp]").forEach(function (el) {
    var k = el.dataset.tp;
    if (L[k]) el.placeholder = L[k][lang === "th" ? 1 : 0];
  });
  document.getElementById("langBtn").textContent =
    lang === "th" ? "🇬🇧 English" : "🇹🇭 ภาษาไทย";
}
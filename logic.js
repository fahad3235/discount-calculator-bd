// Discount Calculator BD \u2014 pure logic (no DOM). Money is integer paisa.
// Works in Node (module.exports) and in the browser (window.DiscountCalc).
(function (root) {
  'use strict';
  var BN_DIGITS = ['\u09e6', '\u09e7', '\u09e8', '\u09e9', '\u09ea', '\u09eb', '\u09ec', '\u09ed', '\u09ee', '\u09ef'];
  var BN_MAP = { '\u09e6': '0', '\u09e7': '1', '\u09e8': '2', '\u09e9': '3', '\u09ea': '4', '\u09eb': '5', '\u09ec': '6', '\u09ed': '7', '\u09ee': '8', '\u09ef': '9' };

  function normalizeDigits(s) {
    return String(s).replace(/[\u09e6-\u09ef]/g, function (c) { return BN_MAP[c]; });
  }
  function toBnDigits(s) {
    return String(s).replace(/[0-9]/g, function (c) { return BN_DIGITS[Number(c)]; });
  }
  // Parse a user-typed amount (Bengali digits + commas accepted) to integer paisa.
  // Returns null on invalid input.
  function toPaisa(raw) {
    if (raw === null || raw === undefined) return null;
    var s = normalizeDigits(String(raw)).trim().replace(/,/g, '');
    if (s === '' || !/^\d+(\.\d{1,4})?$/.test(s)) return null;
    var v = Math.round(parseFloat(s) * 100);
    if (!isFinite(v) || v < 0) return null;
    return v;
  }
  function toQty(raw) {
    if (raw === null || raw === undefined) return null;
    var s = normalizeDigits(String(raw)).trim();
    if (!/^\d+$/.test(s)) return null;
    var v = parseInt(s, 10);
    if (v < 1 || v > 9999) return null;
    return v;
  }
  function toPct(raw) {
    if (raw === null || raw === undefined) return null;
    var s = normalizeDigits(String(raw)).trim().replace(/,/g, '');
    if (s === '' || !/^\d+(\.\d{1,4})?$/.test(s)) return null;
    var v = parseFloat(s);
    if (!isFinite(v) || v < 0) return null;
    return v;
  }
  function fmtMoney(paisa, lang) {
    var neg = paisa < 0;
    var abs = Math.abs(paisa);
    var whole = Math.floor(abs / 100);
    var frac = abs % 100;
    var ws = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var out = '\u09f3' + ws + '.' + (frac < 10 ? '0' : '') + frac;
    if (neg) out = '-' + out;
    return lang === 'bn' ? toBnDigits(out) : out;
  }
  function fmtPct(v, lang) {
    var s = (Math.round(v * 100) / 100).toString();
    if (s.indexOf('.') === -1) s += '.00';
    else { var p = s.split('.'); s = p[0] + '.' + (p[1] + '00').slice(0, 2); }
    return lang === 'bn' ? toBnDigits(s) + '%' : s + '%';
  }
  function fmtNum(n, lang) {
    return lang === 'bn' ? toBnDigits(String(n)) : String(n);
  }

  // Single-deal calculation. pricePaisa: int; mode: 'pct' | 'flat';
  // discountValue: pct number (0..100) or flat paisa int; qty: int; vatPct: 0..100.
  function calcDeal(o) {
    if (typeof o.pricePaisa !== 'number' || o.pricePaisa <= 0) return { error: 'bad_price' };
    if (o.qty !== undefined && (typeof o.qty !== 'number' || o.qty < 1)) return { error: 'bad_qty' };
    var qty = o.qty || 1;
    var vat = (o.vatPct === undefined || o.vatPct === null) ? 0 : o.vatPct;
    if (typeof vat !== 'number' || vat < 0 || vat > 100) return { error: 'bad_vat' };
    var discount;
    if (o.mode === 'pct') {
      if (typeof o.discountValue !== 'number' || o.discountValue < 0 || o.discountValue > 100) return { error: 'bad_pct' };
      discount = Math.round(o.pricePaisa * o.discountValue / 100);
    } else if (o.mode === 'flat') {
      if (typeof o.discountValue !== 'number' || o.discountValue < 0 || o.discountValue > o.pricePaisa) return { error: 'bad_flat' };
      discount = o.discountValue;
    } else return { error: 'bad_mode' };
    var net = o.pricePaisa - discount;
    var vatAmt = Math.round(net * vat / 100);
    var unitFinal = net + vatAmt;
    var effPct = o.pricePaisa === 0 ? 0 : (discount / o.pricePaisa) * 100;
    return {
      discountPaisa: discount, netPaisa: net, vatPaisa: vatAmt,
      unitFinalPaisa: unitFinal, totalPaisa: unitFinal * qty,
      savedPaisa: discount * qty, effPct: effPct
    };
  }
  function compareDeals(aFinal, bFinal) {
    if (aFinal === bFinal) return { cheaper: 'tie', diffPaisa: 0 };
    if (aFinal < bFinal) return { cheaper: 'A', diffPaisa: bFinal - aFinal };
    return { cheaper: 'B', diffPaisa: aFinal - bFinal };
  }
  function makeId() {
    return 'd' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  }
  function todayISO(d) {
    d = d || new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }
  function validateImport(data) {
    if (!data || typeof data !== 'object' || data.version !== 1 || !Array.isArray(data.entries)) return { ok: false, error: 'bad_shape' };
    var seen = {};
    for (var i = 0; i < data.entries.length; i++) {
      var e = data.entries[i];
      if (!e || typeof e !== 'object') return { ok: false, error: 'bad_entry' };
      if (typeof e.id !== 'string' || e.id === '' || seen[e.id]) return { ok: false, error: 'bad_id' };
      seen[e.id] = true;
      if (typeof e.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) return { ok: false, error: 'bad_date' };
      if (typeof e.summary !== 'string' || e.summary === '') return { ok: false, error: 'bad_summary' };
      if (typeof e.totalPaisa !== 'number' || e.totalPaisa < 0 || Math.floor(e.totalPaisa) !== e.totalPaisa) return { ok: false, error: 'bad_total' };
    }
    return { ok: true };
  }

  var api = {
    BN_DIGITS: BN_DIGITS, normalizeDigits: normalizeDigits, toBnDigits: toBnDigits,
    toPaisa: toPaisa, toQty: toQty, toPct: toPct,
    fmtMoney: fmtMoney, fmtPct: fmtPct, fmtNum: fmtNum,
    calcDeal: calcDeal, compareDeals: compareDeals,
    makeId: makeId, todayISO: todayISO, validateImport: validateImport
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DiscountCalc = api;
})(typeof window !== 'undefined' ? window : this);

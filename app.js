// Discount Calculator BD \u2014 DOM wiring + i18n. All user-visible strings live here.
(function () {
  'use strict';
  var L = window.DiscountCalc;
  var I18N = {
    en: {
      title: 'Discount Calculator BD', subtitle: 'Was vs now prices, VAT, and deal comparison \u2014 offline, in taka.',
      tab_calc: 'Calculator', tab_compare: 'Compare Deals', tab_history: 'History', tab_data: 'Data',
      calc_heading: 'Single deal', lbl_price: 'Original price (taka)', lbl_mode: 'Discount type',
      mode_pct: 'Percent off (%)', mode_flat: 'Flat off (taka)',
      lbl_disc_pct: 'Discount (%)', lbl_disc_flat: 'Discount (taka)',
      lbl_qty: 'Quantity', lbl_vat: 'VAT (%) \u2014 optional', btn_calc: 'Calculate',
      res_heading: 'Result', res_orig: 'Original (per item)', res_disc: 'Discount (per item)',
      res_net: 'After discount', res_vat: 'VAT (per item)', res_unit: 'Final (per item)',
      res_total: 'Total to pay', res_saved: 'You save', res_eff: 'Effective discount',
      btn_save: 'Save to history', cmp_heading: 'Which deal is cheaper?',
      deal_a: 'Deal A', deal_b: 'Deal B', btn_compare: 'Compare',
      cmp_a_final: 'Deal A final (per item)', cmp_b_final: 'Deal B final (per item)',
      hist_heading: 'Saved calculations', hist_empty: 'No saved calculations yet. Calculate a deal and tap Save to history.',
      btn_clear_hist: 'Clear history', data_heading: 'Export / import',
      data_blurb: 'Your history lives only in this browser. Export a JSON backup, or paste one back here.',
      btn_export: 'Export JSON', lbl_import: 'Paste backup JSON', btn_import: 'Import',
      btn_erase: 'Erase all data',
      footer: 'Offline tool. Prices and discounts are the ones you type \u2014 no live market rates. VAT is applied after discount, as entered.',
      err_price: 'Enter a valid original price (more than 0 taka).',
      err_pct: 'Discount must be between 0% and 100%.',
      err_flat: 'Flat discount cannot be more than the original price.',
      err_qty: 'Quantity must be a whole number from 1 to 9999.',
      err_vat: 'VAT must be between 0% and 100%.',
      saved: 'Saved!', import_ok: 'Import successful.',
      import_bad: 'Invalid backup format \u2014 nothing was changed.',
      erase_confirm: 'Tap again to confirm', erase_done: 'All data erased.',
      verdict_a: 'Deal A is cheaper by {AMT} per item.',
      verdict_b: 'Deal B is cheaper by {AMT} per item.',
      verdict_tie: 'Both deals cost the same per item.',
      del: 'Delete'
    },
    bn: {
      title: '\u09a1\u09bf\u09b8\u0995\u09be\u0989\u09a8\u09cd\u099f \u0995\u09cd\u09af\u09be\u09b2\u0995\u09c1\u09b2\u09c7\u099f\u09b0 \u09ac\u09bf\u09a1\u09bf', subtitle: '\u0986\u0997\u09c7\u09b0 \u09a6\u09be\u09ae \u09ac\u09a8\u09be\u09ae \u098f\u0996\u09a8\u0995\u09be\u09b0 \u09a6\u09be\u09ae, \u09ad\u09cd\u09af\u09be\u099f \u098f\u09ac\u0982 \u09a1\u09bf\u09b2 \u09a4\u09c1\u09b2\u09a8\u09be \u2014 \u0985\u09ab\u09b2\u09be\u0987\u09a8\u09c7, \u099f\u09be\u0995\u09be\u09af\u09bc\u0964',
      tab_calc: '\u0995\u09cd\u09af\u09be\u09b2\u0995\u09c1\u09b2\u09c7\u099f\u09b0', tab_compare: '\u09a1\u09bf\u09b2 \u09a4\u09c1\u09b2\u09a8\u09be', tab_history: '\u0987\u09a4\u09bf\u09b9\u09be\u09b8', tab_data: '\u09a1\u09c7\u099f\u09be',
      calc_heading: '\u098f\u0995\u099f\u09bf \u09a1\u09bf\u09b2', lbl_price: '\u0986\u09b8\u09b2 \u09a6\u09be\u09ae (\u099f\u09be\u0995\u09be)', lbl_mode: '\u099b\u09be\u09a1\u09bc\u09c7\u09b0 \u09a7\u09b0\u09a8',
      mode_pct: '\u09b6\u09a4\u0995\u09b0\u09be \u099b\u09be\u09a1\u09bc (%)', mode_flat: '\u09a8\u09bf\u09b0\u09cd\u09a6\u09bf\u09b7\u09cd\u099f \u099f\u09be\u0995\u09be \u099b\u09be\u09a1\u09bc',
      lbl_disc_pct: '\u099b\u09be\u09a1\u09bc (%)', lbl_disc_flat: '\u099b\u09be\u09a1\u09bc (\u099f\u09be\u0995\u09be)',
      lbl_qty: '\u09aa\u09b0\u09bf\u09ae\u09be\u09a3', lbl_vat: '\u09ad\u09cd\u09af\u09be\u099f (%) \u2014 \u0990\u099a\u09cd\u099b\u09bf\u0995', btn_calc: '\u09b9\u09bf\u09b8\u09be\u09ac \u0995\u09b0\u09c1\u09a8',
      res_heading: '\u09ab\u09b2\u09be\u09ab\u09b2', res_orig: '\u0986\u09b8\u09b2 \u09a6\u09be\u09ae (\u09aa\u09cd\u09b0\u09a4\u09bf \u09aa\u09a3\u09cd\u09af)', res_disc: '\u099b\u09be\u09a1\u09bc (\u09aa\u09cd\u09b0\u09a4\u09bf \u09aa\u09a3\u09cd\u09af)',
      res_net: '\u099b\u09be\u09a1\u09bc\u09c7\u09b0 \u09aa\u09b0', res_vat: '\u09ad\u09cd\u09af\u09be\u099f (\u09aa\u09cd\u09b0\u09a4\u09bf \u09aa\u09a3\u09cd\u09af)', res_unit: '\u099a\u09c2\u09a1\u09bc\u09be\u09a8\u09cd\u09a4 \u09a6\u09be\u09ae (\u09aa\u09cd\u09b0\u09a4\u09bf \u09aa\u09a3\u09cd\u09af)',
      res_total: '\u09ae\u09cb\u099f \u09a6\u09bf\u09a4\u09c7 \u09b9\u09ac\u09c7', res_saved: '\u0986\u09aa\u09a8\u09bf \u09ac\u09be\u0981\u099a\u09be\u09b2\u09c7\u09a8', res_eff: '\u0995\u09be\u09b0\u09cd\u09af\u0995\u09b0 \u099b\u09be\u09a1\u09bc',
      btn_save: '\u0987\u09a4\u09bf\u09b9\u09be\u09b8\u09c7 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3 \u0995\u09b0\u09c1\u09a8', cmp_heading: '\u0995\u09cb\u09a8 \u09a1\u09bf\u09b2\u099f\u09bf \u09b8\u09b8\u09cd\u09a4\u09be?',
      deal_a: '\u09a1\u09bf\u09b2 A', deal_b: '\u09a1\u09bf\u09b2 B', btn_compare: '\u09a4\u09c1\u09b2\u09a8\u09be \u0995\u09b0\u09c1\u09a8',
      cmp_a_final: '\u09a1\u09bf\u09b2 A \u099a\u09c2\u09a1\u09bc\u09be\u09a8\u09cd\u09a4 (\u09aa\u09cd\u09b0\u09a4\u09bf \u09aa\u09a3\u09cd\u09af)', cmp_b_final: '\u09a1\u09bf\u09b2 B \u099a\u09c2\u09a1\u09bc\u09be\u09a8\u09cd\u09a4 (\u09aa\u09cd\u09b0\u09a4\u09bf \u09aa\u09a3\u09cd\u09af)',
      hist_heading: '\u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b9\u09bf\u09b8\u09be\u09ac', hist_empty: '\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u09b9\u09bf\u09b8\u09be\u09ac \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b9\u09af\u09bc\u09a8\u09bf\u0964 \u098f\u0995\u099f\u09bf \u09a1\u09bf\u09b2 \u09b9\u09bf\u09b8\u09be\u09ac \u0995\u09b0\u09c7 \u201c\u0987\u09a4\u09bf\u09b9\u09be\u09b8\u09c7 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3 \u0995\u09b0\u09c1\u09a8\u201d \u099a\u09be\u09aa\u09c1\u09a8\u0964',
      btn_clear_hist: '\u0987\u09a4\u09bf\u09b9\u09be\u09b8 \u09ae\u09c1\u099b\u09c1\u09a8', data_heading: '\u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f / \u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f',
      data_blurb: '\u0986\u09aa\u09a8\u09be\u09b0 \u0987\u09a4\u09bf\u09b9\u09be\u09b8 \u09b6\u09c1\u09a7\u09c1 \u098f\u0987 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7\u0987 \u09a5\u09be\u0995\u09c7\u0964 JSON \u09ac\u09cd\u09af\u09be\u0995\u0986\u09aa \u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f \u0995\u09b0\u09c1\u09a8, \u0985\u09a5\u09ac\u09be \u098f\u0996\u09be\u09a8\u09c7 \u09aa\u09c7\u09b8\u09cd\u099f \u0995\u09b0\u09c7 \u09ab\u09bf\u09b0\u09bf\u09af\u09bc\u09c7 \u0986\u09a8\u09c1\u09a8\u0964',
      btn_export: 'JSON \u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f', lbl_import: '\u09ac\u09cd\u09af\u09be\u0995\u0986\u09aa JSON \u09aa\u09c7\u09b8\u09cd\u099f \u0995\u09b0\u09c1\u09a8', btn_import: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f',
      btn_erase: '\u09b8\u09ac \u09a1\u09c7\u099f\u09be \u09ae\u09c1\u099b\u09c1\u09a8',
      footer: '\u0985\u09ab\u09b2\u09be\u0987\u09a8 \u099f\u09c1\u09b2\u0964 \u09a6\u09be\u09ae \u0993 \u099b\u09be\u09a1\u09bc \u0986\u09aa\u09a8\u09bf\u0987 \u099f\u09be\u0987\u09aa \u0995\u09b0\u09c7\u09a8 \u2014 \u0995\u09cb\u09a8\u09cb \u09b2\u09be\u0987\u09ad \u09ac\u09be\u099c\u09be\u09b0\u09a6\u09b0 \u09a8\u09c7\u0987\u0964 \u09ad\u09cd\u09af\u09be\u099f \u099b\u09be\u09a1\u09bc\u09c7\u09b0 \u09aa\u09b0\u09c7 \u09aa\u09cd\u09b0\u09af\u09cb\u099c\u09cd\u09af \u09b9\u09af\u09bc, \u09af\u09c7\u09ad\u09be\u09ac\u09c7 \u0986\u09aa\u09a8\u09bf \u09b2\u09bf\u0996\u09c7\u099b\u09c7\u09a8\u0964',
      err_price: '\u09b8\u09a0\u09bf\u0995 \u0986\u09b8\u09b2 \u09a6\u09be\u09ae \u09b2\u09bf\u0996\u09c1\u09a8 (\u09e6 \u099f\u09be\u0995\u09be\u09b0 \u09ac\u09c7\u09b6\u09bf)\u0964',
      err_pct: '\u099b\u09be\u09a1\u09bc \u09e6% \u09a5\u09c7\u0995\u09c7 \u09e7\u09e6\u09e6%-\u098f\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_flat: '\u09a8\u09bf\u09b0\u09cd\u09a6\u09bf\u09b7\u09cd\u099f \u099b\u09be\u09a1\u09bc \u0986\u09b8\u09b2 \u09a6\u09be\u09ae\u09c7\u09b0 \u09ac\u09c7\u09b6\u09bf \u09b9\u09a4\u09c7 \u09aa\u09be\u09b0\u09ac\u09c7 \u09a8\u09be\u0964',
      err_qty: '\u09aa\u09b0\u09bf\u09ae\u09be\u09a3 \u09e7 \u09a5\u09c7\u0995\u09c7 \u09ef\u09ef\u09ef\u09ef-\u098f\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09aa\u09c2\u09b0\u09cd\u09a3\u09b8\u0982\u0996\u09cd\u09af\u09be \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_vat: '\u09ad\u09cd\u09af\u09be\u099f \u09e6% \u09a5\u09c7\u0995\u09c7 \u09e7\u09e6\u09e6%-\u098f\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      saved: '\u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b9\u09af\u09bc\u09c7\u099b\u09c7!', import_ok: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09b8\u09ab\u09b2 \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      import_bad: '\u09ad\u09c1\u09b2 \u09ab\u09b0\u09ae\u09cd\u09af\u09be\u099f\u09c7\u09b0 JSON \u2014 \u0995\u09bf\u099b\u09c1\u0987 \u09ac\u09a6\u09b2\u09be\u09af\u09bc\u09a8\u09bf\u0964',
      erase_confirm: '\u09a8\u09bf\u09b6\u09cd\u099a\u09bf\u09a4 \u0995\u09b0\u09a4\u09c7 \u0986\u09ac\u09be\u09b0 \u099a\u09be\u09aa\u09c1\u09a8', erase_done: '\u09b8\u09ac \u09a1\u09c7\u099f\u09be \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      verdict_a: '\u09a1\u09bf\u09b2 A \u09b8\u09b8\u09cd\u09a4\u09be \u2014 \u09aa\u09cd\u09b0\u09a4\u09bf \u09aa\u09a3\u09cd\u09af\u09c7 {AMT} \u0995\u09ae\u0964',
      verdict_b: '\u09a1\u09bf\u09b2 B \u09b8\u09b8\u09cd\u09a4\u09be \u2014 \u09aa\u09cd\u09b0\u09a4\u09bf \u09aa\u09a3\u09cd\u09af\u09c7 {AMT} \u0995\u09ae\u0964',
      verdict_tie: '\u09a6\u09c1\u099f\u09bf \u09a1\u09bf\u09b2\u09c7\u09b0 \u09aa\u09cd\u09b0\u09a4\u09bf \u09aa\u09a3\u09cd\u09af\u09c7\u09b0 \u09a6\u09be\u09ae \u09b8\u09ae\u09be\u09a8\u0964',
      del: '\u09ae\u09c1\u099b\u09c1\u09a8'
    }
  };
  var ERRMAP = { bad_price: 'err_price', bad_pct: 'err_pct', bad_flat: 'err_flat', bad_qty: 'err_qty', bad_vat: 'err_vat', bad_mode: 'err_pct' };
  var lang = 'en';
  try { lang = localStorage.getItem('dcbd-lang') || 'en'; } catch (e) {}
  if (lang !== 'bn') lang = 'en';
  var history = [];
  try { history = JSON.parse(localStorage.getItem('dcbd-history') || '[]'); if (!Array.isArray(history)) history = []; } catch (e) { history = []; }
  var lastCalc = null, lastCmp = null;

  function t(k) { return (I18N[lang] && I18N[lang][k]) || I18N.en[k] || k; }
  function $(id) { return document.getElementById(id); }
  function saveHistory() { try { localStorage.setItem('dcbd-history', JSON.stringify(history)); } catch (e) {} }
  function fmt(p) { return L.fmtMoney(p, lang); }

  function applyLang() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    $('lang-btn').textContent = lang === 'en' ? '\u09ac\u09be\u0982\u09b2\u09be' : 'English';
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
    updateDiscLabel();
    renderHistory();
    try { localStorage.setItem('dcbd-lang', lang); } catch (e) {}
  }
  function updateDiscLabel() {
    var mode = document.querySelector('input[name="mode"]:checked').value;
    $('disc-label').textContent = mode === 'pct' ? t('lbl_disc_pct') : t('lbl_disc_flat');
  }
  function showTab(name) {
    document.querySelectorAll('.tab').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-tab') === name); });
    ['calc', 'compare', 'history', 'data'].forEach(function (s) { $('section-' + s).hidden = (s !== name); });
  }
  function renderHistory() {
    var list = $('history-list');
    list.innerHTML = '';
    $('history-empty').hidden = history.length !== 0;
    history.slice().reverse().forEach(function (e) {
      var li = document.createElement('li');
      var span = document.createElement('span');
      span.textContent = e.summary || (fmt(e.totalPaisa) + ' \u2014 ' + e.date);
      var del = document.createElement('button');
      del.className = 'del'; del.type = 'button'; del.textContent = '\u00d7'; del.title = t('del');
      del.setAttribute('aria-label', t('del'));
      del.addEventListener('click', function () {
        history = history.filter(function (x) { return x.id !== e.id; });
        saveHistory(); renderHistory();
      });
      li.appendChild(span); li.appendChild(del); list.appendChild(li);
    });
  }
  function summaryForCalc(r, pricePaisa, mode, discRaw, qty) {
    var discTxt = mode === 'pct' ? L.fmtPct(discRaw, lang) : fmt(discRaw);
    return fmt(pricePaisa) + ' \u2212' + discTxt + ' \u00d7' + L.fmtNum(qty, lang) + ' \u2192 ' + fmt(r.totalPaisa);
  }

  document.querySelectorAll('.tab').forEach(function (b) {
    b.addEventListener('click', function () { showTab(b.getAttribute('data-tab')); });
  });
  $('lang-btn').addEventListener('click', function () { lang = lang === 'en' ? 'bn' : 'en'; applyLang(); });
  document.querySelectorAll('input[name="mode"]').forEach(function (r) { r.addEventListener('change', updateDiscLabel); });
  document.querySelectorAll('.chip').forEach(function (c) {
    c.addEventListener('click', function () {
      $('mode-pct').checked = true; updateDiscLabel();
      $('disc').value = c.getAttribute('data-preset');
    });
  });

  $('calc-btn').addEventListener('click', function () {
    var price = L.toPaisa($('price').value);
    var qty = L.toQty($('qty').value);
    var vat = L.toPct($('vat').value);
    var mode = document.querySelector('input[name="mode"]:checked').value;
    var discRaw = $('disc').value.trim();
    var errEl = $('calc-error'); errEl.hidden = true;
    if (price === null || price <= 0) { errEl.textContent = t('err_price'); errEl.hidden = false; return; }
    if (qty === null) { errEl.textContent = t('err_qty'); errEl.hidden = false; return; }
    if (vat === null || vat > 100) { errEl.textContent = t('err_vat'); errEl.hidden = false; return; }
    var dv = mode === 'pct' ? L.toPct(discRaw) : L.toPaisa(discRaw);
    var r;
    if (mode === 'pct') r = L.calcDeal({ pricePaisa: price, mode: 'pct', discountValue: dv, qty: qty, vatPct: vat });
    else r = L.calcDeal({ pricePaisa: price, mode: 'flat', discountValue: dv, qty: qty, vatPct: vat });
    if (r.error) { errEl.textContent = t(ERRMAP[r.error] || 'err_price'); errEl.hidden = false; return; }
    $('res-orig').textContent = fmt(price);
    $('res-disc').textContent = fmt(r.discountPaisa);
    $('res-net').textContent = fmt(r.netPaisa);
    $('res-vat').textContent = fmt(r.vatPaisa);
    $('res-unit').textContent = fmt(r.unitFinalPaisa);
    $('res-total').textContent = fmt(r.totalPaisa);
    $('res-saved').textContent = fmt(r.savedPaisa);
    $('res-eff').textContent = L.fmtPct(r.effPct, lang);
    $('calc-results').hidden = false;
    $('save-msg').hidden = true;
    lastCalc = { pricePaisa: price, mode: mode, discRaw: dv, qty: qty, vatPct: vat, result: r };
  });
  $('save-btn').addEventListener('click', function () {
    if (!lastCalc) return;
    var e = { id: L.makeId(), date: L.todayISO(), kind: 'calc',
      summary: summaryForCalc(lastCalc.result, lastCalc.pricePaisa, lastCalc.mode, lastCalc.discRaw, lastCalc.qty),
      totalPaisa: lastCalc.result.totalPaisa };
    history.push(e); saveHistory(); renderHistory();
    $('save-msg').textContent = t('saved'); $('save-msg').hidden = false;
  });

  $('cmp-btn').addEventListener('click', function () {
    var errEl = $('cmp-error'); errEl.hidden = true;
    var pa = L.toPaisa($('cmp-a-price').value), pb = L.toPaisa($('cmp-b-price').value);
    var qa = L.toPct($('cmp-a-pct').value), qb = L.toPct($('cmp-b-pct').value);
    var qty = L.toQty($('cmp-qty').value);
    if (pa === null || pa <= 0 || pb === null || pb <= 0) { errEl.textContent = t('err_price'); errEl.hidden = false; return; }
    if (qa === null || qa > 100 || qb === null || qb > 100) { errEl.textContent = t('err_pct'); errEl.hidden = false; return; }
    if (qty === null) { errEl.textContent = t('err_qty'); errEl.hidden = false; return; }
    var ra = L.calcDeal({ pricePaisa: pa, mode: 'pct', discountValue: qa, qty: 1, vatPct: 0 });
    var rb = L.calcDeal({ pricePaisa: pb, mode: 'pct', discountValue: qb, qty: 1, vatPct: 0 });
    var cmp = L.compareDeals(ra.unitFinalPaisa, rb.unitFinalPaisa);
    $('cmp-a-final').textContent = fmt(ra.unitFinalPaisa);
    $('cmp-b-final').textContent = fmt(rb.unitFinalPaisa);
    var v = cmp.cheaper === 'tie' ? t('verdict_tie')
      : (cmp.cheaper === 'A' ? t('verdict_a') : t('verdict_b')).replace('{AMT}', fmt(cmp.diffPaisa));
    $('cmp-verdict').textContent = v;
    $('cmp-results').hidden = false;
    $('cmp-save-msg').hidden = true;
    lastCmp = { aFinal: ra.unitFinalPaisa, bFinal: rb.unitFinalPaisa, qty: qty, verdict: v };
  });
  $('cmp-save-btn').addEventListener('click', function () {
    if (!lastCmp) return;
    var e = { id: L.makeId(), date: L.todayISO(), kind: 'compare', summary: lastCmp.verdict,
      totalPaisa: Math.min(lastCmp.aFinal, lastCmp.bFinal) * lastCmp.qty };
    history.push(e); saveHistory(); renderHistory();
    $('cmp-save-msg').textContent = t('saved'); $('cmp-save-msg').hidden = false;
  });

  $('hist-clear').addEventListener('click', function () { history = []; saveHistory(); renderHistory(); });
  $('export-btn').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify({ version: 1, entries: history }, null, 2)], { type: 'application/json' });
    var a = $('export-link');
    a.href = URL.createObjectURL(blob);
    a.click();
  });
  $('import-btn').addEventListener('click', function () {
    var msg = $('import-msg'), err = $('import-error');
    msg.hidden = true; err.hidden = true;
    var data;
    try { data = JSON.parse($('import-text').value); } catch (e) { err.textContent = t('import_bad'); err.hidden = false; return; }
    var v = L.validateImport(data);
    if (!v.ok) { err.textContent = t('import_bad'); err.hidden = false; return; }
    history = data.entries; saveHistory(); renderHistory();
    msg.textContent = t('import_ok'); msg.hidden = false;
  });
  var eraseArmed = false, eraseTimer = null;
  $('erase-btn').addEventListener('click', function () {
    if (!eraseArmed) {
      eraseArmed = true;
      $('erase-btn').textContent = t('erase_confirm');
      eraseTimer = setTimeout(function () { eraseArmed = false; $('erase-btn').textContent = t('btn_erase'); }, 4000);
      return;
    }
    clearTimeout(eraseTimer); eraseArmed = false;
    history = []; saveHistory(); renderHistory();
    try { localStorage.removeItem('dcbd-lang'); } catch (e) {}
    $('erase-btn').textContent = t('btn_erase');
    $('erase-msg').textContent = t('erase_done'); $('erase-msg').hidden = false;
  });

  applyLang();
})();

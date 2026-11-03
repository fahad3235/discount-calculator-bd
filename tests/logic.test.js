// Node unit tests for discount-calculator-bd logic. Run: node tests/logic.test.js
'use strict';
const assert = require('node:assert');
const L = require('../logic.js');
let pass = 0;
function eq(name, a, b) { assert.strictEqual(a, b, name + ': ' + a + ' !== ' + b); pass++; console.log('PASS - ' + name); }
function ok(name, c) { assert.ok(c, name); pass++; console.log('PASS - ' + name); }

// Parsing: Bengali digits + commas accepted.
eq('toPaisa plain', L.toPaisa('1000'), 100000);
eq('toPaisa decimal', L.toPaisa('99.50'), 9950);
eq('toPaisa Bengali digits', L.toPaisa('\u09e7\u09e6\u09e6\u09e6'), 100000);
eq('toPaisa commas', L.toPaisa('1,250.75'), 125075);
eq('toPaisa empty rejected', L.toPaisa(''), null);
eq('toPaisa text rejected', L.toPaisa('abc'), null);
eq('toPaisa negative rejected', L.toPaisa('-5'), null);
eq('toQty ok', L.toQty('3'), 3);
eq('toQty zero rejected', L.toQty('0'), null);
eq('toQty decimal rejected', L.toQty('2.5'), null);
eq('toPct ok', L.toPct('12.5'), 12.5);
eq('toPct Bengali', L.toPct('\u09e8\u09e6'), 20);

// Single deal: hand-verified.
let r = L.calcDeal({ pricePaisa: 100000, mode: 'pct', discountValue: 20, qty: 2, vatPct: 5 });
eq('pct discount', r.discountPaisa, 20000);
eq('pct net', r.netPaisa, 80000);
eq('pct vat', r.vatPaisa, 4000);
eq('pct unit final', r.unitFinalPaisa, 84000);
eq('pct total x2', r.totalPaisa, 168000);
eq('pct saved x2', r.savedPaisa, 40000);
eq('pct eff', r.effPct, 20);
r = L.calcDeal({ pricePaisa: 50000, mode: 'flat', discountValue: 12500, qty: 3, vatPct: 0 });
eq('flat unit final', r.unitFinalPaisa, 37500);
eq('flat total x3', r.totalPaisa, 112500);
eq('flat eff pct', r.effPct, 25);
r = L.calcDeal({ pricePaisa: 999, mode: 'pct', discountValue: 33, qty: 1, vatPct: 0 });
eq('pct rounding 999x33%', r.discountPaisa, 330);
eq('pct 100% free', L.calcDeal({ pricePaisa: 10000, mode: 'pct', discountValue: 100, qty: 1, vatPct: 0 }).unitFinalPaisa, 0);
eq('flat equal price free', L.calcDeal({ pricePaisa: 10000, mode: 'flat', discountValue: 10000, qty: 1, vatPct: 0 }).unitFinalPaisa, 0);
eq('pct over 100 rejected', L.calcDeal({ pricePaisa: 10000, mode: 'pct', discountValue: 101, qty: 1, vatPct: 0 }).error, 'bad_pct');
eq('flat over price rejected', L.calcDeal({ pricePaisa: 10000, mode: 'flat', discountValue: 10001, qty: 1, vatPct: 0 }).error, 'bad_flat');
eq('zero price rejected', L.calcDeal({ pricePaisa: 0, mode: 'pct', discountValue: 10, qty: 1, vatPct: 0 }).error, 'bad_price');
eq('qty 0 rejected', L.calcDeal({ pricePaisa: 10000, mode: 'pct', discountValue: 10, qty: 0, vatPct: 0 }).error, 'bad_qty');
eq('vat over 100 rejected', L.calcDeal({ pricePaisa: 10000, mode: 'pct', discountValue: 10, qty: 1, vatPct: 101 }).error, 'bad_vat');

// Compare.
let c = L.compareDeals(80000, 81000);
eq('compare cheaper A', c.cheaper, 'A'); eq('compare diff', c.diffPaisa, 1000);
eq('compare tie', L.compareDeals(50000, 50000).cheaper, 'tie');
eq('compare cheaper B', L.compareDeals(90000, 85000).cheaper, 'B');

// Formatting.
eq('fmtMoney EN', L.fmtMoney(108000, 'en'), '\u09f31,080.00');
eq('fmtMoney BN digits', L.fmtMoney(108000, 'bn'), '\u09f3\u09e7,\u09e6\u09ee\u09e6.\u09e6\u09e6');
eq('fmtPct EN', L.fmtPct(20, 'en'), '20.00%');
eq('fmtNum BN', L.fmtNum(42, 'bn'), '\u09ea\u09e8');
eq('todayISO shape', /^\d{4}-\d{2}-\d{2}$/.test(L.todayISO()), true);

// Import validation.
const good = { version: 1, entries: [{ id: 'g1', date: '2026-11-03', summary: 's', totalPaisa: 168000 }] };
eq('import good ok', L.validateImport(good).ok, true);
eq('import bad shape', L.validateImport({}).ok, false);
eq('import dup id', L.validateImport({ version: 1, entries: [good.entries[0], good.entries[0]] }).ok, false);
eq('import bad date', L.validateImport({ version: 1, entries: [{ id: 'g2', date: '03/11/2026', summary: 's', totalPaisa: 1 }] }).ok, false);
eq('import negative total', L.validateImport({ version: 1, entries: [{ id: 'g2', date: '2026-11-03', summary: 's', totalPaisa: -1 }] }).ok, false);
eq('import missing summary', L.validateImport({ version: 1, entries: [{ id: 'g2', date: '2026-11-03', totalPaisa: 1 }] }).ok, false);

console.log('ALL ' + pass + ' unit checks passed');

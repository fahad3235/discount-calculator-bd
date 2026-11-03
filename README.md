# Discount Calculator BD

Offline, bilingual (English / বাংলা) discount calculator for Bangladeshi shoppers.
Work out what you actually pay during a sale: percent-off or flat-off discounts,
quantity, and VAT — plus a side-by-side deal comparison so you can tell which
offer is really cheaper. No accounts, no network calls, no live prices: every
number is one you type.

## Features

1. **Single-deal calculator** — original price, percent-off (%) or flat-off (৳),
   quantity, and optional VAT %. Shows per-item discount, net price, VAT,
   final per-item price, total to pay, total saved, and the effective discount %.
2. **Quick presets** — 10% / 20% / 30% / 50% chips fill in the discount instantly.
3. **Deal comparison** — Deal A vs Deal B (price + % off + quantity) with a
   plain verdict: which deal is cheaper per item, and by how much.
4. **History** — save calculations, delete one, or clear all. Persists in
   `localStorage` across reloads.
5. **Export / import** — JSON backup export and strict import (malformed
   backups are rejected with your data left intact). Two-tap erase-all.
6. **Bilingual + Bengali digits** — EN/বাংলা toggle persisted across reloads;
   amounts render in Bengali digits in বাংলা mode, and Bengali-digit input is
   accepted (e.g. ১০০০ works as 1000).

## How the math works

All money is integer paisa internally — no floating-point rounding drift.

- Percent mode: `discount = round(price × pct / 100)`
- Flat mode: `discount = flat amount` (rejected if it exceeds the price)
- `net = price − discount`; `VAT = round(net × vat% / 100)`
- `final per item = net + VAT`; `total = final × quantity`
- `saved = discount × quantity`; `effective % = discount / price × 100`

VAT is applied **after** discount, using the rate you enter. The app holds no
opinion about what the VAT rate should be — enter the rate on the price tag.

## Stack

Vanilla HTML + CSS + JavaScript. No framework, no build step, no dependencies.
`logic.js` holds all pure logic (also loadable in Node for tests); `app.js`
holds DOM wiring and the i18n strings.

## Run locally

Just open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Tests

```sh
node tests/logic.test.js   # 45 unit checks
node tests/smoke.mjs       # 25 headless-Chrome checks (system Chromium, file://)
```

Test results are recorded in `TEST_RESULTS.md`.

## Limitations

- This is a personal calculator, not a shop or price authority. Sale prices,
  discounts, and VAT rates are user-entered; nothing is fetched from any store.
- History lives only in this browser's `localStorage` — export a JSON backup
  before clearing browser data.
- No currency conversion: all amounts are Bangladeshi taka (৳).

## Status

MVP complete. Tests green (see `TEST_RESULTS.md`).

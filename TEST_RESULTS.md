# TEST RESULTS — discount-calculator-bd (run #220, 2026-11-03)

## Unit tests — 45/45 passed (`node tests/logic.test.js`)

- Parsing: plain, decimal, Bengali digits (১০০০ → 100000 paisa), comma
  grouping; empty/text/negative inputs rejected; qty 0/decimal rejected.
- Hand-verified deal math: 1000 −20% +5% VAT ×2 → discount 200, net 800,
  VAT 40, unit 840, total 1680, saved 400, effective 20%.
- Flat mode: 500 −125 ×3 → unit 375, total 1125, effective 25%.
- Rounding: 999 ×33% → discount 330 (rounded). 100% off and flat == price
  both give a 0 final. Over-100% pct, flat > price, zero price, qty 0,
  VAT >100% all rejected with the documented error codes.
- Compare: A cheaper (800 vs 810 → diff 1000 paisa), tie, B cheaper.
- Formatting: EN ৳1,080.00; BN digits ৳১,০৮০.০০; pct 20.00%; BN 42 → ৪২.
- Import validation: good backup accepted; bad shape, duplicate id, bad
  date, negative total, missing summary all rejected.

## Headless-Chrome smoke — 25/25 passed (`node tests/smoke.mjs`, raw CDP, file://)

Title, tab visibility, empty-history message; calc scenario 1000/20%/×2/5%
VAT → total 1,680.00, saved 400.00, unit 840.00, eff 20.00%; 50% preset chip
sets discount and pct mode; flat 500−125 → unit 375.00, eff 25.00%;
invalid price shows inline error; save → history 1 entry → persists across
reload; compare A 1000/20% = 800 vs B 900/10% = 810 → "Deal A is cheaper";
BN toggle sets lang="bn" and renders Bengali heading, back to EN; malformed
import shows error with history intact; 390px mobile no horizontal overflow;
0 console/page errors.

## Repairs

0 app bugs. Smoke harness adjusted once during authoring (port/profile
uniqueness); no app code changed after the green run.

## Source hygiene

All shipped .js/.html/.css sources are pure ASCII (Bengali strings stored as
`\uXXXX` escapes, decoded at runtime); verified with `grep -P '[^\x00-\x7F]'`.
Zero network requests by design (no external assets).

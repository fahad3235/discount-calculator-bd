// Headless-Chrome smoke test for discount-calculator-bd (raw CDP, file://).
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const CHROME = '/opt/meta-chromium/chrome';
const PAGE = 'file:///home/hatch/workspace/muse-project-factory/builds/discount-calculator-bd/index.html';
const PORT = 9225;
const args = ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
  '--disable-extensions', '--no-first-run', `--remote-debugging-port=${PORT}`,
  '--user-data-dir=/tmp/dcbd-chrome-profile', 'about:blank'];
const policyPath = '/var/lib/hatch-browser/rootfs-base/usr/share/hatch/chromium/webgl-allowed-domains.txt';
if (existsSync(policyPath)) {
  args.push(`--hatch-webgl-allowed-domains-file=${policyPath}`);
  args.push(`--hatch-webgl-allowed-domains-sha256=${createHash('sha256').update(readFileSync(policyPath)).digest('hex')}`);
}
const chrome = spawn(CHROME, args, { stdio: 'ignore' });
const errors = [];
let ws, nextId = 1;
const pending = new Map();
function send(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve) => { pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });
}
async function ev(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error('evaluate failed: ' + expr + ' :: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 300));
  return r.result.result.value;
}
let passed = 0, failed = 0;
function check(name, cond, extra = '') {
  if (cond) { passed++; console.log('PASS - ' + name); }
  else { failed++; console.log('FAIL - ' + name + ' ' + extra); }
}
async function setVal(id, v) {
  await ev(`(function(){var el=document.getElementById('${id}');el.focus();el.value='${v}';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));})()`);
}
async function click(id) { await ev(`document.getElementById('${id}').click()`); }
async function tab(name) { await ev(`document.querySelector('[data-tab="${name}"]').click()`); }
try {
  let wsUrl = null;
  for (let i = 0; i < 60 && !wsUrl; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      if (r.ok) {
        const list = await r.json();
        const page = list.find((t) => t.type === 'page');
        if (page && page.webSocketDebuggerUrl) wsUrl = page.webSocketDebuggerUrl;
      }
    } catch {}
    if (!wsUrl) await sleep(500);
  }
  if (!wsUrl) throw new Error('chrome debugging endpoint did not come up');
  ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
    if (d.method === 'Runtime.exceptionThrown') errors.push('exception: ' + JSON.stringify(d.params.exceptionDetails).slice(0, 200));
    if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') errors.push('console.error: ' + JSON.stringify(d.params.args).slice(0, 200));
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: PAGE });
  await sleep(1500);
  await ev(`localStorage.clear()`);
  await send('Page.reload', { ignoreCache: true });
  await sleep(1500);

  check('title renders', (await ev(`document.title`)).includes('Discount Calculator BD'));
  check('calc visible, compare hidden', !(await ev(`document.getElementById('section-calc').hidden`)) && (await ev(`document.getElementById('section-compare').hidden`)));
  await tab('history');
  check('empty history message', (await ev(`document.getElementById('history-empty').textContent`)).includes('No saved calculations'));
  await tab('calc');

  // Scenario 1: 1000, 20%, qty 2, VAT 5% -> total 1680.00, saved 400.00
  await setVal('price', '1000'); await setVal('disc', '20'); await setVal('qty', '2'); await setVal('vat', '5');
  await click('calc-btn'); await sleep(300);
  check('calc total 1680', (await ev(`document.getElementById('res-total').textContent`)).includes('1,680.00'));
  check('calc saved 400', (await ev(`document.getElementById('res-saved').textContent`)).includes('400.00'));
  check('calc unit 840', (await ev(`document.getElementById('res-unit').textContent`)).includes('840.00'));
  check('calc eff 20%', (await ev(`document.getElementById('res-eff').textContent`)).includes('20.00%'));

  // Preset chip sets 50%
  await ev(`document.querySelector('[data-preset="50"]').click()`);
  check('preset 50 sets disc', (await ev(`document.getElementById('disc').value`)) === '50');
  check('preset switches to pct mode', await ev(`document.getElementById('mode-pct').checked`));

  // Flat mode: 500 - 125 = 375
  await ev(`document.getElementById('mode-flat').click()`);
  await setVal('price', '500'); await setVal('disc', '125'); await setVal('qty', '1'); await setVal('vat', '0');
  await click('calc-btn'); await sleep(300);
  check('flat unit 375', (await ev(`document.getElementById('res-unit').textContent`)).includes('375.00'));
  check('flat eff 25%', (await ev(`document.getElementById('res-eff').textContent`)).includes('25.00%'));

  // Invalid price error
  await setVal('price', 'abc');
  await click('calc-btn'); await sleep(200);
  check('invalid price error shown', !(await ev(`document.getElementById('calc-error').hidden`)));

  // Save to history + persistence across reload
  await setVal('price', '1000'); await ev(`document.getElementById('mode-pct').click()`);
  await setVal('disc', '20'); await setVal('qty', '1'); await setVal('vat', '0');
  await click('calc-btn'); await sleep(200);
  await click('save-btn'); await sleep(200);
  check('save msg shown', !(await ev(`document.getElementById('save-msg').hidden`)));
  await tab('history'); await sleep(200);
  check('history has 1 entry', (await ev(`document.querySelectorAll('#history-list li').length`)) === 1);
  await send('Page.reload', { ignoreCache: true }); await sleep(1500);
  await tab('history'); await sleep(200);
  check('history persists after reload', (await ev(`document.querySelectorAll('#history-list li').length`)) === 1);

  // Compare: A 1000/20% = 800, B 900/10% = 810 -> A cheaper
  await tab('compare');
  await setVal('cmp-a-price', '1000'); await setVal('cmp-a-pct', '20');
  await setVal('cmp-b-price', '900'); await setVal('cmp-b-pct', '10'); await setVal('cmp-qty', '1');
  await click('cmp-btn'); await sleep(300);
  check('compare A final 800', (await ev(`document.getElementById('cmp-a-final').textContent`)).includes('800.00'));
  check('compare B final 810', (await ev(`document.getElementById('cmp-b-final').textContent`)).includes('810.00'));
  check('compare verdict A cheaper', (await ev(`document.getElementById('cmp-verdict').textContent`)).includes('Deal A is cheaper'));

  // BN toggle: lang attr + Bengali heading
  await ev(`document.getElementById('lang-btn').click()`); await sleep(300);
  check('BN lang attr', (await ev(`document.documentElement.lang`)) === 'bn');
  check('BN heading has Bengali chars', /[\u0980-\u09FF]/.test(await ev(`document.querySelector('h1').textContent`)));
  await ev(`document.getElementById('lang-btn').click()`); await sleep(300);
  check('back to EN', (await ev(`document.documentElement.lang`)) === 'en');

  // Malformed import rejected, data intact
  await tab('data');
  await setVal('import-text', '{bad json');
  await click('import-btn'); await sleep(300);
  check('bad import error shown', !(await ev(`document.getElementById('import-error').hidden`)));
  await tab('history'); await sleep(200);
  check('history intact after bad import', (await ev(`document.querySelectorAll('#history-list li').length`)) === 1);

  // 390px mobile: no horizontal overflow on calc tab
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await tab('calc'); await sleep(500);
  const ow = await ev(`Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)`);
  check('390px no overflow', ow <= 391, 'scrollWidth=' + ow);
  await send('Emulation.clearDeviceMetricsOverride');

  check('zero console/page errors', errors.length === 0, errors.join(' | ').slice(0, 300));
  console.log(`SMOKE: ${passed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
} catch (e) {
  console.error('SMOKE ERROR:', e.message);
  process.exitCode = 1;
} finally {
  try { chrome.kill(); } catch {}
  setTimeout(() => process.exit(process.exitCode || 0), 300);
}

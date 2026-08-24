const { chromium } = require('playwright');
(async () => {
  const id = process.argv[2] || 'riviera-6';
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 820, height: 1040 } });
  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto(`http://localhost:8899/dev/render-jamka.html?id=${id}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  await p.screenshot({ path: `/tmp/${id}.png`, fullPage: true });
  console.log(errs.length ? errs.join('\n') : 'bez chyb');
  await b.close();
})();

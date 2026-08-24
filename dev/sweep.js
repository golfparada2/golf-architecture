const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const pages = [];
  for (const d of fs.readdirSync('lekce')) {
    const dir = path.join('lekce', d);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.html')) pages.push(`${dir}/${f}`);
  }
  pages.push('index.html', 'jamky/index.html', 'slovnicek/index.html', 'prehled/index.html');
  const b = await chromium.launch(); const p = await b.newPage();
  let bad = 0;
  for (const u of pages) {
    const errs = [];
    p.removeAllListeners();
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    try { await p.goto('http://localhost:8899/' + u, { waitUntil: 'networkidle', timeout: 20000 }); }
    catch (e) { errs.push('NAVIGACE ' + e.message); }
    await p.waitForTimeout(250);
    if (errs.length) { bad++; console.log('❌', u, '\n   ', errs.slice(0,3).join('\n    ')); }
  }
  console.log(bad ? `${bad} stranek s chybou z ${pages.length}` : `vsech ${pages.length} stranek bez chyby`);
  await b.close();
})();

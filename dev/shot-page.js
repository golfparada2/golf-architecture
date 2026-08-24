const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1400 } });
  await p.goto('http://localhost:8899/' + process.argv[2], { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  await p.screenshot({ path: '/tmp/page.png', fullPage: true });
  await b.close();
})();

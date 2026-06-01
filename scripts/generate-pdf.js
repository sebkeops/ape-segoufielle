// Convertit un HTML en PDF prêt pour l'impression via Playwright (Chromium).
// - printBackground: true   → les fonds colorés s'impriment
// - preferCSSPageSize: true → respecte @page { size: ... } (A3 + bleed)
// Génère aussi un aperçu PNG pour vérification visuelle.
//
// Usage : node scripts/generate-pdf.js <input.html> <output.pdf> [previewWidthPx]

const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');

async function main() {
  const input = process.argv[2] || 'src/affiche-a3.html';
  const output = process.argv[3] || 'dist/affiche-ape-a3.pdf';
  const previewW = parseInt(process.argv[4] || '1100', 10);

  const inputAbs = path.resolve(input);
  const outputAbs = path.resolve(output);
  const previewAbs = outputAbs.replace(/\.pdf$/i, '-apercu.png');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Charge le fichier et attend la fin du réseau (polices Google Fonts).
  await page.goto(pathToFileURL(inputAbs).href, { waitUntil: 'networkidle' });
  // S'assure que toutes les polices sont prêtes avant le rendu.
  await page.evaluate(() => document.fonts.ready);

  await page.pdf({
    path: outputAbs,
    printBackground: true,
    preferCSSPageSize: true,
  });
  console.log(`PDF généré : ${outputAbs}`);

  // Aperçu PNG (la page fait 303mm de large → ratio respecté).
  await page.setViewportSize({ width: previewW, height: Math.round(previewW * 426 / 303) });
  await page.screenshot({ path: previewAbs, fullPage: true });
  console.log(`Aperçu PNG : ${previewAbs}`);

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });

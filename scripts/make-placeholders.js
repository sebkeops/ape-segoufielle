// Génère des images PLACEHOLDER dans assets/ pour que la chaîne HTML→PDF
// fonctionne AVANT d'avoir une clé Unsplash. Dès que `python scripts/fetch_images.py`
// est lancé avec une clé valide, les vraies photos écrasent ces placeholders.
//
// N'écrase JAMAIS un fichier déjà présent (donc inoffensif si les vraies
// photos existent). Usage : node scripts/make-placeholders.js

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'assets');

// Mêmes slugs que fetch_images.py ; on ne pré-génère que ceux utilisés par l'affiche.
const PLACEHOLDERS = [
  { slug: 'school-fair-festival', c1: '#1F9E96', c2: '#157C75', label: 'Fête / kermesse' },
  { slug: 'community-celebration-outdoor', c1: '#F4623A', c2: '#E0492A', label: 'Célébration en plein air' },
];

function html({ c1, c2, label, slug }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    *{margin:0;box-sizing:border-box}
    body{width:1600px;height:900px;overflow:hidden;font-family:Arial,sans-serif}
    .bg{width:100%;height:100%;position:relative;
      background:linear-gradient(135deg,${c1},${c2});}
    .dots{position:absolute;inset:0;opacity:.18;
      background-image:radial-gradient(circle,#fff 3px,transparent 4px);
      background-size:60px 60px;}
    /* Placeholder discret : dégradé palette + motif de points, sans texte,
       pour un brouillon propre. (Info "placeholder" dans assets/credits.txt.) */
  </style></head><body>
    <div class="bg"><div class="dots"></div></div>
  </body></html>`;
}

async function main() {
  fs.mkdirSync(ASSETS, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

  let made = 0;
  for (const p of PLACEHOLDERS) {
    const dest = path.join(ASSETS, p.slug + '.jpg');
    if (fs.existsSync(dest)) {
      console.log('Existe déjà, conservé :', p.slug + '.jpg');
      continue;
    }
    await page.setContent(html(p), { waitUntil: 'load' });
    await page.screenshot({ path: dest, type: 'jpeg', quality: 82 });
    console.log('Placeholder créé :', p.slug + '.jpg');
    made++;
  }

  // credits.txt provisoire si absent
  const creditsPath = path.join(ASSETS, 'credits.txt');
  if (!fs.existsSync(creditsPath)) {
    fs.writeFileSync(
      creditsPath,
      'Images PLACEHOLDER provisoires (gradients).\n' +
        'Exécuter `python scripts/fetch_images.py` (avec une clé Unsplash dans .env)\n' +
        'pour télécharger les vraies photos et renseigner les crédits Unsplash ici.\n',
      'utf8'
    );
    console.log('credits.txt provisoire créé.');
  }

  await browser.close();
  console.log(`\n${made} placeholder(s) généré(s).`);
}

main().catch((e) => { console.error(e); process.exit(1); });

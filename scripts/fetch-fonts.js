// Construit src/fonts.css en inlinant en base64 des woff2 STATIQUES (@fontsource).
//
// Pourquoi statiques : l'API Google Fonts sert Fredoka et Inter en polices
// VARIABLES (axe wght). Le moteur d'export PDF de Chromium headless n'embarque
// pas correctement les woff2 variables et retombe sur Arial. Les instances
// statiques de @fontsource s'embarquent parfaitement (cf. Poppins).
//
// Résultat : chaîne HTML→PDF déterministe, hors-ligne, polices garanties
// dans le PDF. Sous-ensembles latin + latin-ext → accents français couverts.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Famille → poids nécessaires (cf. affiche-a3.html / flyer)
const FAMILIES = [
  { pkg: 'fredoka', family: 'Fredoka', weights: [500, 600, 700] },
  { pkg: 'poppins', family: 'Poppins', weights: [400, 500, 600, 700] },
  { pkg: 'inter',   family: 'Inter',   weights: [400, 500, 600] },
];

const SUBSETS = ['latin', 'latin-ext'];

// unicode-range standard @fontsource (latin couvre déjà é è ê ç à ù â î ô û ë ï ü œ)
const RANGES = {
  latin:
    'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
  'latin-ext':
    'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
};

let css = '/* Généré par scripts/fetch-fonts.js — woff2 statiques inlinés (ne pas éditer à la main) */\n';
let count = 0;

for (const { pkg, family, weights } of FAMILIES) {
  const dir = path.join(ROOT, 'node_modules', '@fontsource', pkg, 'files');
  for (const weight of weights) {
    for (const subset of SUBSETS) {
      const file = path.join(dir, `${pkg}-${subset}-${weight}-normal.woff2`);
      if (!fs.existsSync(file)) {
        console.warn('Manquant (ignoré) :', file);
        continue;
      }
      const b64 = fs.readFileSync(file).toString('base64');
      css +=
        `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};` +
        `font-display:swap;` +
        `src:url(data:font/woff2;base64,${b64}) format('woff2');` +
        `unicode-range:${RANGES[subset]};}\n`;
      count++;
    }
  }
}

const out = path.join(ROOT, 'src', 'fonts.css');
fs.writeFileSync(out, css, 'utf8');
console.log(`fonts.css écrit : ${count} @font-face, ${(css.length / 1024).toFixed(0)} Ko → ${out}`);

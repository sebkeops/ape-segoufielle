// Équivalent Node de scripts/fetch_images.py (utile si Python n'est pas installé).
// Télécharge des photos d'ambiance via l'API officielle Unsplash dans assets/,
// et écrit les crédits obligatoires (photographe + liens) dans assets/credits.txt.
// Lit la clé depuis .env. Respecte les guidelines Unsplash (Client-ID,
// ping download_location, attribution UTM).
//
// NB : on passe par `curl` (child_process) car `fetch` de Node échoue dans
// certains environnements (proxy/TLS) où curl fonctionne.
//
// Usage : node scripts/fetch-images.js

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets');
const ENV_PATH = path.join(ROOT, '.env');
const APP = 'ape-segoufielle';
const API = 'https://api.unsplash.com';
const NULLDEV = process.platform === 'win32' ? 'NUL' : '/dev/null';

const KEYWORDS = {
  'children-craft-hands': 'children craft hands',
  'colorful-balloons-party': 'colorful balloons party',
  'school-fair-festival': 'school fair festival',
  'kids-painting-art-supplies': 'kids painting art supplies',
  'community-celebration-outdoor': 'community celebration outdoor',
};

function loadKey() {
  if (!fs.existsSync(ENV_PATH)) throw new Error('.env introuvable');
  for (const line of fs.readFileSync(ENV_PATH, 'utf8').split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith('#') || !s.includes('=')) continue;
    const [name, ...rest] = s.split('=');
    if (name.trim() === 'UNSPLASH_ACCESS_KEY') {
      return rest.join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  }
  throw new Error('UNSPLASH_ACCESS_KEY absent de .env');
}

const AUTH = (key) => ['-H', `Authorization: Client-ID ${key}`, '-H', 'Accept-Version: v1'];

function curlJson(url, key) {
  const out = execFileSync('curl', ['-s', ...AUTH(key), url], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  return JSON.parse(out);
}

function curlPing(url, key) {
  try { execFileSync('curl', ['-s', '-o', NULLDEV, ...AUTH(key), url]); } catch {}
}

function curlDownload(url, dest) {
  execFileSync('curl', ['-s', '-L', '-o', dest, '-A', APP, url], {
    maxBuffer: 64 * 1024 * 1024,
  });
}

const utm = (u) =>
  u + (u.includes('?') ? '&' : '?') + `utm_source=${APP}&utm_medium=referral`;

function main() {
  const key = loadKey();
  fs.mkdirSync(ASSETS, { recursive: true });

  const credits = [
    'Crédits photos — Unsplash (https://unsplash.com)',
    'Attribution obligatoire selon les conditions Unsplash.',
    '='.repeat(60),
    '',
  ];

  for (const [slug, query] of Object.entries(KEYWORDS)) {
    process.stdout.write(`Recherche « ${query} »… `);
    const url =
      `${API}/search/photos?query=${encodeURIComponent(query)}` +
      `&orientation=landscape&per_page=5&content_filter=high`;
    const data = curlJson(url, key);
    const photo = (data.results || [])[0];
    if (!photo) { console.log('aucun résultat'); continue; }

    const dl = photo.links && photo.links.download_location;
    if (dl) curlPing(dl, key);

    const raw = photo.urls.raw;
    const imgUrl = raw + (raw.includes('?') ? '&' : '?') + 'w=2000&q=80&fm=jpg&fit=crop';
    curlDownload(imgUrl, path.join(ASSETS, slug + '.jpg'));

    const name = (photo.user && photo.user.name) || 'Inconnu';
    const profile = utm((photo.user && photo.user.links && photo.user.links.html) || 'https://unsplash.com');
    const link = utm((photo.links && photo.links.html) || 'https://unsplash.com');
    console.log(`-> ${slug}.jpg (Photo de ${name})`);

    credits.push(`${slug}.jpg`);
    credits.push(`  Photo de ${name} sur Unsplash`);
    credits.push(`  Profil : ${profile}`);
    credits.push(`  Photo  : ${link}`);
    credits.push('');
  }

  fs.writeFileSync(path.join(ASSETS, 'credits.txt'), credits.join('\n'), 'utf8');
  console.log('\nTerminé. Crédits dans assets/credits.txt');
}

main();

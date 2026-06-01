# APE — École de Ségoufielle · supports de communication 2026-2027

Génération des supports imprimables de l'APE (affiche A3, flyer A5) :
HTML/CSS → PDF haute résolution prêt pour l'impression.

## Livrables

| Support | Source | PDF final |
|--------|--------|-----------|
| Affiche A3 (297×420 mm + bleed 3 mm) | [`src/affiche-a3.html`](src/affiche-a3.html) | [`dist/affiche-ape-a3.pdf`](dist/affiche-ape-a3.pdf) |

## Prérequis

- Node.js (testé avec v20)
- Dépendances : `npm install` (installe `qrcode`, `playwright`, polices `@fontsource`)
- Navigateur Playwright : `npx playwright install chromium`

## Chaîne de génération

```bash
# 1. Construire fonts.css (woff2 STATIQUES inlinés en base64).
#    Indispensable : les polices variables ne s'embarquent pas dans le PDF Chromium.
node scripts/fetch-fonts.js

# 2. Générer le QR code (URL placeholder tant que le formulaire n'est pas connu).
node scripts/generate-qr.js
#    Avec la vraie URL :
#    node scripts/generate-qr.js "https://forms.gle/..."

# 3. HTML -> PDF (+ aperçu PNG dans dist/).
node scripts/generate-pdf.js src/affiche-a3.html dist/affiche-ape-a3.pdf
```

## Spécifications respectées

- **Format** : A3 portrait 297×420 mm + **fond perdu 3 mm** → page PDF 303×426 mm
  (`@page { size: 303mm 426mm; margin: 0 }`). Marge de sécurité 10 mm.
- **Fonds couleurs imprimés** : `print-color-adjust: exact` + `printBackground: true`.
- **Polices embarquées** dans le PDF : Fredoka (titres), Poppins (sous-titres),
  Inter (corps) — vérifié.
- **QR code** PNG haute résolution (1200 px, correction d'erreur H).

## Placeholders à remplir (⚠️ en attente)

Ces valeurs sont signalées visuellement sur l'affiche, à remplacer dès qu'elles
sont connues, puis régénérer le PDF :

- `[URL_FORMULAIRE]` → URL du Google Forms (régénérer le QR avec `generate-qr.js`).
- `[DATE_LIMITE]` → date limite de réponse.
- `[DATE_REUNION]` → date / heure / lieu de la réunion parents.

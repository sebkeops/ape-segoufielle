// Génère le QR code en PNG haute résolution depuis [URL_FORMULAIRE].
// Tant que l'URL réelle n'est pas connue, on encode une URL "placeholder"
// clairement identifiable et on signale (cf. encadré dans l'affiche) qu'il
// faudra régénérer ce QR avec la vraie URL du Google Forms.
//
// Usage :
//   node scripts/generate-qr.js [URL]
// Si aucune URL n'est passée, l'URL placeholder ci-dessous est utilisée.

const QRCode = require('qrcode');
const path = require('path');

const PLACEHOLDER_URL = 'https://REMPLACER-PAR-URL-DU-FORMULAIRE.example';
const url = process.argv[2] || PLACEHOLDER_URL;

const out = path.join(__dirname, '..', 'src', 'qr-code.png');

QRCode.toFile(
  out,
  url,
  {
    errorCorrectionLevel: 'H', // robuste à l'impression
    type: 'png',
    margin: 2,
    width: 1200, // haute résolution (~55 mm @ ~550 dpi)
    color: {
      dark: '#1f3a5f',  // bleu profond, cohérent avec l'identité
      light: '#ffffff',
    },
  },
  (err) => {
    if (err) {
      console.error('Erreur génération QR :', err);
      process.exit(1);
    }
    const isPlaceholder = url === PLACEHOLDER_URL;
    console.log(`QR code généré : ${out}`);
    console.log(`URL encodée : ${url}`);
    if (isPlaceholder) {
      console.log('⚠️  PLACEHOLDER — régénérer avec : node scripts/generate-qr.js "https://vraie-url"');
    }
  }
);

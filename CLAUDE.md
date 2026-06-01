# CLAUDE.md — Projet APE École de Ségoufielle

Ce fichier donne à Claude Code tout le contexte nécessaire pour produire les
supports de communication de l'APE. Lis-le entièrement avant toute tâche.

---

## 🎯 Objectif du repo

Produire **deux supports imprimables** pour la rentrée 2026-2027 de l'APE :

1. Une **affiche A3** (entrée de l'école).
2. Un **flyer A5** (distribué à la kermesse).

Pour chacun : générer du **HTML/CSS**, puis le **convertir en PDF haute
résolution prêt pour l'impression**. Le flyer doit reprendre l'identité
visuelle de l'affiche (mêmes couleurs, mêmes polices).

---

## 🧭 Contexte et axe stratégique (à respecter dans TOUS les textes)

L'APE prépare 2026-2027. Cette année, tout a reposé sur 2-3 parents, ce qui
n'est pas tenable. L'enjeu n'est PAS le manque de bonne volonté, mais
l'organisation : les bénévoles ponctuels ne sont ni valorisés ni fidélisés.

**Positionnement de la communication — règle absolue :**

- ✅ Ton **positif, chaleureux, fédérateur**. Logique « beaucoup de parents un
  peu » plutôt que « quelques-uns beaucoup ». Chacun contribue à son échelle.
- ❌ JAMAIS de ton culpabilisant ou alarmiste. Ne jamais écrire ni suggérer
  « nous sommes épuisés » ou « sans bénévoles l'APE va mourir ».

Message central : *L'objectif n'est pas de demander à quelques personnes de
faire davantage, mais de permettre à davantage de parents de contribuer un peu.*

---

## 📌 Variables à remplir (placeholders)

Remplace ces valeurs partout où elles apparaissent (les chercher dans le HTML) :

- `[URL_FORMULAIRE]` → URL du Google Forms.
- `[DATE_LIMITE]` → date limite de réponse au questionnaire.
- `[DATE_REUNION]` → date / heure / lieu de la réunion parents.

Si `[URL_FORMULAIRE]` n'est pas encore connue, génère un QR code
« placeholder » et laisse un encadré clairement identifié à remplacer.

---

## 🖨️ Spécifications techniques communes

- Conversion HTML → PDF via **Playwright** (Chromium headless,
  `printBackground: true`) ou **WeasyPrint**.
- `@page { margin: 0; }` + `print-color-adjust: exact;` (et
  `-webkit-print-color-adjust: exact;`) pour que les fonds s'impriment.
- **Fond perdu (bleed) de 3 mm** sur chaque bord + **marge de sécurité** :
  aucun texte/élément important hors de la zone sûre.
- **QR code** : générer en PNG haute résolution depuis `[URL_FORMULAIRE]`
  (lib `qrcode` en Python, ou `qrcode` npm), puis l'intégrer.
- Polices Google Fonts lisibles (ex. **Poppins** ou **Fredoka** pour les
  titres, **Inter** pour le corps). Vérifier que les fonts sont bien
  embarquées dans le PDF.
- **Vérifier le rendu du PDF** après génération : fonds colorés présents,
  QR code net, aucun débordement, dimensions correctes.

---

## 🅰️ Affiche A3 (portrait)

**Format :** A3 portrait, 297 × 420 mm.
- Avec bleed 3 mm → zone de travail **303 × 426 mm**.
- `@page { size: 303mm 426mm; margin: 0; }`
- Marge de sécurité : 10 mm.
- Titre très grand, lisible à 3-4 m.
- QR code ~55 × 55 mm.

**Contenu exact :**

- Titre principal : **Réinventons ensemble l'APE 2026-2027**
- Accroche : *Et si vous décidiez de l'année prochaine ?*
- Paragraphe : *L'APE de l'école prépare la nouvelle année et souhaite la
  construire avec vous. Vos idées, vos envies, vos disponibilités : tout
  compte. Donnez votre avis en 5 minutes et imaginons ensemble les projets de
  nos enfants.*
- À côté du QR code : *Scannez pour répondre au questionnaire (5 min)*
- Encadré dates : **Réponses avant le [DATE_LIMITE]** ·
  **Réunion parents le [DATE_REUNION]**
- Message-clé (bas) : *Chacun peut contribuer à son échelle.*
- Pied de page : *APE — École de Ségoufielle (maternelle & primaire)*

**Livrable :** `affiche-ape-a3.pdf` + le HTML source (`affiche-a3.html`).

---

## 🅰️5 Flyer A5 (portrait)

**Format :** A5 portrait, 148 × 210 mm.
- Avec bleed 3 mm → zone de travail **154 × 216 mm**.
- `@page { size: 154mm 216mm; margin: 0; }`
- Marge de sécurité : 8 mm.
- **Recto seul**, mais structure le HTML pour qu'un verso soit facile à ajouter.
- QR code ~40 × 40 mm.
- **Cohérence visuelle avec l'affiche A3** (mêmes couleurs, polices, identité).
  Version condensée de l'affiche.

**Contenu exact :**

- Titre : **Réinventons ensemble l'APE 2026-2027**
- Accroche : *Votre avis compte.*
- Texte court : *Beaucoup de parents ont envie d'aider — chacun à son niveau.
  Aidez-nous à imaginer une APE plus participative et plus durable. Quelques
  minutes suffisent.*
- QR code + *Scannez et donnez votre avis*
- *Réponses avant le [DATE_LIMITE]*
- *Rendez-vous à la réunion parents le [DATE_REUNION] pour construire ensemble
  l'année prochaine.*
- Pied : *APE — École de Ségoufielle*

**Livrable :** `flyer-ape-a5.pdf` + le HTML source (`flyer-a5.html`).

---

## 📂 Organisation et conventions

- Génère l'**affiche en premier**, valide son identité visuelle, puis crée le
  flyer « dans le même style » pour garantir la cohérence.
- Range les sources dans `/src` et les PDF finaux dans `/dist` (ou à la racine
  si plus simple).
- Après chaque livrable validé : **commit + push** sur GitHub avec un message
  clair (ex. `feat: affiche A3 v1`), pour que les PDF soient accessibles à
  distance depuis le repo.
- Palette suggérée (modifiable) : tons chaleureux école/famille, colorés mais
  soignés, pas trop enfantins.

---

## ✅ Definition of done

- PDF aux **bonnes dimensions** avec bleed.
- Fonds colorés et QR code **visibles dans le PDF** (pas seulement à l'écran).
- Tous les **placeholders remplacés** (ou clairement signalés si en attente).
- Affiche et flyer **visuellement cohérents**.
- Fichiers **commités et poussés** sur GitHub.

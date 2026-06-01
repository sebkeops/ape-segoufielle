#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Télécharge des photos d'ambiance depuis l'API officielle Unsplash pour l'affiche
de l'APE, dans assets/, et enregistre les crédits obligatoires dans
assets/credits.txt (photographe + liens, conditions Unsplash).

- Lit la clé UNSPLASH_ACCESS_KEY depuis le fichier .env à la racine.
- N'utilise que la bibliothèque standard (aucun `pip install` nécessaire).
- Respecte les guidelines Unsplash : authentification Client-ID, déclenchement
  de l'endpoint `download_location`, et attribution avec UTM.

Usage :
    python scripts/fetch_images.py

Une fois les images téléchargées, régénérer le PDF :
    node scripts/generate-pdf.js src/affiche-a3.html dist/affiche-ape-a3.pdf
"""

import json
import os
import sys
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
ENV_PATH = os.path.join(ROOT, ".env")

APP_NAME = "ape-segoufielle"  # pour les paramètres UTM d'attribution
API = "https://api.unsplash.com"

# Mots-clés d'ambiance (on évite les portraits d'enfants identifiables).
# slug -> requête Unsplash
KEYWORDS = {
    "children-craft-hands": "children craft hands",
    "colorful-balloons-party": "colorful balloons party",
    "school-fair-festival": "school fair festival",
    "kids-painting-art-supplies": "kids painting art supplies",
    "community-celebration-outdoor": "community celebration outdoor",
}


def load_access_key():
    """Lit UNSPLASH_ACCESS_KEY depuis .env (parseur minimal)."""
    if not os.path.exists(ENV_PATH):
        sys.exit("Erreur : fichier .env introuvable à la racine du projet.")
    key = None
    with open(ENV_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            name, _, value = line.partition("=")
            if name.strip() == "UNSPLASH_ACCESS_KEY":
                key = value.strip().strip('"').strip("'")
    if not key:
        sys.exit(
            "Erreur : UNSPLASH_ACCESS_KEY est vide dans .env.\n"
            "Crée une application sur https://unsplash.com/oauth/applications\n"
            "puis colle l'Access Key dans .env."
        )
    return key


def api_get(url, access_key):
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": "Client-ID " + access_key,
            "Accept-Version": "v1",
            "User-Agent": APP_NAME,
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def search_photo(query, access_key):
    """Renvoie le 1er résultat paysage pour la requête, ou None."""
    params = urllib.parse.urlencode(
        {
            "query": query,
            "orientation": "landscape",
            "per_page": 5,
            "content_filter": "high",
        }
    )
    data = api_get(API + "/search/photos?" + params, access_key)
    results = data.get("results", [])
    return results[0] if results else None


def trigger_download(photo, access_key):
    """Guideline Unsplash : pinger download_location quand on utilise une photo."""
    loc = photo.get("links", {}).get("download_location")
    if loc:
        try:
            api_get(loc, access_key)
        except Exception as e:  # non bloquant
            print("  (avertissement) download_location :", e)


def download_image(photo, dest):
    """Télécharge une version adaptée à l'impression (largeur ~2000px, jpg)."""
    raw = photo["urls"]["raw"]
    sep = "&" if "?" in raw else "?"
    url = raw + sep + urllib.parse.urlencode(
        {"w": 2000, "q": 80, "fm": "jpg", "fit": "crop"}
    )
    req = urllib.request.Request(url, headers={"User-Agent": APP_NAME})
    with urllib.request.urlopen(req, timeout=60) as resp, open(dest, "wb") as out:
        out.write(resp.read())


def utm(url):
    sep = "&" if "?" in url else "?"
    return url + sep + urllib.parse.urlencode(
        {"utm_source": APP_NAME, "utm_medium": "referral"}
    )


def main():
    access_key = load_access_key()
    os.makedirs(ASSETS, exist_ok=True)

    credits = [
        "Crédits photos — Unsplash (https://unsplash.com)",
        "Attribution obligatoire selon les conditions Unsplash.",
        "=" * 60,
        "",
    ]

    for slug, query in KEYWORDS.items():
        print(f"Recherche « {query} »…")
        photo = search_photo(query, access_key)
        if not photo:
            print("  Aucun résultat, ignoré.")
            continue

        dest = os.path.join(ASSETS, slug + ".jpg")
        trigger_download(photo, access_key)
        download_image(photo, dest)

        user = photo.get("user", {})
        name = user.get("name", "Inconnu")
        profile = utm(user.get("links", {}).get("html", "https://unsplash.com"))
        photo_link = utm(photo.get("links", {}).get("html", "https://unsplash.com"))
        print(f"  -> {slug}.jpg  (Photo de {name})")

        credits.append(f"{slug}.jpg")
        credits.append(f"  Photo de {name} sur Unsplash")
        credits.append(f"  Profil : {profile}")
        credits.append(f"  Photo  : {photo_link}")
        credits.append("")

    with open(os.path.join(ASSETS, "credits.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(credits))

    print("\nTerminé. Crédits écrits dans assets/credits.txt")
    print("Régénère le PDF : node scripts/generate-pdf.js src/affiche-a3.html dist/affiche-ape-a3.pdf")


if __name__ == "__main__":
    main()

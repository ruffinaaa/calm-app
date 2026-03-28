# 🌿 Calm — Angstbewältigung PWA

Eine progressive Web-App zur Unterstützung bei Angstzuständen. Gebaut mit Ionic-Ästhetik, Vanilla JS und Claude API.

## Features

| Feature | Beschreibung |
|--------|-------------|
| 🌬️ **Atemübungen** | 3 Atemmuster (4-7-8, Box, 2-1-4) mit animierter Führung |
| 📓 **Journal** | Tageseinträge mit Stimmung + KI-Antwort von Claude |
| ✨ **Affirmationen** | Kuratierte Sammlung + Claude generiert personalisierte |
| 🆘 **SOS / Notfall** | Eigene Kontakte + deutsche Krisentelefone direkt anrufbar |

## Stack

- **Framework**: Vanilla JS + Ionic Design System (CSS)
- **Build**: Vite
- **KI**: Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Speicher**: localStorage (keine externe Datenbank)
- **PWA**: Service Worker + Web App Manifest

---

## Setup & Start

```bash
# 1. Repository klonen
git clone https://github.com/DEIN_USERNAME/calm-app.git
cd calm-app

# 2. Abhängigkeiten installieren
npm install

# 3. Entwicklungsserver starten
npm run dev

# 4. Im Browser öffnen
# http://localhost:3000
```

## API-Key konfigurieren

1. Gehe zu [console.anthropic.com](https://console.anthropic.com)
2. Erstelle einen API-Key
3. Gib ihn in der App auf der Startseite ein (wird lokal gespeichert)

> **Hinweis**: Der Key wird nur im Browser localStorage gespeichert und nicht an Server gesendet.

---

## Projektstruktur

```
calm-app/
├── index.html              # App-Shell & alle Views
├── vite.config.js
├── package.json
├── public/
│   ├── manifest.json       # PWA Manifest
│   └── sw.js               # Service Worker (Offline)
└── src/
    ├── app.js              # Gesamte App-Logik + Claude API
    └── styles/
        └── main.css        # Design System (dark, organic)
```

---

## Git Repository einrichten

```bash
# Im Projektordner:
git init
git add .
git commit -m "feat: initial calm app — breath, journal, affirmations, SOS"

# GitHub Repo erstellen, dann:
git remote add origin https://github.com/DEIN_USERNAME/calm-app.git
git branch -M main
git push -u origin main
```

## Deployment

### Netlify (empfohlen)
```bash
npm run build
# dist/ Ordner auf netlify.com ziehen
```

### GitHub Pages
```bash
npm run build
# In vite.config.js: base: '/calm-app/'
git add dist && git commit -m "deploy"
git subtree push --prefix dist origin gh-pages
```

---

## Lizenz

MIT — frei verwendbar und anpassbar.

---

*Gebaut mit ❤️ als Hilfsmittel, kein Ersatz für professionelle psychologische Behandlung.*

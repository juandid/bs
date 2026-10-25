# Buchstabensalat - CLAUDE.md

Projektdokumentation für Claude Code beim Arbeiten mit diesem Projekt.

## Projekt-Übersicht

**Buchstabensalat** ist ein deutsches Wortspiel als Progressive Web App (PWA). Spieler müssen durcheinandergebrachte Buchstaben in die richtige Reihenfolge bringen, um deutsche Wörter zu erraten.

### Technologie-Stack
- **Vanilla JavaScript** (ES6+, keine Frameworks)
- **CSS3** (Flexbox, Animationen, Responsive Design)
- **HTML5** (Semantic HTML)
- **PWA-Features** (Service Worker, Manifest, installierbar)

## Dateistruktur

```
bs/
├── index.html          # Haupt-HTML-Datei mit Overlay-Markup
├── script.js           # Gesamte Spiellogik (BuchstabensalatGame-Klasse)
├── styles.css          # Vollständiges Styling inkl. Responsive Design
├── words.txt           # Wortliste (451 gebräuchliche deutsche Wörter)
├── manifest.json       # PWA-Manifest
├── sw.js               # Service Worker für Offline-Funktionalität
├── .htaccess           # Security-Header (CSP etc.), sperrt Dev-Dateien
├── icons/              # App-Icons (verschiedene Größen)
└── CLAUDE.md           # Diese Datei

```

## Kern-Features

### 1. Gap-basiertes Drag-and-Drop System
**Wichtigstes Feature:** Buchstaben werden in **Zwischenräume** (Gaps) gezogen, nicht auf andere Buchstaben.

**Wie es funktioniert:**
- Zwischen jedem Buchstaben gibt es ein `.letter-gap` Element
- Beim Drag-Over erscheint eine **grüne vertikale Linie** als visuelles Feedback
- Nach dem Drop werden alle Buchstaben automatisch verschoben
- **Weniger Züge nötig** als beim klassischen Swap-System

**Implementierung:**
- `renderLetters()` (script.js:83-116) erstellt Gaps zwischen Buchstaben
- `insertLetter(fromIndex, toPosition)` (script.js:277-296) verschiebt Buchstaben
- `attachGapDragEvents()` (script.js:245-274) handhabt Desktop-Drag
- `attachGapTouchEvents()` (script.js:226-229) handhabt Mobile-Touch

### 2. Touch & Desktop Support
- **Desktop:** HTML5 Drag & Drop API
- **Mobile:** Touch Events mit Ghost-Element
- Ghost-Element folgt dem Finger während des Ziehens
- Funktioniert auf allen moderaten Geräten

### 3. Fünf Haupt-Buttons

| Button | Icon | Farbe | Funktion |
|--------|------|-------|----------|
| Hilfe | ❓ | Blau (#42A5F5) | Öffnet Hilfe-Overlay |
| Lösung | 💡 | Orange (#FFA726) | Zeigt Lösung sofort |
| Neues Spiel | 🥗 | Grün (#4CAF50) | Startet neues Wort |
| Challenge | ⏱️ | Grau (#e0e0e0) | Challenge-Modus ein/aus |
| Einstellungen | ⚙️ | Blaugrau (#78909C) | Öffnet Einstellungen |

### 4. Hilfe-Overlay
- **Öffnen:** ❓-Button klicken
- **Schließen:** ✕-Button, außerhalb klicken, ESC-Taste
- **Inhalt:**
  - Spielanleitung (Desktop & Mobile)
  - Hinweis auf Lösungs-Button
  - **PWA-Installation** (iPhone & Android Anleitung)
- Verhindert Body-Scroll während Overlay offen ist

### 5. Einstellungen
- **Öffnen:** ⚙️-Button klicken
- **Schließen:** ✕-Button, außerhalb klicken, ESC-Taste
- **Inhalt:**
  - Minimale Buchstabenanzahl (4-9, Default: 5)
  - Maximale Buchstabenanzahl (4-9, Default: 9)
- Einstellungen werden in localStorage gespeichert
- Min kann nicht größer als Max sein und umgekehrt

### 6. Win-Condition & Confetti
- Automatische Prüfung nach jedem Zug
- Bei Erfolg: Grüne Buchstaben + Konfetti-Animation
- 150 Konfetti-Partikel mit verschiedenen Formen und Farben

## Spiellogik

### Hauptklasse: BuchstabensalatGame

**Wichtige Methoden:**

```javascript
// Spielablauf
startNewGame()           // Wählt zufälliges Wort, mischt Buchstaben
scrambleWord(word)       // Fisher-Yates Shuffle
checkWinCondition()      // Prüft ob Wort korrekt

// Buchstaben-Management
renderLetters()          // Rendert Buchstaben + Gaps
insertLetter(from, to)   // Verschiebt Buchstabe (kein Swap!)
createGap(position)      // Erstellt Gap-Element

// Events
attachDragEvents()       // Desktop Drag & Drop
attachGapDragEvents()    // Gaps für Desktop
attachTouchEvents()      // Mobile Touch
attachGapTouchEvents()   // Gaps für Mobile

// UI
showHelp()              // Öffnet Hilfe-Overlay
closeHelp()             // Schließt Hilfe-Overlay
showSolution()          // Zeigt Lösung an
handleWin()             // Win-Animation
createConfetti()        // Konfetti-Effekt
```

### Game State

```javascript
this.gameState = {
    currentWord: '',         // Das korrekte Wort (z.B. "HASE")
    letterPositions: [],     // Aktuelle Buchstaben-Anordnung als Array
    isWon: false,            // Spiel gewonnen?
    wordList: [],            // Alle geladenen Wörter aus words.txt
    filteredWordList: []     // Nach Länge gefilterte Wörter
}

this.settings = {
    minLetters: 5,           // Minimale Wortlänge (Default: 5)
    maxLetters: 9            // Maximale Wortlänge (Default: 9)
}
```

## Wortliste (words.txt)

### Aktuelle Statistik
- **451 Wörter** (Stand: letzte Aktualisierung)
- **Länge:** 4-11 Buchstaben
- **Sprache:** Deutsch
- **Qualität:** Nur gebräuchliche, alltägliche Wörter

### Kategorien
- Nomen (Tiere, Objekte, Orte, Personen)
- Zeitbegriffe (Wochentage, Monate, Jahreszeiten)
- Nahrungsmittel (Obst, Gemüse, Getränke)
- Körperteile
- Möbel & Einrichtung
- Kleidung & Accessoires
- Emotionen & abstrakte Begriffe
- Haushaltsgegenstände
- Werkzeuge
- Technik (alltäglich)

### Umlaute-Handling
- Umlaute (Ä, Ö, Ü) sind in der Wortliste **enthalten**
- Browser rendert sie korrekt
- Keine Konvertierung zu AE, OE, UE nötig (anders als beim ursprünglichen Wordle)

### Wortliste erweitern
✅ **Erlaubt:** Gebräuchliche Wörter, die jeder kennt
❌ **Vermeiden:** Fachbegriffe, Fremdwörter, regionale Ausdrücke, sehr seltene Wörter

**Beispiel gute Erweiterungen:**
- Alltägliche Gegenstände (TASSE, BRILLE, LAMPE)
- Häufige Tätigkeiten (LAUFEN, ESSEN, SCHLAFEN)
- Bekannte Tiere (ELEFANT, GIRAFFE, PINGUIN)
- Grundemotionen (FREUDE, ANGST, LIEBE)

## CSS-Struktur

### Wichtige Klassen

**Buchstaben:**
- `.letter-square` - Einzelner Buchstabe (60x60px Desktop)
- `.letter-square.dragging` - Während Drag (opacity: 0.3)
- `.letter-square.won` - Gewonnen (grün, Animation)
- `.ghost-drag` - Touch-Ghost-Element

**Gaps:**
- `.letter-gap` - Zwischenraum (20px breit, unsichtbar)
- `.letter-gap.drag-over` - Beim Drag-Over (30px, grüne Linie)
- `.letter-gap::before` - Grüne vertikale Linie (0→50px Animation)

**Buttons:**
- `.btn-help` - Hilfe-Button (blau)
- `.btn-solution` - Lösungs-Button (orange)
- `.btn-salad` - Neues-Spiel-Button (grün)
- Alle: 70px × 70px, rund, Hover-Effekte

**Overlay:**
- `.overlay` - Fullscreen-Hintergrund (schwarz, 70% opacity)
- `.overlay.active` - Sichtbar (display: flex)
- `.overlay-content` - Weißer Content-Container
- `.overlay-close` - ✕-Button oben rechts

### Responsive Breakpoints

```css
/* Desktop: Default (70px Buttons, 60px Buchstaben, 20px Gaps) */

@media (max-width: 480px) {
    /* Tablet/Große Phones: 60px Buttons, 50px Buchstaben, 15px Gaps */
}

@media (max-width: 360px) {
    /* Kleine Phones: 55px Buttons, 45px Buchstaben, 12px Gaps */
}
```

## Progressive Web App (PWA)

### Service Worker (sw.js)
- Cached Assets für Offline-Nutzung
- Cache-First-Strategie für statische Dateien
- Automatisches Update bei neuer Version

### Manifest (manifest.json)
- App-Name: "Buchstabensalat"
- Icons: 32px, 192px, 512px
- `display: "standalone"` - Läuft wie native App
- Theme-Color: #ffffff

### Installation
- **iOS:** Safari → Teilen → Zum Home-Bildschirm
- **Android:** Chrome → Menü (⋮) → Zum Startbildschirm hinzufügen

## Entwicklungs-Hinweise

### Code-Style
- **Vanilla JS** - Keine jQuery, kein React
- **ES6+** - Arrow Functions, Template Strings, Destructuring
- **Klassen-basiert** - Eine Hauptklasse für gesamte Logik
- **Event Delegation** - Events auf Buttons, nicht inline

### Wichtige Implementierungsdetails

1. **Gap-System ist zentral:**
   - Gaps existieren nur während Spiel läuft (nicht bei isWon)
   - Position 0 = vor erstem Buchstaben
   - Position N = nach letztem Buchstaben
   - insertLetter() adjustiert Position wenn nötig

2. **Touch vs. Drag:**
   - Komplett separate Event-Handler
   - Touch braucht Ghost-Element (Desktop nicht)
   - Beide führen zu insertLetter()

3. **Rendering:**
   - Bei jedem Zug wird komplett neu gerendert
   - Keine DOM-Manipulation, nur createElement
   - Performance ist kein Problem (max. 11 Buchstaben)

4. **Body-Scroll-Lock:**
   - Bei Overlay: `document.body.style.overflow = 'hidden'`
   - Beim Schließen: `document.body.style.overflow = ''`

### Häufige Aufgaben

**Neuen Button hinzufügen:**
1. HTML: Button in `.button-container` einfügen
2. JS: Referenz im Constructor, Event Listener in `setupEventListeners()`
3. CSS: Styling analog zu `.btn-help`, `.btn-solution`, `.btn-salad`

**Wortliste ändern:**
- Direkt `words.txt` editieren (ein Wort pro Zeile)
- Großbuchstaben verwenden
- Keine Leerzeichen oder Sonderzeichen
- Umlaute sind erlaubt

**Animation hinzufügen:**
- CSS: @keyframes definieren
- Element: `animation: name duration ease`
- Ggf. `animationend` Event-Listener

**Neues Overlay erstellen:**
1. HTML: `<div class="overlay">` mit Content
2. JS: Referenz + show/hide Methoden
3. CSS: Analog zu `.overlay` und `.overlay-content`

## Testing-Checkliste

Beim Testen neue Features prüfen:

- ✅ Desktop Drag & Drop (Chrome, Firefox, Safari)
- ✅ Mobile Touch (iOS Safari, Android Chrome)
- ✅ Gap-Highlighting funktioniert
- ✅ Buchstaben verschieben sich korrekt
- ✅ Win-Condition triggert
- ✅ Konfetti-Animation läuft
- ✅ Alle Buttons funktionieren
- ✅ Overlay öffnet/schließt (alle Methoden)
- ✅ Responsive auf verschiedenen Bildschirmgrößen
- ✅ PWA-Installation möglich
- ✅ Offline-Funktionalität (nach Installation)

## Bekannte Einschränkungen

1. **Keine Undo-Funktion** - Jeder Zug ist final
2. **Keine Statistiken** - Keine Speicherung von Spielständen
3. **Keine Schwierigkeitsstufen** - Alle Wörter gemischt
4. **Keine Punkte/Timer** - Reines Freizeitspiel
5. **Deutsche Sprache only** - Keine Mehrsprachigkeit

## Future Ideas (optional)

Mögliche Erweiterungen (nicht implementiert):

- 🏆 Statistiken (Gewinnrate, Durchschnittszüge)
- ⏱️ Timer-Modus
- 🎯 Schwierigkeitsstufen (nach Wortlänge)
- 💾 LocalStorage für Fortschritt
- 🌍 Mehrsprachigkeit
- 🎨 Theme-Switcher (Dark Mode)
- 🔊 Sound-Effekte
- 🏅 Achievements
- 📊 Tägliche Herausforderung
- 👥 Mehrspieler-Modus

## Kontakt & Feedback

Bei Problemen oder Feedback: feedback.txt im Projektverzeichnis anlegen.

---

**Letzte Aktualisierung:** 2026-01-30
**Version:** 1.9.0
**Entwickelt mit:** Claude Code (Anthropic)

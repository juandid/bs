# Buchstabensalat PWA

Eine Progressive Web App für ein deutsches Wortspiel, bei dem Spieler verschlüsselte Buchstaben per Drag & Drop ordnen müssen, um deutsche Nomen zu bilden.

## Installation

### 1. Icons generieren

Öffnen Sie `generate-icons.html` im Browser:
```bash
open generate-icons.html
```

Laden Sie dann die drei Icons herunter und speichern Sie sie im `/bs/icons/` Ordner:
- `icon-32x32.png` (Favicon)
- `icon-192x192.png` (Android Home Screen)
- `icon-512x512.png` (Splash Screen)

### 2. App starten

Öffnen Sie `index.html` im Browser oder über einen Webserver:
```bash
# Mit Python einfachen Webserver starten:
python3 -m http.server 8000

# Dann öffnen Sie: http://localhost:8000/bs/
```

### 3. PWA installieren

- **Desktop**: Klicken Sie auf das Install-Icon in der Adressleiste
- **Mobile**: Öffnen Sie das Browser-Menü und wählen Sie "Zum Startbildschirm hinzufügen"

## Spielanleitung

1. **Ziel**: Ordnen Sie die verschlüsselten Buchstaben, um das gesuchte deutsche Wort zu bilden
2. **Steuerung**: Ziehen Sie Buchstaben mit der Maus oder per Touch auf eine andere Position
3. **Tausch**: Der verdrängte Buchstabe springt an die ursprüngliche Position des gezogenen Buchstabens
4. **Gewonnen**: Sobald das korrekte Wort gebildet ist, färben sich die Buchstaben hellblau
5. **Neues Spiel**: Klicken Sie auf "Neu" für ein neues Wort

## Funktionen

- ✅ Drag & Drop Steuerung
- ✅ Züge-Zähler
- ✅ 200+ deutsche Nomen (4-9 Buchstaben)
- ✅ Vollständig offline spielbar
- ✅ Installierbar als PWA
- ✅ Responsive Design für Desktop und Mobile
- ✅ Touch-freundliche Bedienung

## Technische Details

### Dateien

- `index.html` - Haupt-HTML-Datei
- `styles.css` - Styling (Letter-Squares, Drag-States, Responsive)
- `script.js` - Game-Logik (Vanilla JavaScript)
- `words.txt` - Wortliste (UTF-8, ein Wort pro Zeile)
- `manifest.json` - PWA Manifest
- `sw.js` - Service Worker für Offline-Funktionalität
- `icons/` - PWA Icons (32x32, 192x192, 512x512)

### Technologien

- **Vanilla JavaScript** (kein Framework)
- **HTML5 Drag & Drop API**
- **Service Worker** (Cache-First Strategie)
- **CSS Grid/Flexbox** (Responsive Layout)
- **Local Storage** (wird derzeit nicht verwendet, kann für Statistiken erweitert werden)

### Browser-Kompatibilität

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Wortliste erweitern

Um die Wortliste zu erweitern, fügen Sie einfach neue Wörter in `words.txt` hinzu:

```
NEUESWORT
ANDERSWORT
```

**Anforderungen:**
- Ein Wort pro Zeile
- Großbuchstaben (UPPERCASE)
- 4-9 Zeichen
- UTF-8 Encoding (für Umlaute: Ä, Ö, Ü)

## Entwicklung

### Service Worker aktualisieren

Wenn Sie Änderungen an den Dateien vornehmen, erhöhen Sie die Cache-Version in `sw.js`:

```javascript
const CACHE_NAME = 'buchstabensalat-v2'; // v1 → v2
```

### Testen

- **Offline-Test**: DevTools → Application → Service Workers → Offline
- **PWA-Test**: Lighthouse Audit (sollte 100 PWA Score erreichen)
- **Mobile-Test**: Chrome DevTools Device Toolbar

## Lizenz

Dieses Projekt wurde als Lernprojekt erstellt.

## Autor

Erstellt mit Claude Code

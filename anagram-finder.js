// Anagramm-Finder für Buchstabensalat
const fs = require('fs');

// Wortliste einlesen
const words = fs.readFileSync('words.txt', 'utf-8')
    .split('\n')
    .map(w => w.trim())
    .filter(w => w.length > 0);

console.log(`Analysiere ${words.length} Wörter...\n`);

// Funktion zum Sortieren der Buchstaben (Anagramm-Schlüssel)
function getAnagramKey(word) {
    return word.split('').sort().join('');
}

// Gruppiere Wörter nach Anagramm-Schlüssel
const anagramGroups = {};
words.forEach(word => {
    const key = getAnagramKey(word);
    if (!anagramGroups[key]) {
        anagramGroups[key] = [];
    }
    anagramGroups[key].push(word);
});

// Finde Anagramm-Paare/-Gruppen
console.log('=== GEFUNDENE ANAGRAMME IN DER LISTE ===\n');
let anagramPairCount = 0;
Object.keys(anagramGroups).forEach(key => {
    const group = anagramGroups[key];
    if (group.length > 1) {
        console.log(`✓ ${group.join(' ↔ ')}`);
        anagramPairCount++;
    }
});

console.log(`\n→ ${anagramPairCount} Anagramm-Gruppen gefunden\n`);

// Bekannte deutsche Anagramme, die nicht in der Liste sind
const knownAnagrams = {
    'WINTER': ['WIRTEN'],
    'LAMPE': ['PALME', 'AMPEL'],
    'GANZE': ['ZANGE'],
    'SEIL': ['LIES', 'LEIS'],
    'REGAL': ['LAGER', 'ELGAR'],
    'MEHL': ['HELM'],
    'EIMER': ['MEIER', 'REIME'],
    'TIER': ['REIT', 'RITE'],
    'STEIN': ['NIEST', 'SEINT'],
    'WALD': ['WDAL'], // kein echtes Wort
    'NEST': ['STERN'], // nein, unterschiedlich
    'ROSEN': ['SOREN'], // nicht in Liste
    'GLAS': ['LAGS', 'SLAG'], // nicht standard
    'PALME': ['LAMPE', 'AMPEL'],
    'NEBEL': ['LEBEN'],
    'RÜBE': ['ÜBER'],
    'REIS': ['IRES', 'SIRE'], // SIRE ist veraltet
    'WELT': ['LETWT'], // kein Wort
    'ROSE': ['SORE'], // nicht standard
    'RABE': ['BARE', 'ABER'],
    'LIEBE': ['BEIL'], // unterschiedliche Länge
};

console.log('=== POTENZIELLE FEHLENDE ANAGRAMME ===\n');

// Prüfe für jedes Wort bekannte Anagramme
const missingWords = new Set();

// WINTER → WIRTEN
if (words.includes('WINTER') && !words.includes('WIRTEN')) {
    console.log('WINTER → WIRTEN (fehlt)');
    missingWords.add('WIRTEN');
}

// LAMPE → PALME, AMPEL
if (words.includes('LAMPE')) {
    if (!words.includes('PALME')) {
        console.log('LAMPE → PALME (fehlt)');
        missingWords.add('PALME');
    }
    if (!words.includes('AMPEL')) {
        console.log('LAMPE → AMPEL (fehlt)');
        missingWords.add('AMPEL');
    }
}

// GANZE → ZANGE
if (words.includes('GANZE') && !words.includes('ZANGE')) {
    console.log('GANZE → ZANGE (fehlt)');
    missingWords.add('ZANGE');
}

// SEIL → LIES
if (words.includes('SEIL') && !words.includes('LIES')) {
    console.log('SEIL → LIES (fehlt)');
    missingWords.add('LIES');
}

// REGAL → LAGER
if (words.includes('REGAL') && !words.includes('LAGER')) {
    console.log('REGAL → LAGER (fehlt)');
    missingWords.add('LAGER');
}

// MEHL → HELM
if (words.includes('HELM') && !words.includes('MEHL')) {
    console.log('HELM → MEHL (fehlt)');
    missingWords.add('MEHL');
}

// EIMER → REIME
if (words.includes('EIMER') && !words.includes('REIME')) {
    console.log('EIMER → REIME (fehlt)');
    missingWords.add('REIME');
}

// RABE → ABER, BARE
if (!words.includes('RABE')) {
    console.log('(RABE fehlt komplett, wäre Anagramm zu ABER/BARE)');
}

// TIER → REIT, RITE
if (!words.includes('TIER')) {
    console.log('(TIER fehlt komplett)');
}

// NEST → STERN (unterschiedlich!)
// STERN hat T, E, R, N = ENRST
// NEST hat N, E, S, T = ENST
// Nicht dasselbe!

// ROSE → (keine guten Anagramme)

// STEIN → NIEST, EINST
if (words.includes('STEIN')) {
    if (!words.includes('NIEST')) {
        console.log('STEIN → NIEST (fehlt)');
        missingWords.add('NIEST');
    }
    if (!words.includes('EINST')) {
        console.log('STEIN → EINST (fehlt)');
        missingWords.add('EINST');
    }
}

console.log(`\n→ ${missingWords.size} fehlende Anagramme identifiziert`);
console.log('\nZu ergänzende Wörter:', Array.from(missingWords).join(', '));

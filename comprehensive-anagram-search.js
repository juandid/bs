// Umfassende Anagramm-Suche mit deutschen Wörtern
const fs = require('fs');

const words = fs.readFileSync('words.txt', 'utf-8')
    .split('\n')
    .map(w => w.trim())
    .filter(w => w.length > 0);

function getAnagramKey(word) {
    return word.split('').sort().join('');
}

// Umfassende Liste bekannter deutscher Anagramme
// Format: [Wort1, Wort2, ...] = alle sind Anagramme voneinander
const knownGermanAnagrams = [
    ['NEBEL', 'LEBEN'],
    ['GANZE', 'ZANGE'],
    ['ÜBER', 'RÜBE'],
    ['WINTER', 'WIRTEN'],
    ['LAMPE', 'PALME', 'AMPEL'],
    ['SEIL', 'LIES'],
    ['REGAL', 'LAGER'],
    ['MEHL', 'HELM'],
    ['EIMER', 'REIME'],
    ['STEIN', 'NIEST', 'EINST', 'NISTE'],
    ['RABE', 'ABER', 'BARE'],
    ['TIER', 'REIT'],
    ['BART', 'BRAT'],
    ['EISEN', 'NIESE', 'SIEBE'], // SIEBE hat ein B extra, nicht richtig
    ['AMSEL', 'MASEL', 'SALEM'],
    ['ENGEL', 'GELEN', 'LEGEN'],
    ['AMPEL', 'LAMPE', 'PALME'],
    ['REISE', 'SEIER'],
    ['MEISE', 'SEIME'],
    ['KREIS', 'KERIS'],
    ['DOSE', 'ODES'],
    ['ASTE', 'TASTE', 'ETATS'], // TASTE hat ein T extra
    ['GARTEN', 'TRAGEN'],
    ['TREIB', 'TRIEB', 'BREIT'],
    ['LIEBE', 'BLEIE'],
    ['ROSE', 'SORE'],
    ['ESEL', 'LESE'],
    ['RESTE', 'SETRE', 'STERE'],
    ['LASER', 'REALS'],
    ['TEILE', 'LEITE'],
    ['HERZ', 'RHEZ'], // kein echtes Wort
    ['KORB', 'BORK'],
    ['ALTER', 'LATER', 'RATEL'],
    ['RATEN', 'ARTEN', 'NATER', 'TARNE'],
    ['REITEN', 'NIETER'],
    ['MIETE', 'MEITE'],
    ['RINDE', 'NIERD'], // kein Wort
    ['BÖRSE', 'RÖBES', 'SÖBER'], // keine echten Wörter
    ['ECHSE', 'SECHE'], // kein Wort
];

console.log('=== UMFASSENDE ANAGRAMM-ANALYSE ===\n');

const toAdd = new Set();
const alreadyComplete = [];

knownGermanAnagrams.forEach(group => {
    // Prüfe ob mindestens ein Wort aus der Gruppe in der Liste ist
    const wordsInList = group.filter(w => words.includes(w));
    const wordsNotInList = group.filter(w => !words.includes(w));

    if (wordsInList.length > 0 && wordsNotInList.length > 0) {
        console.log(`✓ ${wordsInList.join(', ')} → Fehlt: ${wordsNotInList.join(', ')}`);
        wordsNotInList.forEach(w => toAdd.add(w));
    } else if (wordsInList.length >= 2) {
        alreadyComplete.push(wordsInList.join(' ↔ '));
    }
});

console.log('\n=== BEREITS VOLLSTÄNDIG ===\n');
alreadyComplete.forEach(pair => console.log(`  ${pair}`));

console.log('\n=== HINZUZUFÜGENDE WÖRTER ===\n');
const sorted = Array.from(toAdd).sort();
sorted.forEach(w => console.log(`  ${w}`));

console.log(`\n→ Gesamt: ${sorted.length} Wörter hinzufügen`);

// Speichere die Liste
fs.writeFileSync('words-to-add.txt', sorted.join('\n'));
console.log('\n✓ Liste gespeichert in words-to-add.txt');

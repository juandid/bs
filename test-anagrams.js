// Test für Anagramm-Funktionalität
const fs = require('fs');

// Wortliste laden
const wordList = fs.readFileSync('words.txt', 'utf-8')
    .split('\n')
    .map(word => word.trim().toUpperCase())
    .filter(word => word.length > 0);

console.log(`✓ Wortliste geladen: ${wordList.length} Wörter\n`);

// Anagramm-Finder (exakt wie im Spiel)
function findValidAnagrams(letters) {
    const sortedLetters = letters.split('').sort().join('');
    return wordList.filter(word => {
        return word.split('').sort().join('') === sortedLetters;
    });
}

// Test-Fälle
const testCases = [
    { word: 'WINTER', expectedAnagrams: ['WINTER', 'WIRTEN'] },
    { word: 'LAMPE', expectedAnagrams: ['LAMPE', 'PALME', 'AMPEL'] },
    { word: 'GANZE', expectedAnagrams: ['GANZE', 'ZANGE'] },
    { word: 'NEBEL', expectedAnagrams: ['NEBEL', 'LEBEN'] },
    { word: 'RÜBE', expectedAnagrams: ['RÜBE', 'ÜBER'] },
    { word: 'SEIL', expectedAnagrams: ['SEIL', 'LIES'] },
    { word: 'REGAL', expectedAnagrams: ['REGAL', 'LAGER'] },
    { word: 'EIMER', expectedAnagrams: ['EIMER', 'REIME'] },
    { word: 'STEIN', expectedAnagrams: ['STEIN', 'NIEST', 'EINST'] },
    { word: 'GARTEN', expectedAnagrams: ['GARTEN', 'TRAGEN'] }
];

let passedTests = 0;
let failedTests = 0;

console.log('=== ANAGRAMM-TESTS ===\n');

testCases.forEach(test => {
    const found = findValidAnagrams(test.word);
    const foundSet = new Set(found);
    const expectedSet = new Set(test.expectedAnagrams);

    // Prüfe ob alle erwarteten Anagramme gefunden wurden
    const allFound = test.expectedAnagrams.every(word => foundSet.has(word));
    const noExtra = found.every(word => expectedSet.has(word));

    if (allFound && noExtra) {
        console.log(`✓ ${test.word.padEnd(10)} → ${found.join(' ↔ ')}`);
        passedTests++;
    } else {
        console.log(`✗ ${test.word.padEnd(10)}`);
        console.log(`  Erwartet: ${test.expectedAnagrams.join(', ')}`);
        console.log(`  Gefunden: ${found.join(', ')}`);
        failedTests++;
    }
});

console.log(`\n=== ERGEBNIS ===`);
console.log(`${passedTests}/${testCases.length} Tests bestanden`);

if (failedTests === 0) {
    console.log('🎉 Alle Tests bestanden!');
    process.exit(0);
} else {
    console.log(`⚠️  ${failedTests} Tests fehlgeschlagen`);
    process.exit(1);
}

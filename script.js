// Buchstabensalat Game
class BuchstabensalatGame {
    constructor() {
        this.gameState = {
            currentWord: '',
            letterPositions: [],
            isWon: false,
            wordList: [],
            wordHistory: [],
            // Challenge Mode
            challengeMode: false,
            challengeActive: false,
            challengeTimeRemaining: 120,
            challengeSuccessCount: 0,
            challengeTimerId: null,
            challengeWordHistory: []
        };

        this.letterContainer = document.getElementById('letter-container');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.solutionBtn = document.getElementById('solution-btn');
        this.helpBtn = document.getElementById('help-btn');
        this.helpOverlay = document.getElementById('help-overlay');
        this.closeHelpBtn = document.getElementById('close-help');

        // Challenge mode references
        this.toggleChallengeBtn = document.getElementById('toggle-challenge-btn');
        this.challengeControls = document.getElementById('challenge-controls');
        this.challengeBtn = document.getElementById('challenge-btn');
        this.challengeStats = document.querySelector('.challenge-stats');
        this.timerDisplay = document.getElementById('timer-display');
        this.successCounter = document.getElementById('success-counter');
        this.endOverlay = document.getElementById('end-overlay');
        this.closeEndBtn = document.getElementById('close-end');
        this.restartChallengeBtn = document.getElementById('restart-challenge-btn');
        this.endSuccessCount = document.getElementById('end-success-count');

        this.HISTORY_SIZE = 50;
        this.STORAGE_KEY = 'buchstabensalat_history';

        this.init();
    }

    async init() {
        await this.loadWords();
        this.loadHistory();
        this.setupEventListeners();
        this.startNewGame();
    }

    async loadWords() {
        try {
            const response = await fetch('words.txt');
            const text = await response.text();
            this.gameState.wordList = text
                .split('\n')
                .map(word => word.trim().toUpperCase())
                .filter(word => word.length >= 4 && word.length <= 9 && word.length > 0);

            if (this.gameState.wordList.length === 0) {
                throw new Error('No valid words found');
            }
        } catch (error) {
            console.error('Error loading words:', error);
            // Fallback words
            this.gameState.wordList = [
                'HASE', 'HAUS', 'BUCH', 'TISCH', 'STUHL',
                'MAUS', 'BROT', 'WELT', 'WALD', 'BERG',
                'MEER', 'MOND', 'SONNE', 'BLUME', 'BAUM',
                'MÖRDER', 'SCHLOSS', 'HALUNKE'
            ];
        }
    }

    loadHistory() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                this.gameState.wordHistory = JSON.parse(stored);
                // Nur gültige Wörter behalten
                this.gameState.wordHistory = this.gameState.wordHistory.filter(
                    word => this.gameState.wordList.includes(word)
                );
            }
        } catch (error) {
            console.warn('Could not load word history:', error);
            this.gameState.wordHistory = [];
        }
    }

    saveHistory() {
        try {
            localStorage.setItem(
                this.STORAGE_KEY,
                JSON.stringify(this.gameState.wordHistory)
            );
        } catch (error) {
            console.warn('Could not save word history:', error);
        }
    }

    addToHistory(word) {
        // Am Anfang einfügen (neueste zuerst)
        this.gameState.wordHistory.unshift(word);

        // Auf 50 Wörter begrenzen
        if (this.gameState.wordHistory.length > this.HISTORY_SIZE) {
            this.gameState.wordHistory = this.gameState.wordHistory.slice(0, this.HISTORY_SIZE);
        }

        this.saveHistory();
    }

    setupEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.solutionBtn.addEventListener('click', () => this.showSolution());
        this.helpBtn.addEventListener('click', () => this.showHelp());
        this.closeHelpBtn.addEventListener('click', () => this.closeHelp());

        // Close overlay when clicking outside the content
        this.helpOverlay.addEventListener('click', (e) => {
            if (e.target === this.helpOverlay) {
                this.closeHelp();
            }
        });

        // Close overlay with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.helpOverlay.classList.contains('active')) {
                this.closeHelp();
            }
        });

        // Challenge mode event listeners
        this.toggleChallengeBtn.addEventListener('click', () => this.handleChallengeToggle());
        this.challengeBtn.addEventListener('click', () => this.handleChallengeButton());
        this.closeEndBtn.addEventListener('click', () => this.closeEndScreen());
        this.restartChallengeBtn.addEventListener('click', () => this.restartChallenge());

        this.endOverlay.addEventListener('click', (e) => {
            if (e.target === this.endOverlay) {
                this.closeEndScreen();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.endOverlay.classList.contains('active')) {
                this.closeEndScreen();
            }
        });
    }

    startNewGame() {
        // Stoppe sofort alle laufenden Konfetti-Animationen
        this.stopConfetti();

        // Bestimme welche Historie verwendet wird
        const wordHistory = this.gameState.challengeActive
            ? this.gameState.challengeWordHistory
            : this.gameState.wordHistory;

        // Verfügbare Wörter = alle minus Historie
        let availableWords = this.gameState.wordList.filter(
            word => !wordHistory.includes(word)
        );

        // Fallback: Wenn < 10 Wörter verfügbar, Historie zurücksetzen
        if (availableWords.length < 10) {
            console.log('Resetting word history - too few words available');
            if (this.gameState.challengeActive) {
                this.gameState.challengeWordHistory = [];
            } else {
                this.gameState.wordHistory = [];
                this.saveHistory();
            }
            availableWords = this.gameState.wordList;
        }

        // Wähle zufälliges Wort aus verfügbaren
        const randomIndex = Math.floor(Math.random() * availableWords.length);
        this.gameState.currentWord = availableWords[randomIndex];

        // Zur richtigen Historie hinzufügen
        if (this.gameState.challengeActive) {
            this.gameState.challengeWordHistory.unshift(this.gameState.currentWord);
            if (this.gameState.challengeWordHistory.length > this.HISTORY_SIZE) {
                this.gameState.challengeWordHistory = this.gameState.challengeWordHistory.slice(0, this.HISTORY_SIZE);
            }
        } else {
            this.addToHistory(this.gameState.currentWord);
        }

        // Scramble the word
        this.gameState.letterPositions = this.scrambleWord(this.gameState.currentWord);

        // Reset game state
        this.gameState.isWon = false;

        // Render letters
        this.renderLetters();
    }

    scrambleWord(word) {
        const letters = word.split('');
        let scrambled;

        // Keep shuffling until different from original
        do {
            scrambled = [...letters];
            // Fisher-Yates shuffle
            for (let i = scrambled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
            }
        } while (scrambled.join('') === word);

        return scrambled;
    }

    findValidAnagrams(letters) {
        const sortedLetters = letters.split('').sort().join('');
        return this.gameState.wordList.filter(word => {
            return word.split('').sort().join('') === sortedLetters;
        });
    }

    renderLetters() {
        // Clear container
        this.letterContainer.innerHTML = '';

        const totalLetters = this.gameState.letterPositions.length;

        // Create gap before first letter (edge gap)
        if (!this.gameState.isWon) {
            const firstGap = this.createGap(0);
            firstGap.classList.add('edge');
            this.letterContainer.appendChild(firstGap);
        }

        // Create letter squares with gaps between them
        this.gameState.letterPositions.forEach((letter, index) => {
            const square = document.createElement('div');
            square.className = 'letter-square';
            square.textContent = letter;
            square.dataset.index = index;

            if (!this.gameState.isWon &&
                !(this.gameState.challengeActive && this.gameState.challengeTimeRemaining <= 0)) {
                square.setAttribute('draggable', 'true');
                this.attachDragEvents(square);
                this.attachTouchEvents(square);
            } else {
                square.classList.add('won');
            }

            this.letterContainer.appendChild(square);

            // Add gap after each letter (except when won)
            if (!this.gameState.isWon) {
                const gap = this.createGap(index + 1);
                // Last gap is also an edge gap
                if (index === totalLetters - 1) {
                    gap.classList.add('edge');
                }
                this.letterContainer.appendChild(gap);
            }
        });
    }

    createGap(position) {
        const gap = document.createElement('div');
        gap.className = 'letter-gap';
        gap.dataset.position = position;
        this.attachGapDragEvents(gap);
        this.attachGapTouchEvents(gap);
        return gap;
    }

    attachTouchEvents(square) {
        let touchStartIndex = null;
        let ghostElement = null;

        // Touch start
        square.addEventListener('touchstart', (e) => {
            touchStartIndex = parseInt(e.target.dataset.index);
            e.target.classList.add('dragging');

            // Create ghost element that follows finger
            ghostElement = e.target.cloneNode(true);
            ghostElement.classList.add('ghost-drag');
            ghostElement.style.position = 'fixed';
            ghostElement.style.pointerEvents = 'none';
            ghostElement.style.zIndex = '9999';
            ghostElement.style.opacity = '0.8';
            ghostElement.style.transform = 'scale(1.2)';

            const touch = e.touches[0];
            const rect = e.target.getBoundingClientRect();
            ghostElement.style.left = (touch.clientX - rect.width / 2) + 'px';
            ghostElement.style.top = (touch.clientY - rect.height / 2) + 'px';

            document.body.appendChild(ghostElement);
        }, { passive: true });

        // Touch move
        square.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevent scrolling while dragging

            const touch = e.touches[0];

            // Move ghost element with finger
            if (ghostElement) {
                const rect = square.getBoundingClientRect();
                ghostElement.style.left = (touch.clientX - rect.width / 2) + 'px';
                ghostElement.style.top = (touch.clientY - rect.height / 2) + 'px';
            }

            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);

            // Remove drag-over from all gaps
            document.querySelectorAll('.letter-gap').forEach(gap => {
                gap.classList.remove('drag-over');
            });

            // Add drag-over to element below if it's a gap
            if (elementBelow && elementBelow.classList.contains('letter-gap')) {
                elementBelow.classList.add('drag-over');
            }
        }, { passive: false });

        // Touch end
        square.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.target.classList.remove('dragging');

            // Remove ghost element
            if (ghostElement) {
                ghostElement.remove();
                ghostElement = null;
            }

            const touch = e.changedTouches[0];
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);

            // Remove all drag-over classes
            document.querySelectorAll('.letter-gap').forEach(gap => {
                gap.classList.remove('drag-over');
            });

            if (touchStartIndex !== null) {
                if (elementBelow && elementBelow.classList.contains('letter-gap')) {
                    // Dropped on gap - use gap position
                    const toPosition = parseInt(elementBelow.dataset.position);
                    this.insertLetter(touchStartIndex, toPosition);
                } else if (elementBelow && elementBelow.classList.contains('letter-square')) {
                    // Dropped on letter - insert after that letter
                    const targetIndex = parseInt(elementBelow.dataset.index);
                    const toPosition = targetIndex + 1;
                    this.insertLetter(touchStartIndex, toPosition);
                }
            }

            touchStartIndex = null;
        }, { passive: false });

        // Touch cancel (when interrupted)
        square.addEventListener('touchcancel', (e) => {
            e.target.classList.remove('dragging');

            if (ghostElement) {
                ghostElement.remove();
                ghostElement = null;
            }

            document.querySelectorAll('.letter-gap').forEach(gap => {
                gap.classList.remove('drag-over');
            });

            touchStartIndex = null;
        }, { passive: true });
    }

    attachGapTouchEvents(gap) {
        // Gaps are passive drop zones for touch events
        // All touch handling is done in attachTouchEvents on the letter squares
    }

    attachDragEvents(square) {
        // Drag start
        square.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', e.target.dataset.index);
            e.target.classList.add('dragging');
        });

        // Drag end
        square.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
            // Remove all drag-over classes
            document.querySelectorAll('.letter-gap').forEach(gap => {
                gap.classList.remove('drag-over');
            });
        });

        // Allow drop on letters as fallback (inserts after the letter)
        square.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        square.addEventListener('drop', (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const targetIndex = parseInt(e.target.dataset.index);

            // Insert after the target letter
            const toPosition = targetIndex + 1;
            this.insertLetter(fromIndex, toPosition);
        });
    }

    attachGapDragEvents(gap) {
        // Drag over (required for drop to work)
        gap.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        // Drag enter (visual feedback)
        gap.addEventListener('dragenter', (e) => {
            if (e.target.classList.contains('letter-gap')) {
                e.target.classList.add('drag-over');
            }
        });

        // Drag leave
        gap.addEventListener('dragleave', (e) => {
            e.target.classList.remove('drag-over');
        });

        // Drop
        gap.addEventListener('drop', (e) => {
            e.preventDefault();
            e.target.classList.remove('drag-over');

            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toPosition = parseInt(e.target.dataset.position);

            this.insertLetter(fromIndex, toPosition);
        });
    }

    insertLetter(fromIndex, toPosition) {
        // Remove letter from original position
        const letter = this.gameState.letterPositions.splice(fromIndex, 1)[0];

        // Calculate new insert position
        // If we're inserting after the original position, adjust for the removed element
        let insertPosition = toPosition;
        if (toPosition > fromIndex) {
            insertPosition = toPosition - 1;
        }

        // Insert at new position
        this.gameState.letterPositions.splice(insertPosition, 0, letter);

        // Re-render letters
        this.renderLetters();

        // Add drop feedback animation to the moved letter
        this.showDropFeedback(insertPosition);

        // Check win condition
        this.checkWinCondition();
    }

    showDropFeedback(index) {
        // Wait for render to complete
        setTimeout(() => {
            const letters = this.letterContainer.querySelectorAll('.letter-square');
            if (letters[index]) {
                letters[index].classList.add('just-dropped');
                // Remove class after animation completes
                setTimeout(() => {
                    letters[index].classList.remove('just-dropped');
                }, 400);
            }
        }, 10);
    }

    checkWinCondition() {
        const currentArrangement = this.gameState.letterPositions.join('');
        const validSolutions = this.findValidAnagrams(this.gameState.currentWord);

        if (validSolutions.includes(currentArrangement)) {
            this.gameState.isWon = true;
            this.handleWin();
        }
    }

    handleWin(showConfetti = true) {
        // Re-render to apply won class
        this.renderLetters();

        if (this.gameState.challengeActive) {
            // Challenge-Modus: Counter erhöhen, kein Konfetti
            this.gameState.challengeSuccessCount++;
            this.updateSuccessCounter();
        } else {
            // Standard-Modus: Konfetti bei selbst gelöstem Rätsel
            if (showConfetti) {
                this.createConfetti();
            }
        }
    }

    showSolution() {
        // Don't show solution if already won
        if (this.gameState.isWon) {
            return;
        }

        // Während Challenge nicht erlaubt
        if (this.gameState.challengeActive) {
            return;
        }

        // Set letters to correct order
        this.gameState.letterPositions = this.gameState.currentWord.split('');

        // Mark as won
        this.gameState.isWon = true;

        // Handle win (no confetti when solution is shown)
        this.handleWin(false);
    }

    showHelp() {
        this.helpOverlay.classList.add('active');
        // Prevent body scroll when overlay is open
        document.body.style.overflow = 'hidden';
    }

    closeHelp() {
        this.helpOverlay.classList.remove('active');
        // Restore body scroll
        document.body.style.overflow = '';
    }

    stopConfetti() {
        // Entferne alle existierenden Konfetti-Container sofort
        const confettiContainers = document.querySelectorAll('.confetti-container');
        confettiContainers.forEach(container => container.remove());
    }

    createConfetti() {
        // Create confetti container
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        document.body.appendChild(confettiContainer);

        // Confetti colors
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff1493', '#7fff00', '#ff4500'];
        const shapes = ['square', 'circle', 'rectangle'];

        // Create 150 confetti pieces
        for (let i = 0; i < 150; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = `confetti ${shapes[Math.floor(Math.random() * shapes.length)]}`;

                // Random color
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

                // Random horizontal position
                confetti.style.left = Math.random() * 100 + '%';

                // Random animation duration (2-4 seconds)
                const duration = 2 + Math.random() * 2;
                confetti.style.animationDuration = duration + 's';

                // Random delay for staggered effect
                confetti.style.animationDelay = Math.random() * 0.5 + 's';

                confettiContainer.appendChild(confetti);

                // Remove confetti piece after animation
                setTimeout(() => {
                    confetti.remove();
                }, (duration + 0.5) * 1000);
            }, i * 20); // Stagger creation by 20ms
        }

        // Remove container after all confetti is done
        setTimeout(() => {
            confettiContainer.remove();
        }, 5000);
    }

    // ========== Challenge Mode Methods ==========

    handleChallengeToggle() {
        // Toggle challenge mode state
        this.gameState.challengeMode = !this.gameState.challengeMode;

        // Update button and UI visibility
        this.toggleChallengeBtn.classList.toggle('active', this.gameState.challengeMode);
        this.challengeControls.classList.toggle('visible', this.gameState.challengeMode);
        this.challengeBtn.classList.toggle('visible', this.gameState.challengeMode);
        this.challengeStats.classList.toggle('visible', this.gameState.challengeMode);


        // If turning challenge mode OFF while a challenge is active, stop it
        if (!this.gameState.challengeMode && this.gameState.challengeActive) {
            this.stopChallenge();
        }
        
        // If turning challenge mode OFF, reset the display
        if (!this.gameState.challengeMode) {
            this.resetChallengeDisplay();
        }
    }

    handleChallengeButton() {
        if (this.gameState.challengeActive) {
            // Reset button clicked during challenge
            this.stopChallenge();
            this.startChallenge();
        } else {
            // Start button clicked
            this.startChallenge();
        }
    }

    startChallenge() {
        // Reset challenge state
        this.gameState.challengeActive = true;
        this.gameState.challengeTimeRemaining = 120;
        this.gameState.challengeSuccessCount = 0;
        this.gameState.challengeWordHistory = [];

        // Update button to reset mode
        this.challengeBtn.textContent = '🔄';
        this.challengeBtn.classList.add('active');
        this.challengeBtn.title = 'Challenge zurücksetzen';

        // Disable solution button
        this.solutionBtn.disabled = true;

        // Start timer
        this.startChallengeTimer();

        // Update display
        this.updateTimerDisplay();
        this.updateSuccessCounter();

        // Start first puzzle
        this.startNewGame();
    }

    stopChallenge() {
        this.gameState.challengeActive = false;

        // Clear timer
        if (this.gameState.challengeTimerId) {
            clearInterval(this.gameState.challengeTimerId);
            this.gameState.challengeTimerId = null;
        }

        // Reset button
        this.challengeBtn.textContent = '▶️';
        this.challengeBtn.classList.remove('active');
        this.challengeBtn.title = 'Challenge starten';

        // Re-enable solution button
        this.solutionBtn.disabled = false;

        // Remove timer warning class if present
        this.timerDisplay.classList.remove('warning');

        // Reset display
        this.resetChallengeDisplay();
    }

    startChallengeTimer() {
        // Clear any existing timer
        if (this.gameState.challengeTimerId) {
            clearInterval(this.gameState.challengeTimerId);
        }

        this.gameState.challengeTimerId = setInterval(() => {
            this.gameState.challengeTimeRemaining--;
            this.updateTimerDisplay();

            // Warning at 30 seconds
            if (this.gameState.challengeTimeRemaining === 30) {
                this.timerDisplay.classList.add('warning');
            }

            // Time's up
            if (this.gameState.challengeTimeRemaining <= 0) {
                this.endChallenge();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.gameState.challengeTimeRemaining / 60);
        const seconds = this.gameState.challengeTimeRemaining % 60;
        this.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    updateSuccessCounter() {
        this.successCounter.textContent = this.gameState.challengeSuccessCount;
    }

    resetChallengeDisplay() {
        this.gameState.challengeTimeRemaining = 120;
        this.gameState.challengeSuccessCount = 0;
        this.updateTimerDisplay();
        this.updateSuccessCounter();
        this.timerDisplay.classList.remove('warning');
    }

    endChallenge() {
        // Stop the timer
        if (this.gameState.challengeTimerId) {
            clearInterval(this.gameState.challengeTimerId);
            this.gameState.challengeTimerId = null;
        }

        // Freeze the game (disable dragging)
        this.gameState.challengeActive = false;

        // Re-render to remove draggable attributes
        this.renderLetters();

        // Show end screen
        this.showEndScreen();
    }

    showEndScreen() {
        // Update stats in overlay
        this.endSuccessCount.textContent = this.gameState.challengeSuccessCount;

        // Show overlay
        this.endOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeEndScreen() {
        this.endOverlay.classList.remove('active');
        document.body.style.overflow = '';

        // Reset challenge state but don't restart
        this.stopChallenge();

        // Start a new game in normal mode
        this.startNewGame();
    }

    restartChallenge() {
        // Just close the end screen (button now says "Schliessen")
        this.closeEndScreen();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new BuchstabensalatGame();
});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration.scope);
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

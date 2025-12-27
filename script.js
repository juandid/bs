// Buchstabensalat Game
class BuchstabensalatGame {
    constructor() {
        this.gameState = {
            currentWord: '',
            letterPositions: [],
            isWon: false,
            wordList: []
        };

        this.letterContainer = document.getElementById('letter-container');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.solutionBtn = document.getElementById('solution-btn');
        this.helpBtn = document.getElementById('help-btn');
        this.helpOverlay = document.getElementById('help-overlay');
        this.closeHelpBtn = document.getElementById('close-help');

        this.init();
    }

    async init() {
        await this.loadWords();
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
    }

    startNewGame() {
        // Select random word
        const randomIndex = Math.floor(Math.random() * this.gameState.wordList.length);
        this.gameState.currentWord = this.gameState.wordList[randomIndex];

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

    renderLetters() {
        // Clear container
        this.letterContainer.innerHTML = '';

        // Create gap before first letter
        if (!this.gameState.isWon) {
            const firstGap = this.createGap(0);
            this.letterContainer.appendChild(firstGap);
        }

        // Create letter squares with gaps between them
        this.gameState.letterPositions.forEach((letter, index) => {
            const square = document.createElement('div');
            square.className = 'letter-square';
            square.textContent = letter;
            square.dataset.index = index;

            if (!this.gameState.isWon) {
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

            if (elementBelow && elementBelow.classList.contains('letter-gap')) {
                const toPosition = parseInt(elementBelow.dataset.position);

                if (touchStartIndex !== null) {
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

        // Check win condition
        this.checkWinCondition();
    }

    checkWinCondition() {
        const currentArrangement = this.gameState.letterPositions.join('');

        if (currentArrangement === this.gameState.currentWord) {
            this.gameState.isWon = true;
            this.handleWin();
        }
    }

    handleWin() {
        // Re-render to apply won class
        this.renderLetters();

        // Trigger confetti animation
        this.createConfetti();
    }

    showSolution() {
        // Don't show solution if already won
        if (this.gameState.isWon) {
            return;
        }

        // Set letters to correct order
        this.gameState.letterPositions = this.gameState.currentWord.split('');

        // Mark as won
        this.gameState.isWon = true;

        // Handle win (shows confetti and renders)
        this.handleWin();
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

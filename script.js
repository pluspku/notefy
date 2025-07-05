// Notefy Game - JavaScript Implementation
// Musical Note Recognition Game for Children

class NoteFyGame {
    constructor() {
        this.currentMode = 'practice';
        this.currentDifficulty = 'beginner';
        this.currentQuestion = 0;
        this.totalQuestions = 10;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.gameActive = false;
        this.timer = null;
        this.timeLeft = 30;
        this.currentNote = null;
        this.gameStartTime = null;
        this.wrongNotes = [];
        
        // Note positions on staff (y-coordinates)
        this.notePositions = {
            // Treble clef positions (from bottom to top)
            'C4': { y: 170, ledger: true },  // Middle C (below staff)
            'D4': { y: 160, ledger: false }, // Below staff
            'E4': { y: 150, ledger: false }, // First line
            'F4': { y: 140, ledger: false }, // First space
            'G4': { y: 130, ledger: false }, // Second line
            'A4': { y: 120, ledger: false }, // Second space
            'B4': { y: 110, ledger: false }, // Third line
            'C5': { y: 100, ledger: false }, // Third space
            'D5': { y: 90, ledger: false },  // Fourth line
            'E5': { y: 80, ledger: false },  // Fourth space
            'F5': { y: 70, ledger: false },  // Fifth line
            'G5': { y: 60, ledger: false },  // Above staff
            'A5': { y: 50, ledger: true },   // Above staff (ledger)
            'B5': { y: 40, ledger: true },   // Above staff (ledger)
            'C6': { y: 30, ledger: true },   // Above staff (ledger)
            'C3': { y: 190, ledger: true },  // Below staff (ledger)
            'D3': { y: 180, ledger: true },  // Below staff (ledger)
            'E3': { y: 170, ledger: true },  // Below staff (ledger)
        };
        
        // Difficulty levels
        this.difficultyRanges = {
            beginner: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
            intermediate: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'],
            advanced: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6']
        };
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.loadProgress();
        this.setupEventListeners();
        this.setupStaff();
        this.showMainMenu();
    }
    
    setupEventListeners() {
        // Mode selection buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.selectMode(mode);
            });
        });
        
        // Difficulty selection buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.currentTarget.dataset.difficulty;
                this.selectDifficulty(difficulty);
            });
        });
        
        // Answer buttons
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const note = e.currentTarget.dataset.note;
                this.checkAnswer(note);
            });
        });
        
        // Control buttons
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('skipBtn').addEventListener('click', () => this.skipQuestion());
        document.getElementById('backToMenuBtn').addEventListener('click', () => this.showMainMenu());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.startGame());
        document.getElementById('mainMenuBtn').addEventListener('click', () => this.showMainMenu());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.gameActive) {
                const key = e.key.toLowerCase();
                if (['c', 'd', 'e', 'f', 'g', 'a', 'b'].includes(key)) {
                    this.checkAnswer(key.toUpperCase());
                }
            }
        });
    }
    
    selectMode(mode) {
        this.currentMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // Update total questions based on mode
        if (mode === 'challenge') {
            this.totalQuestions = 20;
            this.timeLeft = 60;
        } else if (mode === 'review') {
            this.totalQuestions = this.wrongNotes.length || 5;
        } else {
            this.totalQuestions = 10;
        }
        
        this.startGame();
    }
    
    selectDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');
    }
    
    startGame() {
        this.gameActive = true;
        this.currentQuestion = 0;
        this.score = 0;
        this.streak = 0;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.gameStartTime = Date.now();
        
        // Setup UI
        this.showGameArea();
        this.updateGameInfo();
        
        // Start timer for challenge mode
        if (this.currentMode === 'challenge') {
            this.startTimer();
        }
        
        // Generate first question
        this.nextQuestion();
    }
    
    showMainMenu() {
        document.getElementById('mainMenu').style.display = 'block';
        document.getElementById('gameArea').style.display = 'none';
        document.getElementById('resultsScreen').style.display = 'none';
        this.gameActive = false;
        this.clearTimer();
    }
    
    showGameArea() {
        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('gameArea').style.display = 'block';
        document.getElementById('resultsScreen').style.display = 'none';
        
        // Show timer for challenge mode
        if (this.currentMode === 'challenge') {
            document.getElementById('timerItem').style.display = 'block';
        } else {
            document.getElementById('timerItem').style.display = 'none';
        }
    }
    
    showResultsScreen() {
        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('gameArea').style.display = 'none';
        document.getElementById('resultsScreen').style.display = 'block';
        
        // Update results
        const accuracy = this.totalAnswers > 0 ? Math.round((this.correctAnswers / this.totalAnswers) * 100) : 0;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('accuracy').textContent = accuracy + '%';
        document.getElementById('maxStreak').textContent = this.maxStreak;
        
        // Save progress
        this.saveProgress();
    }
    
    setupStaff() {
        const svg = document.getElementById('staffSvg');
        svg.innerHTML = ''; // Clear existing content
        
        // Draw staff lines
        for (let i = 0; i < 5; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '50');
            line.setAttribute('y1', 70 + i * 20);
            line.setAttribute('x2', '350');
            line.setAttribute('y2', 70 + i * 20);
            line.setAttribute('class', 'staff-line');
            svg.appendChild(line);
        }
        
        // Draw treble clef
        const trebleClef = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        trebleClef.setAttribute('x', '60');
        trebleClef.setAttribute('y', '135');
        trebleClef.setAttribute('font-size', '60');
        trebleClef.setAttribute('font-family', 'serif');
        trebleClef.setAttribute('class', 'treble-clef');
        trebleClef.textContent = '𝄞';
        svg.appendChild(trebleClef);
    }
    
    nextQuestion() {
        if (this.currentQuestion >= this.totalQuestions) {
            this.endGame();
            return;
        }
        
        this.currentQuestion++;
        this.updateGameInfo();
        
        // Generate note based on mode
        if (this.currentMode === 'review' && this.wrongNotes.length > 0) {
            this.currentNote = this.wrongNotes[Math.floor(Math.random() * this.wrongNotes.length)];
        } else {
            const availableNotes = this.difficultyRanges[this.currentDifficulty];
            this.currentNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];
        }
        
        this.drawNote(this.currentNote);
        this.resetAnswerButtons();
    }
    
    drawNote(noteName) {
        const svg = document.getElementById('staffSvg');
        
        // Remove existing note
        const existingNote = svg.querySelector('.note-group');
        if (existingNote) {
            existingNote.remove();
        }
        
        // Create note group
        const noteGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        noteGroup.setAttribute('class', 'note-group note-appear');
        
        const position = this.notePositions[noteName];
        const noteX = 200;
        const noteY = position.y;
        
        // Draw ledger lines if needed
        if (position.ledger) {
            const ledgerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            ledgerLine.setAttribute('x1', noteX - 15);
            ledgerLine.setAttribute('y1', noteY);
            ledgerLine.setAttribute('x2', noteX + 15);
            ledgerLine.setAttribute('y2', noteY);
            ledgerLine.setAttribute('class', 'ledger-line');
            noteGroup.appendChild(ledgerLine);
        }
        
        // Draw note head
        const noteHead = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        noteHead.setAttribute('cx', noteX);
        noteHead.setAttribute('cy', noteY);
        noteHead.setAttribute('rx', '8');
        noteHead.setAttribute('ry', '6');
        noteHead.setAttribute('class', 'note-head');
        noteGroup.appendChild(noteHead);
        
        // Draw stem
        const stemDirection = noteY > 110 ? 'up' : 'down';
        const stemX = stemDirection === 'up' ? noteX + 8 : noteX - 8;
        const stemY1 = noteY;
        const stemY2 = stemDirection === 'up' ? noteY - 30 : noteY + 30;
        
        const stem = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        stem.setAttribute('x1', stemX);
        stem.setAttribute('y1', stemY1);
        stem.setAttribute('x2', stemX);
        stem.setAttribute('y2', stemY2);
        stem.setAttribute('class', 'note-stem');
        noteGroup.appendChild(stem);
        
        svg.appendChild(noteGroup);
    }
    
    checkAnswer(selectedNote) {
        if (!this.gameActive) return;
        
        const correctNote = this.currentNote.charAt(0); // Get just the letter (C, D, E, etc.)
        const isCorrect = selectedNote === correctNote;
        
        this.totalAnswers++;
        
        if (isCorrect) {
            this.correctAnswers++;
            this.score += this.calculateScore();
            this.streak++;
            this.maxStreak = Math.max(this.maxStreak, this.streak);
            this.showFeedback(true, '正确! 🎉');
            this.playSound('correct');
        } else {
            this.streak = 0;
            this.wrongNotes.push(this.currentNote);
            this.showFeedback(false, `错误! 正确答案是 ${correctNote}`);
            this.playSound('incorrect');
        }
        
        this.highlightAnswer(selectedNote, isCorrect);
        
        // Wait before next question
        setTimeout(() => {
            this.nextQuestion();
        }, 1500);
    }
    
    calculateScore() {
        let baseScore = 10;
        
        // Bonus for streak
        if (this.streak > 0) {
            baseScore += this.streak * 2;
        }
        
        // Bonus for difficulty
        if (this.currentDifficulty === 'intermediate') {
            baseScore += 5;
        } else if (this.currentDifficulty === 'advanced') {
            baseScore += 10;
        }
        
        // Bonus for challenge mode
        if (this.currentMode === 'challenge') {
            baseScore += 5;
        }
        
        return baseScore;
    }
    
    highlightAnswer(selectedNote, isCorrect) {
        const buttons = document.querySelectorAll('.answer-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.note === selectedNote) {
                btn.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
        });
    }
    
    resetAnswerButtons() {
        const buttons = document.querySelectorAll('.answer-btn');
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'incorrect');
        });
    }
    
    showFeedback(isCorrect, message) {
        const modal = document.getElementById('feedbackModal');
        const icon = document.getElementById('feedbackIcon');
        const text = document.getElementById('feedbackText');
        
        icon.textContent = isCorrect ? '✅' : '❌';
        text.textContent = message;
        
        modal.classList.add('show');
        
        setTimeout(() => {
            modal.classList.remove('show');
        }, 1200);
    }
    
    playSound(type) {
        // Create audio context for simple sound feedback
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (type === 'correct') {
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
            } else {
                oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
                oscillator.frequency.setValueAtTime(185, audioContext.currentTime + 0.1); // F#3
            }
            
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    clearTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    pauseGame() {
        if (this.gameActive) {
            this.gameActive = false;
            this.clearTimer();
            document.getElementById('pauseBtn').textContent = '继续';
            this.showFeedback(false, '游戏已暂停');
        } else {
            this.gameActive = true;
            if (this.currentMode === 'challenge') {
                this.startTimer();
            }
            document.getElementById('pauseBtn').textContent = '暂停';
        }
    }
    
    skipQuestion() {
        if (this.gameActive) {
            this.nextQuestion();
        }
    }
    
    endGame() {
        this.gameActive = false;
        this.clearTimer();
        this.showResultsScreen();
    }
    
    updateGameInfo() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('streak').textContent = this.streak;
        document.getElementById('currentQuestion').textContent = this.currentQuestion;
        document.getElementById('totalQuestions').textContent = this.totalQuestions;
        
        if (this.currentMode === 'challenge') {
            document.getElementById('timer').textContent = this.timeLeft;
        }
    }
    
    saveProgress() {
        const progress = {
            bestScore: Math.max(this.score, this.getStoredValue('bestScore', 0)),
            bestStreak: Math.max(this.maxStreak, this.getStoredValue('bestStreak', 0)),
            totalGames: this.getStoredValue('totalGames', 0) + 1,
            totalScore: this.getStoredValue('totalScore', 0) + this.score,
            wrongNotes: this.wrongNotes,
            lastPlayed: Date.now()
        };
        
        Object.keys(progress).forEach(key => {
            localStorage.setItem(`notefy_${key}`, JSON.stringify(progress[key]));
        });
    }
    
    loadProgress() {
        this.wrongNotes = this.getStoredValue('wrongNotes', []);
    }
    
    getStoredValue(key, defaultValue) {
        try {
            const stored = localStorage.getItem(`notefy_${key}`);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NoteFyGame();
});

// Prevent right-click context menu for better mobile experience
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Add touch event handling for mobile devices
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
});

// Handle orientation changes
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.location.reload();
    }, 100);
});
// Cartas con temática de Tecnología (8 parejas = 16 cartas)
const animeItems = [
    { id: 'pc', icon: '💻', name: 'PC' },
    { id: 'phone', icon: '📱', name: 'Celular' },
    { id: 'game', icon: '🎮', name: 'Consola' },
    { id: 'robot', icon: '🤖', name: 'Robot' },
    { id: 'chip', icon: '⚡', name: 'Chip' },
    { id: 'lock', icon: '🔒', name: 'Seguridad' },
    { id: 'wifi', icon: '📡', name: 'Red' },
    { id: 'disk', icon: '💾', name: 'Disco' }
];

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let secondsElapsed = 0;
let timerInterval = null;
let gameStarted = false;

// Elementos del DOM
const gameBoard = document.getElementById('gameBoard');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const pairsDisplay = document.getElementById('pairs');
const bestTimeDisplay = document.getElementById('bestTime');
const winModal = document.getElementById('winModal');
const finalTimeDisplay = document.getElementById('finalTime');
const finalMovesDisplay = document.getElementById('finalMoves');
const btnRestart = document.getElementById('btnRestart');
const btnPlayAgain = document.getElementById('btnPlayAgain');

// Algoritmo Fisher-Yates para barajar aleatoriamente
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initGame() {
    gameBoard.innerHTML = '';
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    moves = 0;
    matchedPairs = 0;
    secondsElapsed = 0;
    gameStarted = false;
    clearInterval(timerInterval);
    
    timerDisplay.textContent = "00:00";
    movesDisplay.textContent = "0";
    pairsDisplay.textContent = `0 / ${animeItems.length}`;
    winModal.style.display = 'none';

    // Duplicar elementos para formar parejas y barajar
    const duplicatedItems = [...animeItems, ...animeItems];
    cards = shuffle(duplicatedItems);

    cards.forEach((item, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.id = item.id;
        card.dataset.index = index;
        card.innerHTML = ''; // Inicia boca abajo
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });

    loadBestTime();
}

function startTimer() {
    if (gameStarted) return;
    gameStarted = true;
    timerInterval = setInterval(() => {
        secondsElapsed++;
        const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
        const secs = (secondsElapsed % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${mins}:${secs}`;
    }, 1000);
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;
    if (this.classList.contains('flipped')) return;

    if (!gameStarted) startTimer();

    this.classList.add('flipped');
    const itemData = animeItems.find(item => item.id === this.dataset.id);
    this.innerHTML = itemData ? itemData.icon : '';

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    movesDisplay.textContent = moves;
    checkForMatch();
}

function checkForMatch() {
    const isMatch = firstCard.dataset.id === secondCard.dataset.id;
    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    matchedPairs++;
    pairsDisplay.textContent = `${matchedPairs} / ${animeItems.length}`;

    resetBoard();

    if (matchedPairs === animeItems.length) {
        clearInterval(timerInterval);
        setTimeout(showWinModal, 400);
    }
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        if (firstCard) {
            firstCard.classList.remove('flipped');
            firstCard.innerHTML = '';
        }
        if (secondCard) {
            secondCard.classList.remove('flipped');
            secondCard.innerHTML = '';
        }
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function showWinModal() {
    finalTimeDisplay.textContent = timerDisplay.textContent;
    finalMovesDisplay.textContent = moves;
    winModal.style.display = 'flex';
    saveBestTime();
}

function saveBestTime() {
    const currentBest = localStorage.getItem('techMemoramaBest');
    if (!currentBest || secondsElapsed < parseInt(currentBest)) {
        localStorage.setItem('techMemoramaBest', secondsElapsed);
    }
    loadBestTime();
}

function loadBestTime() {
    const best = localStorage.getItem('techMemoramaBest');
    if (best) {
        const mins = Math.floor(best / 60).toString().padStart(2, '0');
        const secs = (best % 60).toString().padStart(2, '0');
        bestTimeDisplay.textContent = `${mins}:${secs}`;
    } else {
        bestTimeDisplay.textContent = "--:--";
    }
}

// Botones de control
btnRestart.addEventListener('click', initGame);
btnPlayAgain.addEventListener('click', initGame);

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', initGame);

// Registro del Service Worker para PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
        .then(() => console.log('Service Worker registrado con éxito'))
        .catch(err => console.error('Error al registrar Service Worker:', err));
}

// Instalación manual de la PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btnInstall = document.getElementById('btnInstall');
    if (btnInstall) {
        btnInstall.style.display = 'inline-block';
        btnInstall.addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Usuario aceptó instalar la PWA');
                }
                deferredPrompt = null;
                btnInstall.style.display = 'none';
            });
        });
    }
});
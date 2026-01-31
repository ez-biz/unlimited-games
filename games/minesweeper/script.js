const gridEl = document.getElementById('grid');
const mineCountEl = document.getElementById('mine-count');
const timerEl = document.getElementById('timer');
const faceBtn = document.getElementById('face-btn');
const diffBtns = document.querySelectorAll('.diff-btn');
const overlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const finalTimeEl = document.getElementById('final-time');
const restartBtn = document.getElementById('restart-btn');

// Config
const CONFIG = {
    easy: { rows: 9, cols: 9, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 16, cols: 30, mines: 99 }
};

// State
let currentMode = 'easy';
let rows, cols, totalMines;
let board = []; // 2D array of { isMine, revealed, flagged, neighborCount }
let flags = 0;
let revealedCount = 0;
let isGameOver = false;
let isFirstClick = true;
let startTime = 0;
let timerInterval = null;
let isPaused = false;
let pauseStartTime = 0;

// Init
function init(mode) {
    currentMode = mode;
    const config = CONFIG[mode];
    rows = config.rows;
    cols = config.cols;
    totalMines = config.mines;

    // UI Update
    diffBtns.forEach(b => {
        b.classList.toggle('active', b.dataset.mode === mode);
    });

    resetGame();
}

function resetGame() {
    isGameOver = false;
    isPaused = false;
    isFirstClick = true;
    flags = 0;
    revealedCount = 0;
    board = [];

    clearInterval(timerInterval);
    timerEl.innerText = '000';
    faceBtn.innerText = '🙂';
    overlay.classList.add('hidden');
    gridEl.style.opacity = '1';

    updateMineCounter();
    createBoardStruct();
    renderGrid();
}

function createBoardStruct() {
    board = [];
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            row.push({
                r, c,
                isMine: false,
                revealed: false,
                flagged: false,
                neighborCount: 0
            });
        }
        board.push(row);
    }
}

function renderGrid() {
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${cols}, 24px)`;
    gridEl.style.gridTemplateRows = `repeat(${rows}, 24px)`;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.r = r;
            cell.dataset.c = c;

            // Event Listeners
            cell.addEventListener('mousedown', handleMouse);
            // Context menu for right click
            cell.addEventListener('contextmenu', e => e.preventDefault());

            gridEl.appendChild(cell);
            board[r][c].element = cell; // Link DOM element
        }
    }
}

function handleMouse(e) {
    if (isGameOver || isPaused) return;

    const r = parseInt(e.target.dataset.r);
    const c = parseInt(e.target.dataset.c);

    if (e.button === 0) { // Left Click
        if (board[r][c].revealed) {
            chord(r, c);
        } else {
            clickCell(r, c);
        }
    } else if (e.button === 2) { // Right Click
        toggleFlag(r, c);
    }
}

function clickCell(r, c) {
    const cell = board[r][c];
    if (cell.revealed || cell.flagged) return;

    if (isFirstClick) {
        generateMines(r, c);
        startTimer();
        isFirstClick = false;
    }

    if (cell.isMine) {
        gameOver(false, r, c);
    } else {
        reveal(r, c);
        checkWin();
    }
}

function generateMines(safeR, safeC) {
    let minesPlaced = 0;
    while (minesPlaced < totalMines) {
        const rr = Math.floor(Math.random() * rows);
        const cc = Math.floor(Math.random() * cols);

        // Don't place on existing mine or safe zone (and neighbors)
        if (!board[rr][cc].isMine && !(Math.abs(rr - safeR) <= 1 && Math.abs(cc - safeC) <= 1)) {
            board[rr][cc].isMine = true;
            minesPlaced++;
        }
    }

    // Calc neighbors
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!board[r][c].isMine) {
                board[r][c].neighborCount = countMines(r, c);
            }
        }
    }
}

function countMines(r, c) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const nr = r + i, nc = c + j;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
                count++;
            }
        }
    }
    return count;
}

function reveal(r, c) {
    const cell = board[r][c];
    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;
    revealedCount++;
    cell.element.classList.add('revealed');

    if (cell.neighborCount > 0) {
        cell.element.innerText = cell.neighborCount;
        cell.element.setAttribute('data-val', cell.neighborCount);
    } else {
        // Flood fill empty
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const nr = r + i, nc = c + j;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    reveal(nr, nc);
                }
            }
        }
    }
}

function toggleFlag(r, c) {
    const cell = board[r][c];
    if (cell.revealed) return;

    cell.flagged = !cell.flagged;
    if (cell.flagged) {
        cell.element.classList.add('flag');
        cell.element.innerText = '🚩';
        flags++;
    } else {
        cell.element.classList.remove('flag');
        cell.element.innerText = '';
        flags--;
    }
    updateMineCounter();
}

function chord(r, c) {
    const cell = board[r][c];
    if (!cell.revealed || cell.neighborCount === 0) return;

    // Count neighbor flags
    let flagCount = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const nr = r + i, nc = c + j;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].flagged) {
                flagCount++;
            }
        }
    }

    if (flagCount === cell.neighborCount) {
        // Reveal neighbors
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const nr = r + i, nc = c + j;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !board[nr][nc].flagged && !board[nr][nc].revealed) {
                    // Trigger click logic (handles mine hits)
                    if (board[nr][nc].isMine) {
                        gameOver(false, nr, nc);
                        return; // Stop processing
                    } else {
                        reveal(nr, nc);
                    }
                }
            }
        }
        checkWin();
    }
}

function updateMineCounter() {
    const diff = totalMines - flags;
    mineCountEl.innerText = diff.toString().padStart(3, '0');
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const delta = Math.floor((Date.now() - startTime) / 1000);
        timerEl.innerText = Math.min(999, delta).toString().padStart(3, '0');
    }, 1000);
}

function togglePause() {
    if (isGameOver || isFirstClick) return; // Don't pause before start or after end

    isPaused = !isPaused;

    if (isPaused) {
        // Stop timer
        clearInterval(timerInterval);
        pauseStartTime = Date.now();

        // Visuals
        gridEl.style.opacity = '0';
        overlayTitle.innerText = "PAUSED";
        overlayTitle.style.color = '#fff';
        faceBtn.innerText = '😴';

        // Re-use overlay but hide buttons if needed, or just show text
        // Actually overlay has "PLAY AGAIN" button. Let's make a dedicated pause overlay or modifying existing.
        // Quickest: modify overlay content temporarily
        overlay.classList.remove('hidden');
        restartBtn.classList.add('hidden');
        finalTimeEl.parentElement.classList.add('hidden');
    } else {
        // Resume timer
        const pauseDuration = Date.now() - pauseStartTime;
        startTime += pauseDuration;

        startTimer(); // Re-bind interval

        // Visuals
        gridEl.style.opacity = '1';
        faceBtn.innerText = '🙂';

        overlay.classList.add('hidden');
        restartBtn.classList.remove('hidden');
        finalTimeEl.parentElement.classList.remove('hidden');
    }
}

// Input
document.addEventListener('keydown', e => {
    if (e.key === 'p' || e.key === 'P') {
        togglePause();
    }
});

function checkWin() {
    if (revealedCount === (rows * cols) - totalMines) {
        gameOver(true);
    }
}

function gameOver(win, hitR, hitC) {
    isGameOver = true;
    clearInterval(timerInterval);

    if (win) {
        faceBtn.innerText = '😎';
        overlayTitle.innerText = "CLEARED!";
        overlayTitle.style.color = '#00ff88';
        finalTimeEl.innerText = Math.floor((Date.now() - startTime) / 1000);
        overlay.classList.remove('hidden');
    } else {
        faceBtn.innerText = '💀';
        // Reveal mines
        board.forEach(row => row.forEach(cell => {
            if (cell.isMine) {
                cell.element.classList.add('revealed', 'mine');
                cell.element.innerText = '💣';
                if (cell.r === hitR && cell.c === hitC) {
                    cell.element.style.backgroundColor = '#f00';
                }
            } else if (cell.flagged) {
                // Wrong flag
                cell.element.innerText = '❌';
            }
        }));
    }
}

// Listeners
faceBtn.addEventListener('click', resetGame);
restartBtn.addEventListener('click', resetGame);

diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        init(btn.dataset.mode);
    });
});

// Start
init('easy');

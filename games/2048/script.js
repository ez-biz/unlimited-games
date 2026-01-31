const gridEl = document.getElementById('grid');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const newGameBtn = document.getElementById('newGameBtn');
const restartBtn = document.getElementById('restartBtn');
const overlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');

const SIZE = 4;
let grid = [];
let score = 0;
let best = localStorage.getItem('2048best') || 0;
bestEl.textContent = best;

function init() {
    grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
    score = 0;
    scoreEl.textContent = score;
    overlay.classList.add('hidden');
    addRandomTile();
    addRandomTile();
    render();
}

function addRandomTile() {
    const empty = [];
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 0) empty.push({ r, c });
        }
    }
    if (empty.length === 0) return false;
    const { r, c } = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return true;
}

function render() {
    gridEl.innerHTML = '';
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            const val = grid[r][c];
            if (val) {
                cell.textContent = val;
                cell.dataset.value = val;
            }
            gridEl.appendChild(cell);
        }
    }
}

function slide(row) {
    let arr = row.filter(v => v !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            score += arr[i];
            arr[i + 1] = 0;
        }
    }
    arr = arr.filter(v => v !== 0);
    while (arr.length < SIZE) arr.push(0);
    return arr;
}

function move(direction) {
    let moved = false;
    let newGrid = grid.map(r => [...r]);

    if (direction === 'left') {
        for (let r = 0; r < SIZE; r++) {
            const newRow = slide(grid[r]);
            if (newRow.join() !== grid[r].join()) moved = true;
            newGrid[r] = newRow;
        }
    } else if (direction === 'right') {
        for (let r = 0; r < SIZE; r++) {
            const reversed = [...grid[r]].reverse();
            const newRow = slide(reversed).reverse();
            if (newRow.join() !== grid[r].join()) moved = true;
            newGrid[r] = newRow;
        }
    } else if (direction === 'up') {
        for (let c = 0; c < SIZE; c++) {
            const col = grid.map(row => row[c]);
            const newCol = slide(col);
            if (newCol.join() !== col.join()) moved = true;
            for (let r = 0; r < SIZE; r++) newGrid[r][c] = newCol[r];
        }
    } else if (direction === 'down') {
        for (let c = 0; c < SIZE; c++) {
            const col = grid.map(row => row[c]).reverse();
            const newCol = slide(col).reverse();
            const origCol = grid.map(row => row[c]);
            if (newCol.join() !== origCol.join()) moved = true;
            for (let r = 0; r < SIZE; r++) newGrid[r][c] = newCol[r];
        }
    }

    if (moved) {
        grid = newGrid;
        addRandomTile();
        render();
        scoreEl.textContent = score;

        if (score > best) {
            best = score;
            bestEl.textContent = best;
            localStorage.setItem('2048best', best);
        }

        checkGameState();
    }
}

function checkGameState() {
    // Check for 2048
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 2048) {
                overlayTitle.textContent = 'You Win! 🎉';
                overlayTitle.style.color = '#00ff88';
                overlayScore.textContent = 'Score: ' + score;
                overlay.classList.remove('hidden');
                return;
            }
        }
    }

    // Check for game over
    if (isGameOver()) {
        overlayTitle.textContent = 'Game Over!';
        overlayTitle.style.color = '#ff0066';
        overlayScore.textContent = 'Score: ' + score;
        overlay.classList.remove('hidden');
    }
}

function isGameOver() {
    // Check for empty cells
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 0) return false;
        }
    }
    // Check for possible merges
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const val = grid[r][c];
            if (c < SIZE - 1 && grid[r][c + 1] === val) return false;
            if (r < SIZE - 1 && grid[r + 1][c] === val) return false;
        }
    }
    return true;
}

// Controls
document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowLeft': case 'a': case 'A': move('left'); break;
        case 'ArrowRight': case 'd': case 'D': move('right'); break;
        case 'ArrowUp': case 'w': case 'W': move('up'); break;
        case 'ArrowDown': case 's': case 'S': move('down'); break;
    }
});

// Touch support
let touchStartX, touchStartY;
document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', e => {
    if (!touchStartX || !touchStartY) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) move('right');
        else if (dx < -30) move('left');
    } else {
        if (dy > 30) move('down');
        else if (dy < -30) move('up');
    }
    touchStartX = touchStartY = null;
});

newGameBtn.addEventListener('click', init);
restartBtn.addEventListener('click', init);

init();

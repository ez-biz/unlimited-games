const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');
const holdCanvas = document.getElementById('holdCanvas');
const holdCtx = holdCanvas.getContext('2d');

const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const overlay = document.getElementById('game-overlay');
const overlayScore = document.getElementById('overlay-score');
const restartBtn = document.getElementById('restart-btn');

// Constants
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 24; // Matches canvas dimension 240 / 10 and 480 / 20 (Wait, 400 height? 400/20 = 20 rows * 20 px?)
// Let's adjust BLOCK_SIZE to fill the canvas.
// If canvas height is 400, and we want 20 rows, block size is 20.
// If canvas width is 240, and we want 10 cols, block size is 24.
// Problem: Rectangular blocks? No.
// Let's fix Canvas Size in JS or assume square.
// 240 width / 10 cols = 24px per block.
// 20 rows * 24px = 480px height.
// Update canvas height to 480? Or Keep blocks small.
// Let's resize canvas to 240x480 for standard aspect ratio.
canvas.height = 480;

const COLORS = [
    null,
    '#FF0D72', // T (Magenta) -> We'll map standard Tetris colors roughly
    '#0DC2FF', // I (Cyan)
    '#0DFF72', // S (Green)
    '#F538FF', // Z (Red... wait neon palette) -> Purple
    '#FF8E0D', // L (Orange)
    '#FFE138', // J (Yellow... wait O is yellow) -> Blue/Pink
    '#3877FF', // O (Blue... wait J is blue)
];

// Standard Tetris Colors Neon-ified
const PIECES = [
    [],
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]], // T - Purple
    [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]], // I - Cyan
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]], // S - Green
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]], // Z - Red
    [[0, 0, 1], [1, 1, 1], [0, 0, 0]], // L - Orange
    [[1, 0, 0], [1, 1, 1], [0, 0, 0]], // J - Blue
    [[1, 1], [1, 1]], // O - Yellow
];
const PIECE_COLORS = [
    null,
    '#bd00ff', // T
    '#00d4ff', // I
    '#00ff88', // S
    '#ff0055', // Z
    '#ff9900', // L
    '#0055ff', // J
    '#ffff00', // O
];

// State
let arena = createMatrix(COLS, ROWS);
let player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
    lines: 0,
    level: 1,
    pieceIndex: 0 // Index in PIECES array (1-7)
};
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let isGameOver = false;
let isPaused = false;

// Bag Randomizer
let pieceBag = [];
let nextQueue = [];
let holdPiece = null;
let canHold = true;

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function generateBag() {
    const bag = [1, 2, 3, 4, 5, 6, 7];
    // Shuffle
    for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
}

function getNextPiece() {
    if (pieceBag.length === 0) {
        pieceBag = generateBag();
    }
    const index = pieceBag.pop();
    return {
        matrix: PIECES[index],
        color: index // Store index to retrieve color
    };
}

function drawMatrix(matrix, offset, context = ctx, colorOverride = null, alpha = 1) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                // Determine color: Value is index into PIECE_COLORS
                // If rendering ghost/preview, value might just be 1.
                // We need to know which piece type it is.
                // For arena, value IS the piece index.
                const color = colorOverride || PIECE_COLORS[value];

                context.fillStyle = color;
                context.globalAlpha = alpha;
                context.fillRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

                // Bevel effect
                context.lineWidth = 2;
                context.strokeStyle = 'rgba(255,255,255,0.5)';
                context.strokeRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

                context.globalAlpha = 1;
            }
        });
    });
}

function draw() {
    // Clear Main
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isPaused) {
        ctx.fillStyle = '#fff';
        ctx.font = '30px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Draw Arena
    drawMatrix(arena, { x: 0, y: 0 });

    // Draw Ghost Piece
    if (player.matrix) {
        const ghostPos = { ...player.pos };
        while (!collide(arena, { pos: ghostPos, matrix: player.matrix })) {
            ghostPos.y++;
        }
        ghostPos.y--; // Back up one step
        drawMatrix(player.matrix, ghostPos, ctx, PIECE_COLORS[player.pieceIndex], 0.2); // Low alpha
    }

    // Draw Player
    if (player.matrix) {
        drawMatrix(player.matrix, player.pos);
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) { // Check undefined (bounds) or non-zero (collision)
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = player.pieceIndex; // Store actual color index
            }
        });
    });
}

function rotate(matrix, dir) {
    // Transpose
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    // Reverse rows
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerReset() {
    if (nextQueue.length === 0) {
        // Init queue
        const bag1 = generateBag();
        const bag2 = generateBag();
        bag1.forEach(i => nextQueue.push({ matrix: PIECES[i], color: i }));
        bag2.forEach(i => nextQueue.push({ matrix: PIECES[i], color: i }));
    }

    const next = nextQueue.shift();
    player.matrix = next.matrix;
    player.pieceIndex = next.color;

    // Auto-fill queue
    if (nextQueue.length < 7) {
        const bag = generateBag();
        bag.forEach(i => nextQueue.push({ matrix: PIECES[i], color: i }));
    }

    drawPreview();

    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        isGameOver = true;
        overlay.classList.remove('hidden');
        overlayScore.innerText = `Final Score: ${player.score}`;
    }

    canHold = true;
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    // Wall kicks (basic)
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function playerHold() {
    if (!canHold) return;

    if (holdPiece === null) {
        holdPiece = { matrix: player.matrix, color: player.pieceIndex };
        playerReset();
    } else {
        const temp = { matrix: player.matrix, color: player.pieceIndex };
        player.matrix = holdPiece.matrix;
        player.pieceIndex = holdPiece.color;
        holdPiece = temp;

        // Reset pos
        player.pos.y = 0;
        player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    }

    canHold = false;
    drawHold();
}

function arenaSweep() {
    let rowCount = 0;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        rowCount++;
    }

    if (rowCount > 0) {
        // Scoring: 100, 300, 500, 800 * level
        const lineScores = [0, 100, 300, 500, 800];
        player.score += lineScores[rowCount] * player.level;
        player.lines += rowCount;
        player.level = Math.floor(player.lines / 10) + 1;

        // Speed up
        dropInterval = Math.max(100, 1000 - (player.level - 1) * 100);
    }
}

function update(time = 0) {
    if (isGameOver || isPaused) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    scoreElement.innerText = player.score;
    levelElement.innerText = player.level;
    linesElement.innerText = player.lines;
}

function drawPreview() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    // Draw top 3
    for (let i = 0; i < 3; i++) {
        const p = nextQueue[i];
        if (p) {
            // Center in 80px width
            // Each block is roughly 15-20px in preview
            const previewBlockSize = 18;
            const offsetX = (4 - p.matrix[0].length) / 2;
            const offsetY = 1 + (i * 4); // Spacing

            p.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        nextCtx.fillStyle = PIECE_COLORS[p.color];
                        nextCtx.fillRect((x + offsetX) * previewBlockSize, (y + offsetY) * previewBlockSize, previewBlockSize, previewBlockSize);
                        nextCtx.strokeRect((x + offsetX) * previewBlockSize, (y + offsetY) * previewBlockSize, previewBlockSize, previewBlockSize);
                    }
                });
            });
        }
    }
}

function drawHold() {
    holdCtx.fillStyle = '#000';
    holdCtx.fillRect(0, 0, holdCanvas.width, holdCanvas.height);

    if (holdPiece) {
        const previewBlockSize = 18;
        const offsetX = (4 - holdPiece.matrix[0].length) / 2;
        const offsetY = 1;

        holdPiece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    holdCtx.fillStyle = PIECE_COLORS[holdPiece.color];
                    holdCtx.fillRect((x + offsetX) * previewBlockSize, (y + offsetY) * previewBlockSize, previewBlockSize, previewBlockSize);
                    holdCtx.strokeRect((x + offsetX) * previewBlockSize, (y + offsetY) * previewBlockSize, previewBlockSize, previewBlockSize);
                }
            });
        });
    }
}

// Input
document.addEventListener('keydown', event => {
    if (isGameOver) return;

    if (event.code === 'ArrowLeft') {
        playerMove(-1);
    } else if (event.code === 'ArrowRight') {
        playerMove(1);
    } else if (event.code === 'ArrowDown') {
        playerDrop();
    } else if (event.code === 'ArrowUp') {
        playerRotate(1);
        // rotate clockwise
    } else if (event.code === 'KeyQ') { // Option for CCW
        playerRotate(-1);
    } else if (event.code === 'Space') {
        // Hard drop
        while (!collide(arena, player)) {
            player.pos.y++;
        }
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
        dropCounter = 0;
    } else if (event.code === 'KeyC') {
        playerHold();
    } else if (event.code === 'KeyP' || event.code === 'KeyO') { // P to pause
        if (!isGameOver) {
            isPaused = !isPaused;
            if (isPaused) draw(); // Draw pause text
            else {
                lastTime = performance.now();
                requestAnimationFrame(update);
            }
        }
    }
});

restartBtn.addEventListener('click', () => {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    player.lines = 0;
    player.level = 1;
    dropInterval = 1000;
    nextQueue = [];
    holdPiece = null;
    drawHold();
    updateScore();
    isGameOver = false;
    overlay.classList.add('hidden');
    playerReset();
    update();
});

// Start
playerReset();
updateScore();
update();

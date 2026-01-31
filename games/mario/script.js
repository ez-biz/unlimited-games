const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elements
const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const worldEl = document.getElementById('world');
const timeEl = document.getElementById('time');
const overlay = document.getElementById('game-overlay');
const restartBtn = document.getElementById('restart-btn');

// Constants
const TILE_SIZE = 32;
const GRAVITY = 0.5;
const FRICTION = 0.8;
const MAX_SPEED = 6;
const JUMP_FORCE = -11;
const ACCEL = 0.5;

// Tile Types
const TILE_AIR = 0;
const TILE_GROUND = 1;
const TILE_BRICK = 2;
const TILE_BLOCK = 3; // Unbreakable/Solid
const TILE_Q = 4; // Question
const TILE_PIPE_L = 5;
const TILE_PIPE_R = 6;
const TILE_PIPE_TOP_L = 7;
const TILE_PIPE_TOP_R = 8;

// Map (Basic 1-1 structure simulated)
// 25 tiles high (480/32 = 15 rows?)
// 480 / 32 = 15 rows.
const ROWS = 15;
// Width: Long enough for a level.
const COLS = 100;

let map = [];
let camera = { x: 0, y: 0 };

// Game State
let score = 0;
let coins = 0;
let time = 300;
let isGameOver = false;
let isPaused = false;
let gameLoopId;
let timerInterval;

// Inputs
const keys = {
    right: false,
    left: false,
    up: false,
    shift: false
};

// Player
let player = {
    x: 100,
    y: 100,
    width: 24, // Slightly smaller than tile
    height: 32,
    vx: 0,
    vy: 0,
    grounded: false,
    color: '#ff0055' // Neon Red
};

// Particles
let particles = [];

function init() {
    isGameOver = false;
    isPaused = false;
    score = 0;
    coins = 0;
    time = 300;

    player.x = 100;
    player.y = 100;
    player.vx = 0;
    player.vy = 0;
    camera.x = 0;

    generateMap();

    scoreEl.innerText = score.toString().padStart(6, '0');
    coinsEl.innerText = 'x' + coins.toString().padStart(2, '0');
    overlay.classList.add('hidden');

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!isPaused && !isGameOver) {
            time--;
            timeEl.innerText = time;
            if (time <= 0) gameOver();
        }
    }, 1000);

    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    loop();
}

function generateMap() {
    map = [];
    // Init empty
    for (let r = 0; r < ROWS; r++) {
        map[r] = new Array(COLS).fill(TILE_AIR);
    }

    // Floor
    for (let c = 0; c < COLS; c++) {
        if (c < 69 || c > 71) { // Gap
            map[ROWS - 1][c] = TILE_GROUND;
            map[ROWS - 2][c] = TILE_GROUND;
        }
    }

    // Structures
    // Q Blocks & Bricks
    setTile(16, 9, TILE_Q);
    setTile(20, 9, TILE_BRICK);
    setTile(21, 9, TILE_Q);
    setTile(22, 9, TILE_BRICK);
    setTile(23, 9, TILE_Q);
    setTile(24, 9, TILE_BRICK);
    setTile(22, 5, TILE_Q);

    // Pipes
    addPipe(28, 2);
    addPipe(38, 3);
    addPipe(46, 4);

    // Staircase
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j <= i; j++) {
            setTile(55 + i, 11 - j, TILE_BLOCK);
        }
    }

    // Wall
    setTile(65, 9, TILE_BLOCK);
}

function addPipe(x, height) {
    // Top
    setTile(x, ROWS - 2 - height, TILE_PIPE_TOP_L);
    setTile(x + 1, ROWS - 2 - height, TILE_PIPE_TOP_R);
    // Body
    for (let h = 1; h < height; h++) {
        setTile(x, ROWS - 2 - h, TILE_PIPE_L);
        setTile(x + 1, ROWS - 2 - h, TILE_PIPE_R);
    }
}

function setTile(x, y, type) {
    if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
        map[y][x] = type;
    }
}

function update() {
    if (isGameOver || isPaused) return;

    // Input Handling
    if (keys.right) {
        if (player.vx < MAX_SPEED) player.vx += ACCEL;
    } else if (keys.left) {
        if (player.vx > -MAX_SPEED) player.vx -= ACCEL;
    } else {
        player.vx *= FRICTION;
    }

    if (keys.up && player.grounded) {
        player.vy = JUMP_FORCE;
        player.grounded = false;
    }

    // Physics
    player.vy += GRAVITY;
    player.x += player.vx;
    collideX();
    player.y += player.vy;
    collideY();

    // Camera Follow
    if (player.x > camera.x + 300) {
        camera.x = player.x - 300;
    }
    // Clamp Camera
    camera.x = Math.max(0, Math.min(camera.x, COLS * TILE_SIZE - canvas.width));

    // Death (Fall)
    if (player.y > canvas.height) {
        gameOver();
    }
}

function collideX() {
    let top = Math.floor(player.y / TILE_SIZE);
    let bottom = Math.floor((player.y + player.height - 1) / TILE_SIZE);
    let left = Math.floor(player.x / TILE_SIZE);
    let right = Math.floor((player.x + player.width - 1) / TILE_SIZE);

    // Check Right
    if (player.vx > 0) {
        if (isSolid(right, top) || isSolid(right, bottom)) {
            player.x = right * TILE_SIZE - player.width;
            player.vx = 0;
        }
    }
    // Check Left
    else if (player.vx < 0) {
        if (isSolid(left, top) || isSolid(left, bottom)) {
            player.x = (left + 1) * TILE_SIZE;
            player.vx = 0;
        }
    }
}

function collideY() {
    let top = Math.floor(player.y / TILE_SIZE);
    let bottom = Math.floor((player.y + player.height - 1) / TILE_SIZE);
    let left = Math.floor(player.x / TILE_SIZE);
    let right = Math.floor((player.x + player.width - 1) / TILE_SIZE);

    // Check Down
    if (player.vy > 0) {
        if (isSolid(left, bottom) || isSolid(right, bottom)) {
            player.y = bottom * TILE_SIZE - player.height;
            player.vy = 0;
            player.grounded = true;
        } else {
            player.grounded = false;
        }
    }
    // Check Up
    else if (player.vy < 0) {
        if (isSolid(left, top) || isSolid(right, top)) {
            player.y = (top + 1) * TILE_SIZE;
            player.vy = 0;
            // Interaction logic (Head bump)
            interact(left, top);
            if (right != left) interact(right, top);
        }
    }
}

function isSolid(x, y) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    return map[y][x] !== TILE_AIR;
}

function interact(x, y) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return;
    let tile = map[y][x];
    if (tile === TILE_Q) {
        map[y][x] = TILE_BLOCK; // Used
        score += 100;
        coins++;
        createEffects(x, y, 'coin');
    } else if (tile === TILE_BRICK) {
        // Break brick
        map[y][x] = TILE_AIR;
        createEffects(x, y, 'rubble');
        score += 50;
    }
    scoreEl.innerText = score.toString().padStart(6, '0');
    coinsEl.innerText = 'x' + coins.toString().padStart(2, '0');
}

function createEffects(tx, ty, type) {
    // Visual only for now
}

function draw() {
    // BG
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-camera.x, 0); // Apply Camera

    // Draw Map
    for (let r = 0; r < ROWS; r++) {
        for (let c = Math.floor(camera.x / TILE_SIZE); c < Math.min(COLS, Math.floor((camera.x + canvas.width) / TILE_SIZE) + 1); c++) {
            let tile = map[r][c];
            let x = c * TILE_SIZE;
            let y = r * TILE_SIZE;

            if (tile === TILE_GROUND) {
                ctx.fillStyle = '#00ff88';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = '#004400';
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            } else if (tile === TILE_BRICK) {
                ctx.fillStyle = '#ff5500';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            } else if (tile === TILE_Q) {
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#000';
                ctx.font = '20px sans-serif';
                ctx.fillText('?', x + 10, y + 24);
            } else if (tile === TILE_BLOCK) {
                ctx.fillStyle = '#666';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            } else if (tile >= TILE_PIPE_L && tile <= TILE_PIPE_TOP_R) {
                ctx.fillStyle = '#00aa00';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0;

    ctx.restore();

    // Pause Overlay
    if (isPaused) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = '30px "Press Start 2P"';
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
    }
}

function loop() {
    update();
    draw();
    gameLoopId = requestAnimationFrame(loop);
}

function gameOver() {
    isGameOver = true;
    overlay.classList.remove('hidden');
}

// Controls
document.addEventListener('keydown', e => {
    switch (e.code) {
        case 'ArrowRight': case 'KeyD': keys.right = true; break;
        case 'ArrowLeft': case 'KeyA': keys.left = true; break;
        case 'ArrowUp': case 'KeyW': case 'Space': keys.up = true; break;
        case 'ShiftLeft': case 'ShiftRight': keys.shift = true; break;
        case 'KeyP':
            if (!isGameOver) isPaused = !isPaused;
            break;
    }
});

document.addEventListener('keyup', e => {
    switch (e.code) {
        case 'ArrowRight': case 'KeyD': keys.right = false; break;
        case 'ArrowLeft': case 'KeyA': keys.left = false; break;
        case 'ArrowUp': case 'KeyW': case 'Space': keys.up = false; break;
        case 'ShiftLeft': case 'ShiftRight': keys.shift = false; break;
    }
});

restartBtn.addEventListener('click', init);

init();

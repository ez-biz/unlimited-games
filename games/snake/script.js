const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const overlay = document.getElementById('game-overlay');
const overlayScore = document.getElementById('overlay-score');
const restartBtn = document.getElementById('restart-btn');

// Game Constants
const GRID_SIZE = 20; // Size of one grid cell in pixels
const TILE_COUNT = canvas.width / GRID_SIZE; // 600 / 20 = 30 tiles wide/high
const GAME_SPEED = 100; // Milliseconds per move (lower = faster)

// Game State
let score = 0;
let snake = [];
let food = { x: 0, y: 0 };
let velocity = { x: 0, y: 0 };
let inputQueue = []; // Queue for inputs to prevent self-collision on quick turns
let lastTime = 0;
let accumulator = 0;
let isGameOver = false;
let isPaused = false;
let gameLoopId = null;

// Initialize Game
function initGame() {
    isGameOver = false;
    isPaused = false;
    score = 0;
    snake = [
        { x: 10, y: 15 },
        { x: 9, y: 15 },
        { x: 8, y: 15 }
    ];
    velocity = { x: 1, y: 0 }; // Moving right initially
    inputQueue = [];
    scoreElement.innerText = score;
    overlay.classList.add('hidden');

    spawnFood();

    // Start Loop
    lastTime = performance.now();

    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Main Game Loop
function gameLoop(currentTime) {
    if (isGameOver) return;

    if (isPaused) {
        draw(); // Keep drawing to show Pause text
        gameLoopId = requestAnimationFrame(gameLoop);
        lastTime = currentTime; // Prevent catch-up
        return;
    }

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    accumulator += deltaTime;

    // Fixed step update
    while (accumulator > GAME_SPEED) {
        update();
        accumulator -= GAME_SPEED;
    }

    draw();
    gameLoopId = requestAnimationFrame(gameLoop);
}

function update() {
    // Process Input
    if (inputQueue.length > 0) {
        const nextDir = inputQueue.shift();

        // Prevent reversing directly
        const movingHorizontally = velocity.x !== 0;
        const movingVertically = velocity.y !== 0;

        if (nextDir === 'UP' && !movingVertically) velocity = { x: 0, y: -1 };
        if (nextDir === 'DOWN' && !movingVertically) velocity = { x: 0, y: 1 };
        if (nextDir === 'LEFT' && !movingHorizontally) velocity = { x: -1, y: 0 };
        if (nextDir === 'RIGHT' && !movingHorizontally) velocity = { x: 1, y: 0 };
    }

    // Move Head
    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

    // Collision: Wall
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    // Collision: Self
    for (let part of snake) {
        if (head.x === part.x && head.y === part.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head); // Add new head

    // Check Food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.innerText = score;
        spawnFood();
        // Don't pop tail -> snake grows
    } else {
        snake.pop(); // Remove tail
    }
}

function draw() {
    // Clear screen
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Use clearRect to show CSS grid background if desired

    // Draw Snake
    ctx.fillStyle = '#00ff88'; // Neon Green
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ff88';

    snake.forEach((part, index) => {
        // Head color slightly different
        if (index === 0) ctx.fillStyle = '#ccffdd';
        else ctx.fillStyle = '#00ff88';

        ctx.fillRect(part.x * GRID_SIZE, part.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    });

    // Reset Shadow for Food
    ctx.shadowBlur = 0;

    // Draw Food
    ctx.fillStyle = '#ff0055'; // Neon Pink
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff0055';

    // Draw food as circle
    const centerX = (food.x * GRID_SIZE) + (GRID_SIZE / 2);
    const centerY = (food.y * GRID_SIZE) + (GRID_SIZE / 2);
    const radius = (GRID_SIZE / 2) - 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.shadowBlur = 0; // Reset
    ctx.shadowColor = 'transparent';

    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = '30px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
}

function spawnFood() {
    // Try random positions until we find one not on snake
    let validPosition = false;
    while (!validPosition) {
        food.x = Math.floor(Math.random() * TILE_COUNT);
        food.y = Math.floor(Math.random() * TILE_COUNT);

        validPosition = true;
        for (let part of snake) {
            if (part.x === food.x && part.y === food.y) {
                validPosition = false;
                break;
            }
        }
    }
}

function gameOver() {
    isGameOver = true;
    overlay.classList.remove('hidden');
    overlayScore.innerText = `Final Score: ${score}`;
}

// Input Handling
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        if (!isGameOver) isPaused = !isPaused;
        return;
    }

    if (isPaused) return;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            inputQueue.push('UP');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            inputQueue.push('DOWN');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            inputQueue.push('LEFT');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            inputQueue.push('RIGHT');
            break;
    }
});

restartBtn.addEventListener('click', initGame);

// Start
initGame();

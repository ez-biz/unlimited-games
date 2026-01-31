const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverlay = document.getElementById('game-overlay');
const levelOverlay = document.getElementById('level-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');
const restartBtn = document.getElementById('restart-btn');
const nextLevelBtn = document.getElementById('next-level-btn');

// Game Constants
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 8;
const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 9;
const BRICK_WIDTH = 75;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 50;
const BRICK_OFFSET_LEFT = 22; // Center text roughly

// Game State
let score = 0;
let lives = 3;
let level = 1;
let isGameOver = false;
let isLevelPaused = false;
let isPaused = false;

// Paddle
let paddleX = (canvas.width - PADDLE_WIDTH) / 2;
let rightPressed = false;
let leftPressed = false;

// Ball
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 4;
let dy = -4;

// Bricks
let bricks = [];

function initBricks() {
    bricks = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        bricks[c] = [];
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            // Level generation: Bricks can have different status
            // 1 = active, 0 = broken.
            // Future: Higher numbers for multi-hit
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#00d4ff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00d4ff';
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = '#00d4ff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00d4ff';
    ctx.fill(); // Fill rect
    ctx.shadowBlur = 0;
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
                const brickY = (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                ctx.beginPath();
                ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);

                // Color based on row
                const colors = ['#ff0055', '#ff9900', '#ffff00', '#00ff88', '#00d4ff'];
                ctx.fillStyle = colors[r % colors.length];

                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (x > b.x && x < b.x + BRICK_WIDTH && y > b.y && y < b.y + BRICK_HEIGHT) {
                    dy = -dy;
                    b.status = 0;
                    score += 10;
                    scoreElement.innerText = score;
                    if (score % (BRICK_ROW_COUNT * BRICK_COLUMN_COUNT * 10) === 0) {
                        levelComplete();
                    }
                }
            }
        }
    }
}

function levelComplete() {
    isLevelPaused = true;
    level++;
    // Increase speed slightly
    if (dx > 0) dx += 1; else dx -= 1;
    if (dy > 0) dy += 1; else dy -= 1;

    levelOverlay.classList.remove('hidden');
    document.getElementById('level-title').innerText = `LEVEL ${level - 1} CLEAR`;
}

function draw() {
    if (isGameOver || isLevelPaused) return;

    if (isPaused) {
        // Draw Pause Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = '30px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);

        requestAnimationFrame(draw);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // Wall Bounce
    if (x + dx > canvas.width - BALL_RADIUS || x + dx < BALL_RADIUS) {
        dx = -dx;
    }
    if (y + dy < BALL_RADIUS) {
        dy = -dy;
    } else if (y + dy > canvas.height - BALL_RADIUS - 10) { // Bottom (near paddle)
        if (x > paddleX && x < paddleX + PADDLE_WIDTH) {
            // Paddle hit logic: varies angle based on hit position
            // Center of paddle = 0 offset. Edges = higher offset.
            let collidePoint = x - (paddleX + PADDLE_WIDTH / 2);
            // Normalize
            collidePoint = collidePoint / (PADDLE_WIDTH / 2);

            // Calculate angle (max 60 degrees)
            let angle = collidePoint * (Math.PI / 3);

            // Speed stays constant but direction changes
            let speed = Math.sqrt(dx * dx + dy * dy);
            dx = speed * Math.sin(angle);
            dy = -speed * Math.cos(angle);

        } else if (y + dy > canvas.height - BALL_RADIUS) {
            // Ball lost
            lives--;
            livesElement.innerText = lives;
            if (!lives) {
                gameOver();
            } else {
                // Reset ball position
                x = canvas.width / 2;
                y = canvas.height - 30;
                dx = 4;
                dy = -4;
                paddleX = (canvas.width - PADDLE_WIDTH) / 2;
            }
        }
    }

    // Move Ball
    x += dx;
    y += dy;

    // Move Paddle
    if (rightPressed && paddleX < canvas.width - PADDLE_WIDTH) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    requestAnimationFrame(draw);
}

function gameOver() {
    isGameOver = true;
    gameOverlay.classList.remove('hidden');
    overlayScore.innerText = `Final Score: ${score}`;
}

function restartGame() {
    document.location.reload(); // Simple reload for now
}

function startNextLevel() {
    isLevelPaused = false;
    levelOverlay.classList.add('hidden');

    // Reset positions, keep score/lives
    x = canvas.width / 2;
    y = canvas.height - 30;
    paddleX = (canvas.width - PADDLE_WIDTH) / 2;

    initBricks();
    requestAnimationFrame(draw);
}

// Input
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener('mousemove', mouseMoveHandler, false);
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        if (!isGameOver && !isLevelPaused) isPaused = !isPaused;
    }
});

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
    else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
    else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - PADDLE_WIDTH / 2;
    }
}

restartBtn.addEventListener('click', restartGame);
nextLevelBtn.addEventListener('click', startNextLevel);

// Start
initBricks();
draw();

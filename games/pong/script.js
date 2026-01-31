const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI
const p1ScoreEl = document.getElementById('p1-score');
const p2ScoreEl = document.getElementById('p2-score');
const p2LabelEl = document.getElementById('p2-label');
const startScreen = document.getElementById('start-screen');
const gameOverlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const modeBtns = document.querySelectorAll('#mode-1p, #mode-2p');
const diffBtns = document.querySelectorAll('.difficulty-select button');
const diffSelect = document.getElementById('difficulty-select');

// Constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const WIN_SCORE = 11;

// Config
let isMultiplayer = false;
let aiDifficulty = 'medium'; // easy, medium, hard
let aiSpeed = 4;

// State
let p1 = {
    x: 20,
    y: 210, // Centered (500/2 - 80/2)
    score: 0,
    color: '#00d4ff',
    speed: 6,
    dy: 0 // Movement direction
};

let p2 = {
    x: 770, // 800 - 20 - 10
    y: 210,
    score: 0,
    color: '#ff0055',
    speed: 6, // Player Speed
    dy: 0
};

let ball = {
    x: 400,
    y: 250,
    vx: 5,
    vy: 5,
    speed: 7
};

let gameState = 'START'; // START, PLAYING, END
let isPaused = false;

// Setup Event Listeners
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        isMultiplayer = btn.id === 'mode-2p';

        if (isMultiplayer) {
            diffSelect.classList.add('hidden');
            p2LabelEl.innerText = "PLAYER 2";
        } else {
            diffSelect.classList.remove('hidden');
            p2LabelEl.innerText = "CPU";
        }
    });
});

diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        diffBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        aiDifficulty = btn.dataset.diff;

        if (aiDifficulty === 'easy') aiSpeed = 3;
        else if (aiDifficulty === 'medium') aiSpeed = 5;
        else if (aiDifficulty === 'hard') aiSpeed = 9;
    });
});

document.addEventListener('keydown', e => {
    // Start Game
    if (gameState === 'START' && e.code === 'Space') {
        startGame();
        return;
    }

    // Pause
    if (gameState === 'PLAYING' && e.code === 'Space') {
        isPaused = !isPaused;
        return;
    }

    // P1 Controls
    if (e.code === 'KeyW') p1.dy = -1;
    if (e.code === 'KeyS') p1.dy = 1;

    // P2 Controls (Human)
    if (isMultiplayer) {
        if (e.code === 'ArrowUp') p2.dy = -1;
        if (e.code === 'ArrowDown') p2.dy = 1;
    }
});

document.addEventListener('keyup', e => {
    if (e.code === 'KeyW' && p1.dy === -1) p1.dy = 0;
    if (e.code === 'KeyS' && p1.dy === 1) p1.dy = 0;

    if (isMultiplayer) {
        if (e.code === 'ArrowUp' && p2.dy === -1) p2.dy = 0;
        if (e.code === 'ArrowDown' && p2.dy === 1) p2.dy = 0;
    }
});

restartBtn.addEventListener('click', () => {
    resetGame();
    startGame();
});

menuBtn.addEventListener('click', () => {
    resetGame();
    gameState = 'START';
    startScreen.classList.remove('hidden');
    gameOverlay.classList.add('hidden');
    draw();
});

function resetGame() {
    p1.score = 0;
    p2.score = 0;
    p1ScoreEl.innerText = 0;
    p2ScoreEl.innerText = 0;
    resetBall();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    // Random direction
    const dirX = Math.random() > 0.5 ? 1 : -1;
    const dirY = Math.random() > 0.5 ? 1 : -1;
    ball.speed = 7;
    ball.vx = ball.speed * dirX;
    ball.vy = ball.speed * dirY * 0.5; // Flatter launch
}

function startGame() {
    gameState = 'PLAYING';
    startScreen.classList.add('hidden');
    gameOverlay.classList.add('hidden');
    loops();
}

function update() {
    if (isPaused) return;

    // Move Paddles
    p1.y += p1.dy * p1.speed;

    if (isMultiplayer) {
        p2.y += p2.dy * p2.speed;
    } else {
        // AI Movement
        // Simple tracking
        const center = p2.y + PADDLE_HEIGHT / 2;
        if (center < ball.y - 10) {
            p2.y += aiSpeed;
        } else if (center > ball.y + 10) {
            p2.y -= aiSpeed;
        }
    }

    // Clamp Paddles
    p1.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, p1.y));
    p2.y = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, p2.y));

    // Move Ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall Collision (Top/Bottom)
    if (ball.y <= 0 || ball.y + BALL_SIZE >= canvas.height) {
        ball.vy *= -1;
        // Sound effect here
    }

    // Paddle Collision
    // P1
    if (ball.vx < 0 &&
        ball.x <= p1.x + PADDLE_WIDTH &&
        ball.x >= p1.x &&
        ball.y + BALL_SIZE >= p1.y &&
        ball.y <= p1.y + PADDLE_HEIGHT) {

        hitPaddle(p1);
    }

    // P2
    if (ball.vx > 0 &&
        ball.x + BALL_SIZE >= p2.x &&
        ball.x + BALL_SIZE <= p2.x + PADDLE_WIDTH &&
        ball.y + BALL_SIZE >= p2.y &&
        ball.y <= p2.y + PADDLE_HEIGHT) {

        hitPaddle(p2);
    }

    // Scoring
    if (ball.x < 0) {
        p2.score++;
        p2ScoreEl.innerText = p2.score;
        checkWin();
        if (gameState === 'PLAYING') resetBall();
    } else if (ball.x > canvas.width) {
        p1.score++;
        p1ScoreEl.innerText = p1.score;
        checkWin();
        if (gameState === 'PLAYING') resetBall();
    }
}

function hitPaddle(paddle) {
    // Reverse X
    ball.vx *= -1;

    // Increase Speed slightly
    ball.speed = Math.min(ball.speed + 0.5, 15);

    // Adjust Y velocity based on hit position
    const center = paddle.y + PADDLE_HEIGHT / 2;
    const hitY = (ball.y + BALL_SIZE / 2) - center;
    // Normalize -1 to 1
    const normalized = hitY / (PADDLE_HEIGHT / 2);

    ball.vy = normalized * 10; // Max vertical speed

    // Ensure X velocity matches speed but keeps sign
    const dirX = ball.vx > 0 ? 1 : -1;
    // We want total velocity vector magnitude to look like 'ball.speed' roughly,
    // but simplifying: just set X to fixed high speed is boring.
    // Let's standardise:
    // Simple arcade physics: X speed constant-ish, Y speed varies.
    // Actually, let's re-normalize vector to speed.
    const speed = ball.speed;
    const angle = Math.atan2(ball.vy, ball.vx);
    ball.vx = Math.cos(angle) * speed * (ball.vx > 0 ? 1 : -1);
    // Wait, cos(angle) already has sign.
    // Just re-calc components.
    // But we modified VY arbitrarily. 
    // Let's just set VX to ensure forward momentum.
    ball.vx = (speed * (ball.vx > 0 ? 1 : -1));

    // Push ball out to avoid sticking
    if (ball.vx > 0) ball.x = paddle.x + PADDLE_WIDTH + 1;
    else ball.x = paddle.x - BALL_SIZE - 1;
}

function checkWin() {
    if (p1.score >= WIN_SCORE || p2.score >= WIN_SCORE) {
        gameState = 'END';
        gameOverlay.classList.remove('hidden');
        if (p1.score > p2.score) {
            overlayTitle.innerText = "PLAYER 1 WINS!";
            overlayTitle.style.color = p1.color;
        } else {
            overlayTitle.innerText = isMultiplayer ? "PLAYER 2 WINS!" : "CPU WINS!";
            overlayTitle.style.color = p2.color;
        }
    }
}

function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Center Line
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.setLineDash([]); // Reset

    // Paddles
    ctx.fillStyle = p1.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = p1.color;
    ctx.fillRect(p1.x, p1.y, PADDLE_WIDTH, PADDLE_HEIGHT);

    ctx.fillStyle = p2.color;
    ctx.shadowColor = p2.color;
    ctx.fillRect(p2.x, p2.y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Ball
    ctx.fillStyle = '#ffff00';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffff00';
    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);

    ctx.shadowBlur = 0;

    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '30px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
}

function loops() {
    if (gameState === 'PLAYING') {
        update();
        draw();
        requestAnimationFrame(loops);
    }
}

// Initial draw
draw();

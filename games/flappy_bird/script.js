const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreElement = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const gameOverlay = document.getElementById('game-overlay');
const finalScore = document.getElementById('final-score');
const bestScoreEl = document.getElementById('best-score');
const medalEl = document.getElementById('medal');
const restartBtn = document.getElementById('restart-btn');

// Game Constants
const GRAVITY = 0.4; // Updated from 0.25 for better feel
const FLAP_STRENGTH = -7; // Updated from -4.5
const PIPE_SPEED = 2.5; // Updated from 2
const PIPE_SPAWN_RATE = 100; // Frames
const PIPE_WIDTH = 50;
const PIPE_GAP = 140; // Pixels

// Game State
const bird = {
    x: 50,
    y: 150,
    width: 30, // Visual width
    height: 30, // Visual height
    radius: 12, // Collision radius
    velocity: 0,
    rotation: 0
};
let pipes = [];
let frameCount = 0;
let score = 0;
let gameState = 'START'; // START, PLAYING, GAME_OVER
let isPaused = false;
let bestScore = localStorage.getItem('flappyBest') || 0;

// Initialize
function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    bird.rotation = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    isPaused = false;
    scoreElement.innerText = score;
    gameState = 'START';

    startScreen.classList.remove('hidden');
    gameOverlay.classList.add('hidden');

    // Draw initial frame
    draw();
}

function startGame() {
    gameState = 'PLAYING';
    startScreen.classList.add('hidden');
    loop();
}

function flap() {
    if (gameState === 'START') {
        startGame();
    }
    if (gameState === 'PLAYING') {
        bird.velocity = FLAP_STRENGTH;
    }
}

function update() {
    // Bird Physics
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    // Rotation based on velocity
    if (bird.velocity < 0) {
        bird.rotation = -25 * Math.PI / 180;
    } else {
        bird.rotation += 2 * Math.PI / 180;
        if (bird.rotation > 90 * Math.PI / 180) {
            bird.rotation = 90 * Math.PI / 180;
        }
    }

    // Floor/Ceiling Collision
    if (bird.y + bird.radius >= canvas.height || bird.y - bird.radius <= 0) {
        gameOver();
    }

    // Pipe Logic
    if (frameCount % PIPE_SPAWN_RATE === 0) {
        const minHeight = 50;
        const maxHeight = canvas.height - 50 - PIPE_GAP;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);

        pipes.push({
            x: canvas.width,
            topHeight: topHeight,
            passed: false
        });
    }

    for (let i = 0; i < pipes.length; i++) {
        const p = pipes[i];
        p.x -= PIPE_SPEED;

        // Collision
        // Pipe Box: x to x+PIPE_WIDTH
        // Top Pipe: 0 to topHeight
        // Bottom Pipe: topHeight + gap to height

        // Horizontal Check
        if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + PIPE_WIDTH) {
            // Vertical Check
            if ((bird.y - bird.radius < p.topHeight) ||
                (bird.y + bird.radius > p.topHeight + PIPE_GAP)) {
                gameOver();
            }
        }

        // Score
        if (p.x + PIPE_WIDTH < bird.x && !p.passed) {
            score++;
            scoreElement.innerText = score;
            p.passed = true;
        }

        // Remove off-screen
        if (p.x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
            i--;
        }
    }

    frameCount++;
}

function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height); // BG handled by CSS? No, canvas is transparent.
    // Actually, let's draw a background if needed, or rely on CSS gradient.
    // CSS gradient is fine, but we need to clear.

    // Draw Pipes
    ctx.fillStyle = '#00ff88';
    ctx.strokeStyle = '#004400';
    ctx.lineWidth = 2;

    pipes.forEach(p => {
        // Top Pipe
        ctx.fillRect(p.x, 0, PIPE_WIDTH, p.topHeight);
        ctx.strokeRect(p.x, 0, PIPE_WIDTH, p.topHeight);

        // Cap style
        ctx.fillRect(p.x - 2, p.topHeight - 20, PIPE_WIDTH + 4, 20);
        ctx.strokeRect(p.x - 2, p.topHeight - 20, PIPE_WIDTH + 4, 20);

        // Bottom Pipe
        const bottomPipeY = p.topHeight + PIPE_GAP;
        const bottomPipeHeight = canvas.height - bottomPipeY;
        ctx.fillRect(p.x, bottomPipeY, PIPE_WIDTH, bottomPipeHeight);
        ctx.strokeRect(p.x, bottomPipeY, PIPE_WIDTH, bottomPipeHeight);

        // Cap style
        ctx.fillRect(p.x - 2, bottomPipeY, PIPE_WIDTH + 4, 20);
        ctx.strokeRect(p.x - 2, bottomPipeY, PIPE_WIDTH + 4, 20);
    });

    // Draw Bird
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);

    ctx.beginPath();
    ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcc00';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffcc00';
    ctx.fill();
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(6, -4, 2, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.ellipse(-2, 2, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Ground scrolling effect (optional)
}

function loop() {
    if (gameState === 'PLAYING') {
        if (!isPaused) {
            update();
            draw();
        } else {
            // Draw Pause
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = '30px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
            requestAnimationFrame(loop);
            return;
        }
        requestAnimationFrame(loop);
    }
}

function gameOver() {
    gameState = 'GAME_OVER';

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('flappyBest', bestScore);
    }

    finalScore.innerText = score;
    bestScoreEl.innerText = bestScore;

    // Medal logic
    medalEl.classList.add('hidden');
    if (score >= 10) {
        medalEl.innerText = '🥉'; // Bronze
        medalEl.classList.remove('hidden');
    }
    if (score >= 20) {
        medalEl.innerText = '🥈'; // Silver
    }
    if (score >= 40) {
        medalEl.innerText = '🥇'; // Gold
    }
    if (score >= 100) {
        medalEl.innerText = '💎'; // Diamond
    }

    gameOverlay.classList.remove('hidden');
}

// Input
document.addEventListener('keydown', e => {
    if (e.code === 'Space') {
        if (isPaused) return; // Don't flap if paused
        flap();
        e.preventDefault();
    } else if (e.key === 'p' || e.key === 'P') {
        if (gameState === 'PLAYING') isPaused = !isPaused;
    }
});

canvas.addEventListener('click', (e) => {
    e.preventDefault();
    flap();
});

restartBtn.addEventListener('click', resetGame);

// Start
resetGame();
draw(); // Initial draw

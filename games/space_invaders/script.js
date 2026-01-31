const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const livesEl = document.getElementById('lives');
const startScreen = document.getElementById('start-screen');
const gameOverlay = document.getElementById('game-overlay');
const levelOverlay = document.getElementById('level-overlay');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const finalScoreEl = document.getElementById('final-score');

// Game Configuration
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const ENEMY_BULLET_SPEED = 4;
const ENEMY_PADDING = 10;
const ENEMY_WIDTH = 30;
const ENEMY_HEIGHT = 20;
const BASE_ENEMY_SPEED = 1;

// State
let score = 0;
let highScore = localStorage.getItem('invadersHighScore') || 0;
let lives = 3;
let level = 1;
let isGameOver = false;
let isPaused = true;

let player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 40,
    width: 40,
    height: 20,
    color: '#00d4ff',
    bullets: [],
    cooldown: 0
};

let enemies = [];
let enemyBullets = [];
let enemyDirection = 1; // 1 = right, -1 = left
let enemySpeed = BASE_ENEMY_SPEED;
let enemyDrop = false;

let particles = [];

// Init
highScoreEl.innerText = highScore;

function initGame() {
    score = 0;
    lives = 3;
    level = 1;
    isGameOver = false;
    isPaused = false;

    scoreEl.innerText = score;
    livesEl.innerText = lives;

    resetLevel();

    startScreen.classList.add('hidden');
    gameOverlay.classList.add('hidden');

    requestAnimationFrame(loop);
}

function resetLevel() {
    player.bullets = [];
    enemyBullets = [];
    enemies = [];
    particles = [];
    enemySpeed = BASE_ENEMY_SPEED + (level * 0.2); // Increase speed per level

    // Create Grid
    const rows = 4 + Math.min(level, 3); // Max 7 rows
    const cols = 8;

    const startX = 50;
    const startY = 50;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            enemies.push({
                x: startX + c * (ENEMY_WIDTH + ENEMY_PADDING),
                y: startY + r * (ENEMY_HEIGHT + ENEMY_PADDING),
                width: ENEMY_WIDTH,
                height: ENEMY_HEIGHT,
                type: r === 0 ? 'top' : (r < 3 ? 'mid' : 'bot'),
                value: (rows - r) * 10
            });
        }
    }
}

// Input Handling
const keys = {};
document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.key === 'p' || e.key === 'P') {
        if (!isGameOver && !startScreen.classList.contains('hidden') === false) { // distinct from Start Screen
            isPaused = !isPaused;
        }
    }
});
document.addEventListener('keyup', e => keys[e.code] = false);

function update() {
    if (isPaused || isGameOver) return;

    // Player Move
    if ((keys['ArrowLeft'] || keys['KeyA']) && player.x > 0) {
        player.x -= PLAYER_SPEED;
    }
    if ((keys['ArrowRight'] || keys['KeyD']) && player.x < canvas.width - player.width) {
        player.x += PLAYER_SPEED;
    }

    // Player Shoot
    if (keys['Space'] && player.cooldown <= 0) {
        player.bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10
        });
        player.cooldown = 20; // Frames
    }
    if (player.cooldown > 0) player.cooldown--;

    // Update Bullets
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        let b = player.bullets[i];
        b.y -= BULLET_SPEED;

        if (b.y < 0) {
            player.bullets.splice(i, 1);
            continue;
        }

        // Enemy Collision
        for (let j = enemies.length - 1; j >= 0; j--) {
            let e = enemies[j];
            if (b.x < e.x + e.width &&
                b.x + b.width > e.x &&
                b.y < e.y + e.height &&
                b.y + b.height > e.y) {

                // Hit
                createParticles(e.x + e.width / 2, e.y + e.height / 2, '#ff0055');
                score += e.value;
                scoreEl.innerText = score;
                enemies.splice(j, 1);
                player.bullets.splice(i, 1);

                // Increase speed slightly per kill
                enemySpeed += 0.02;

                break; // Bullet destroyed
            }
        }
    }

    // Update Enemies
    let moveDown = false;
    // Check edges
    for (let e of enemies) {
        if (e.x + e.width > canvas.width && enemyDirection === 1) {
            moveDown = true;
        } else if (e.x < 0 && enemyDirection === -1) {
            moveDown = true;
        }
    }

    if (moveDown) {
        enemyDirection *= -1;
        for (let e of enemies) {
            e.y += 20; // Drop amount
            if (e.y + e.height >= player.y) {
                gameOver(); // Invasion successful
            }
        }
    } else {
        for (let e of enemies) {
            e.x += enemySpeed * enemyDirection;

            // Random Shooting
            if (Math.random() < 0.0005 * level + 0.0001) { // Chance increases slightly
                enemyBullets.push({
                    x: e.x + e.width / 2,
                    y: e.y + e.height,
                    width: 4,
                    height: 10
                });
            }
        }
    }

    // Level Clear
    if (enemies.length === 0) {
        level++;
        levelOverlay.classList.remove('hidden');
        isPaused = true;
        setTimeout(() => {
            levelOverlay.classList.add('hidden');
            resetLevel();
            isPaused = false;
            player.bullets = []; // Clear old bullets
        }, 2000);
    }

    // Update Enemy Bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let b = enemyBullets[i];
        b.y += ENEMY_BULLET_SPEED;

        if (b.y > canvas.height) {
            enemyBullets.splice(i, 1);
            continue;
        }

        // Player Collision
        if (b.x < player.x + player.width &&
            b.x + b.width > player.x &&
            b.y < player.y + player.height &&
            b.y + b.height > player.y) {

            createParticles(player.x + player.width / 2, player.y + player.height / 2, '#00d4ff');
            lives--;
            livesEl.innerText = lives;
            enemyBullets.splice(i, 1);

            if (lives <= 0) {
                gameOver();
            }
        }
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = player.color;
    // Simple ship shape
    ctx.fillRect(player.x, player.y + 10, player.width, 10); // Base
    ctx.fillRect(player.x + 15, player.y, 10, 10); // Turret
    ctx.shadowBlur = 0;

    // Draw Enemies
    ctx.fillStyle = '#ff0055';
    // ctx.shadowBlur = 5;
    // ctx.shadowColor = '#ff0055'; // Performance cost?
    for (let e of enemies) {
        // Simple alien shape
        ctx.fillRect(e.x, e.y, e.width, e.height);
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(e.x + 5, e.y + 5, 5, 5);
        ctx.fillRect(e.x + 20, e.y + 5, 5, 5);
        ctx.fillStyle = '#ff0055';
    }
    ctx.shadowBlur = 0;

    // Draw Player Bullets
    ctx.fillStyle = '#ffff00';
    for (let b of player.bullets) {
        ctx.fillRect(b.x, b.y, b.width, b.height);
    }

    // Draw Enemy Bullets
    ctx.fillStyle = '#ffffff';
    for (let b of enemyBullets) {
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - 3, b.y - 5);
        ctx.lineTo(b.x + 3, b.y - 5);
        ctx.fill();
        // Zigzag visual
    }

    // Draw Particles
    for (let p of particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 20;
        ctx.fillRect(p.x, p.y, 3, 3);
    }
    ctx.globalAlpha = 1;
}

function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 20,
            color: color
        });
    }
}

function gameOver() {
    isGameOver = true;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('invadersHighScore', highScore);
        highScoreEl.innerText = highScore;
    }
    finalScoreEl.innerText = score;
    gameOverlay.classList.remove('hidden');
}

function loop() {
    if (isPaused && !levelOverlay.classList.contains('hidden')) {
        // Level transition pause, do nothing (draw is static)
    } else if (isPaused) {
        // Manual Pause
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '30px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        requestAnimationFrame(loop);
        return;
    }

    update();
    draw();
    requestAnimationFrame(loop);
}

startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);

// Initial Draw
draw();

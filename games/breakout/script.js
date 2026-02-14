// Three.js Breakout 3D
const canvas = document.getElementById('gameCanvas');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const levelEl = document.getElementById('level');
const startOverlay = document.getElementById('start-overlay');
const pauseOverlay = document.getElementById('pause-overlay');
const gameOverScreen = document.getElementById('game-over');
const gameOverText = document.getElementById('gameOverText');
const finalScoreEl = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const resumeBtn = document.getElementById('resumeBtn');
const restartBtn = document.getElementById('restartBtn');

// Game settings
const WIDTH = 800;
const HEIGHT = 550;
const ARENA_WIDTH = 16;
const ARENA_HEIGHT = 12;
const PADDLE_WIDTH = 3;
const PADDLE_HEIGHT = 0.4;
const BALL_RADIUS = 0.3;
const BRICK_ROWS = 5;
const BRICK_COLS = 10;
const BRICK_WIDTH = 1.4;
const BRICK_HEIGHT = 0.5;
const BRICK_DEPTH = 0.5;

// State
let isPlaying = false;
let isPaused = false;
let ballLaunched = false;
let score = 0;
let lives = 3;
let level = 1;
let bricks = [];
let particles = [];
let ballVelocity = { x: 0, y: 0 };

// Three.js setup
const scene = NeonMaterials.createScene();
const camera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 0.1, 100);
camera.position.set(0, 8, 16);
camera.lookAt(0, 0, 0);

const renderer = NeonMaterials.createRenderer(canvas);
renderer.setSize(WIDTH, HEIGHT);

// Lighting
NeonMaterials.setupLighting(scene);

// Arena walls
const wallMat = new THREE.MeshStandardMaterial({
    color: 0x222233,
    metalness: 0.8,
    roughness: 0.3
});

// Left wall
const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, ARENA_HEIGHT, 1),
    wallMat
);
leftWall.position.set(-ARENA_WIDTH / 2 - 0.15, 0, 0);
scene.add(leftWall);

// Right wall
const rightWall = leftWall.clone();
rightWall.position.set(ARENA_WIDTH / 2 + 0.15, 0, 0);
scene.add(rightWall);

// Top wall
const topWall = new THREE.Mesh(
    new THREE.BoxGeometry(ARENA_WIDTH + 0.6, 0.3, 1),
    wallMat
);
topWall.position.set(0, ARENA_HEIGHT / 2 + 0.15, 0);
scene.add(topWall);

// Floor (for visual)
const floorGeom = new THREE.PlaneGeometry(ARENA_WIDTH + 1, ARENA_HEIGHT + 2);
const floorMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a12,
    metalness: 0.9,
    roughness: 0.2
});
const floor = new THREE.Mesh(floorGeom, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.5;
scene.add(floor);

// Grid on floor
const grid = new THREE.GridHelper(ARENA_WIDTH, 16, 0x222233, 0x111122);
grid.rotation.z = Math.PI / 2;
grid.position.y = -0.49;
scene.add(grid);

// Paddle
const paddleGeom = new THREE.BoxGeometry(PADDLE_WIDTH, PADDLE_HEIGHT, 0.8);
const paddleMat = NeonMaterials.glow(NeonMaterials.colors.cyan);
const paddle = new THREE.Mesh(paddleGeom, paddleMat);
paddle.position.set(0, -ARENA_HEIGHT / 2 + 1, 0);
scene.add(paddle);

const paddleLight = new THREE.PointLight(0x00d4ff, 0.5, 5);
paddle.add(paddleLight);

// Ball
const ballGeom = new THREE.SphereGeometry(BALL_RADIUS, 16, 16);
const ballMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const ball = new THREE.Mesh(ballGeom, ballMat);
scene.add(ball);

const ballLight = new THREE.PointLight(0xffffff, 1, 5);
ball.add(ballLight);

// Ball trail
const trailParticles = [];

// Brick colors by row
const BRICK_COLORS = [
    0xff0066, // Pink
    0xff6600, // Orange
    0xffcc00, // Yellow
    0x00ff88, // Green
    0x00d4ff  // Cyan
];

function createBricks() {
    bricks.forEach(b => scene.remove(b));
    bricks = [];

    const startY = ARENA_HEIGHT / 2 - 2;
    const startX = -((BRICK_COLS - 1) * (BRICK_WIDTH + 0.1)) / 2;

    for (let row = 0; row < BRICK_ROWS; row++) {
        const color = BRICK_COLORS[row % BRICK_COLORS.length];
        const geom = new THREE.BoxGeometry(BRICK_WIDTH, BRICK_HEIGHT, BRICK_DEPTH);
        const mat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.3,
            metalness: 0.5,
            roughness: 0.3
        });

        for (let col = 0; col < BRICK_COLS; col++) {
            const brick = new THREE.Mesh(geom, mat.clone());
            brick.position.set(
                startX + col * (BRICK_WIDTH + 0.1),
                startY - row * (BRICK_HEIGHT + 0.1),
                0
            );
            brick.userData = { points: (BRICK_ROWS - row) * 10, color };
            scene.add(brick);
            bricks.push(brick);
        }
    }
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) {
        const geom = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true });
        const particle = new THREE.Mesh(geom, mat);
        particle.position.set(x, y, 0);
        particle.userData = {
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            vz: Math.random() * 0.1,
            life: 25
        };
        scene.add(particle);
        particles.push(particle);
    }
}

function resetBall() {
    ball.position.set(paddle.position.x, paddle.position.y + 0.5, 0);
    ballVelocity = { x: 0, y: 0 };
    ballLaunched = false;
}

function launchBall() {
    if (ballLaunched) return;
    ballLaunched = true;
    const speed = 0.15 + level * 0.01;
    const angle = (Math.random() - 0.5) * Math.PI / 3 + Math.PI / 2;
    ballVelocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
    };
}

// Input
const keys = {};
let mouseX = 0;

document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyP' && isPlaying) togglePause();
    if (e.code === 'Space') { e.preventDefault(); launchBall(); }
});
document.addEventListener('keyup', e => keys[e.code] = false);

canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / WIDTH - 0.5) * ARENA_WIDTH;
});

canvas.addEventListener('click', launchBall);

function togglePause() {
    isPaused = !isPaused;
    pauseOverlay.classList.toggle('hidden', !isPaused);
}

function init() {
    score = 0;
    lives = 3;
    level = 1;

    scoreEl.textContent = score;
    livesEl.textContent = '♥'.repeat(lives);
    levelEl.textContent = level;

    particles.forEach(p => scene.remove(p));
    particles = [];
    trailParticles.forEach(p => scene.remove(p));
    trailParticles.length = 0;

    paddle.position.x = 0;
    createBricks();
    resetBall();

    isPlaying = true;
    isPaused = false;
    startOverlay.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
}

function update() {
    if (!isPlaying || isPaused) return;

    // Paddle movement
    const paddleSpeed = 0.25;
    if (keys['ArrowLeft'] || keys['KeyA']) {
        paddle.position.x -= paddleSpeed;
    } else if (keys['ArrowRight'] || keys['KeyD']) {
        paddle.position.x += paddleSpeed;
    } else {
        // Mouse control
        paddle.position.x += (mouseX - paddle.position.x) * 0.1;
    }
    paddle.position.x = Math.max(-ARENA_WIDTH / 2 + PADDLE_WIDTH / 2,
        Math.min(ARENA_WIDTH / 2 - PADDLE_WIDTH / 2, paddle.position.x));

    // Ball follows paddle if not launched
    if (!ballLaunched) {
        ball.position.x = paddle.position.x;
        ball.position.y = paddle.position.y + 0.5;
        return;
    }

    // Ball movement
    ball.position.x += ballVelocity.x;
    ball.position.y += ballVelocity.y;

    // Wall collisions
    if (ball.position.x <= -ARENA_WIDTH / 2 + BALL_RADIUS ||
        ball.position.x >= ARENA_WIDTH / 2 - BALL_RADIUS) {
        ballVelocity.x *= -1;
        ball.position.x = Math.max(-ARENA_WIDTH / 2 + BALL_RADIUS,
            Math.min(ARENA_WIDTH / 2 - BALL_RADIUS, ball.position.x));
    }

    if (ball.position.y >= ARENA_HEIGHT / 2 - BALL_RADIUS) {
        ballVelocity.y *= -1;
        ball.position.y = ARENA_HEIGHT / 2 - BALL_RADIUS;
    }

    // Paddle collision
    if (ball.position.y <= paddle.position.y + PADDLE_HEIGHT / 2 + BALL_RADIUS &&
        ball.position.y >= paddle.position.y - PADDLE_HEIGHT / 2 &&
        Math.abs(ball.position.x - paddle.position.x) < PADDLE_WIDTH / 2 + BALL_RADIUS) {

        ballVelocity.y = Math.abs(ballVelocity.y);

        // Angle based on hit position
        const hitPos = (ball.position.x - paddle.position.x) / (PADDLE_WIDTH / 2);
        ballVelocity.x = hitPos * 0.15;

        ball.position.y = paddle.position.y + PADDLE_HEIGHT / 2 + BALL_RADIUS;
    }

    // Ball lost
    if (ball.position.y < -ARENA_HEIGHT / 2 - 1) {
        lives--;
        livesEl.textContent = '♥'.repeat(Math.max(0, lives));

        if (lives <= 0) {
            gameOver(false);
        } else {
            resetBall();
        }
    }

    // Brick collisions
    for (let i = bricks.length - 1; i >= 0; i--) {
        const brick = bricks[i];
        const dx = Math.abs(ball.position.x - brick.position.x);
        const dy = Math.abs(ball.position.y - brick.position.y);

        if (dx < BRICK_WIDTH / 2 + BALL_RADIUS && dy < BRICK_HEIGHT / 2 + BALL_RADIUS) {
            // Determine collision side
            if (dx > dy) {
                ballVelocity.x *= -1;
            } else {
                ballVelocity.y *= -1;
            }

            createExplosion(brick.position.x, brick.position.y, brick.userData.color);
            score += brick.userData.points;
            scoreEl.textContent = score;

            scene.remove(brick);
            bricks.splice(i, 1);
            break;
        }
    }

    // Level complete
    if (bricks.length === 0) {
        level++;
        levelEl.textContent = level;
        createBricks();
        resetBall();
    }

    // Ball trail
    if (ballLaunched) {
        const trail = new THREE.Mesh(
            new THREE.SphereGeometry(BALL_RADIUS * 0.5, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
        );
        trail.position.copy(ball.position);
        trail.userData.life = 10;
        scene.add(trail);
        trailParticles.push(trail);
    }

    // Update trail
    for (let i = trailParticles.length - 1; i >= 0; i--) {
        const p = trailParticles[i];
        p.userData.life--;
        p.material.opacity = p.userData.life / 10 * 0.5;
        p.scale.multiplyScalar(0.95);

        if (p.userData.life <= 0) {
            scene.remove(p);
            trailParticles.splice(i, 1);
        }
    }

    // Update explosion particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.position.x += p.userData.vx;
        p.position.y += p.userData.vy;
        p.position.z += p.userData.vz;
        p.rotation.x += 0.1;
        p.rotation.y += 0.1;
        p.userData.life--;
        p.material.opacity = p.userData.life / 25;

        if (p.userData.life <= 0) {
            scene.remove(p);
            particles.splice(i, 1);
        }
    }
}

function gameOver(won) {
    isPlaying = false;
    gameOverText.textContent = won ? 'YOU WIN!' : 'GAME OVER';
    gameOverText.style.color = won ? '#00ff88' : '#ff0066';
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

function animate() {
    requestAnimationFrame(animate);
    update();

    // Subtle camera movement
    camera.position.x = Math.sin(Date.now() * 0.0005) * 0.5;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

// Event handlers
startBtn.addEventListener('click', init);
resumeBtn.addEventListener('click', () => { isPaused = false; pauseOverlay.classList.add('hidden'); });
restartBtn.addEventListener('click', init);

animate();

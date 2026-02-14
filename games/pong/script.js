// Three.js Pong 3D
const canvas = document.getElementById('gameCanvas');
const score1El = document.getElementById('score1');
const score2El = document.getElementById('score2');
const startOverlay = document.getElementById('start-overlay');
const pauseOverlay = document.getElementById('pause-overlay');
const winOverlay = document.getElementById('win-overlay');
const winText = document.getElementById('winText');
const startBtn = document.getElementById('startBtn');
const resumeBtn = document.getElementById('resumeBtn');
const restartBtn = document.getElementById('restartBtn');

// Game settings
const WIDTH = 800;
const HEIGHT = 500;
const ARENA_WIDTH = 20;
const ARENA_DEPTH = 12;
const PADDLE_WIDTH = 0.5;
const PADDLE_HEIGHT = 2.5;
const PADDLE_DEPTH = 0.5;
const BALL_RADIUS = 0.3;
const WIN_SCORE = 5;

// State
let score1 = 0, score2 = 0;
let isPaused = true;
let isGameOver = false;
let ballSpeed = 0.15;
const ballVelocity = { x: ballSpeed, z: ballSpeed };

// Three.js setup
const scene = NeonMaterials.createScene();
const camera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 0.1, 1000);
camera.position.set(0, 15, 18);
camera.lookAt(0, 0, 0);

const renderer = NeonMaterials.createRenderer(canvas);
renderer.setSize(WIDTH, HEIGHT);

// Lighting
NeonMaterials.setupLighting(scene);

// Arena floor
const floorGeom = new THREE.PlaneGeometry(ARENA_WIDTH + 2, ARENA_DEPTH + 2);
const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    metalness: 0.8,
    roughness: 0.3
});
const floor = new THREE.Mesh(floorGeom, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.5;
scene.add(floor);

// Grid
const grid = new THREE.GridHelper(ARENA_WIDTH, 20, 0x333344, 0x222233);
grid.position.y = -0.49;
scene.add(grid);

// Center line
const centerLineGeom = new THREE.BoxGeometry(0.1, 0.1, ARENA_DEPTH);
const centerLineMat = new THREE.MeshBasicMaterial({ color: 0x444455 });
const centerLine = new THREE.Mesh(centerLineGeom, centerLineMat);
centerLine.position.y = -0.4;
scene.add(centerLine);

// Walls (top & bottom)
const wallGeom = new THREE.BoxGeometry(ARENA_WIDTH + 2, 0.5, 0.3);
const wallMat = NeonMaterials.glow(NeonMaterials.colors.green);
const topWall = new THREE.Mesh(wallGeom, wallMat);
topWall.position.set(0, 0, -ARENA_DEPTH / 2 - 0.15);
scene.add(topWall);

const bottomWall = new THREE.Mesh(wallGeom, wallMat);
bottomWall.position.set(0, 0, ARENA_DEPTH / 2 + 0.15);
scene.add(bottomWall);

// Paddles
const paddleGeom = new THREE.BoxGeometry(PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_DEPTH);
const paddle1Mat = NeonMaterials.glow(NeonMaterials.colors.cyan);
const paddle2Mat = NeonMaterials.glow(NeonMaterials.colors.pink);

const paddle1 = new THREE.Mesh(paddleGeom, paddle1Mat);
paddle1.position.set(-ARENA_WIDTH / 2 + 1, PADDLE_HEIGHT / 2 - 0.5, 0);
scene.add(paddle1);

const paddle2 = new THREE.Mesh(paddleGeom, paddle2Mat);
paddle2.position.set(ARENA_WIDTH / 2 - 1, PADDLE_HEIGHT / 2 - 0.5, 0);
scene.add(paddle2);

// Ball
const ballGeom = new THREE.SphereGeometry(BALL_RADIUS, 16, 16);
const ballMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const ball = new THREE.Mesh(ballGeom, ballMat);
ball.position.set(0, BALL_RADIUS, 0);
scene.add(ball);

// Ball glow
const glowGeom = new THREE.SphereGeometry(BALL_RADIUS * 1.5, 16, 16);
const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2
});
const ballGlow = new THREE.Mesh(glowGeom, glowMat);
ball.add(ballGlow);

// Point light attached to ball
const ballLight = new THREE.PointLight(0xffffff, 1, 8);
ball.add(ballLight);

// Input
const keys = {};
document.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'p' && !isGameOver) togglePause();
});
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function togglePause() {
    isPaused = !isPaused;
    pauseOverlay.classList.toggle('hidden', !isPaused);
}

// Game logic
function resetBall(direction = 1) {
    ball.position.set(0, BALL_RADIUS, 0);
    ballSpeed = 0.15;
    const angle = (Math.random() - 0.5) * Math.PI / 3;
    ballVelocity.x = Math.cos(angle) * ballSpeed * direction;
    ballVelocity.z = Math.sin(angle) * ballSpeed;
}

function updatePaddles() {
    // Player 1
    if ((keys['w'] || keys['arrowup']) && paddle1.position.z > -ARENA_DEPTH / 2 + PADDLE_DEPTH) {
        paddle1.position.z -= 0.2;
    }
    if ((keys['s'] || keys['arrowdown']) && paddle1.position.z < ARENA_DEPTH / 2 - PADDLE_DEPTH) {
        paddle1.position.z += 0.2;
    }

    // AI for Player 2
    const aiSpeed = 0.12;
    const targetZ = ball.position.z;
    if (paddle2.position.z < targetZ - 0.5) {
        paddle2.position.z += aiSpeed;
    } else if (paddle2.position.z > targetZ + 0.5) {
        paddle2.position.z -= aiSpeed;
    }
    paddle2.position.z = Math.max(-ARENA_DEPTH / 2 + PADDLE_DEPTH,
        Math.min(ARENA_DEPTH / 2 - PADDLE_DEPTH, paddle2.position.z));
}

function updateBall() {
    ball.position.x += ballVelocity.x;
    ball.position.z += ballVelocity.z;

    // Top/bottom wall collision
    if (ball.position.z <= -ARENA_DEPTH / 2 + BALL_RADIUS ||
        ball.position.z >= ARENA_DEPTH / 2 - BALL_RADIUS) {
        ballVelocity.z *= -1;
    }

    // Paddle collision
    // Paddle 1
    if (ball.position.x <= paddle1.position.x + PADDLE_WIDTH / 2 + BALL_RADIUS &&
        ball.position.x >= paddle1.position.x - PADDLE_WIDTH / 2 &&
        Math.abs(ball.position.z - paddle1.position.z) < PADDLE_HEIGHT / 2 + BALL_RADIUS) {
        ballVelocity.x = Math.abs(ballVelocity.x) * 1.05;
        ballSpeed *= 1.02;
        ball.position.x = paddle1.position.x + PADDLE_WIDTH / 2 + BALL_RADIUS;

        // Angle based on hit position
        const hitPos = (ball.position.z - paddle1.position.z) / (PADDLE_HEIGHT / 2);
        ballVelocity.z = hitPos * ballSpeed * 0.8;
    }

    // Paddle 2
    if (ball.position.x >= paddle2.position.x - PADDLE_WIDTH / 2 - BALL_RADIUS &&
        ball.position.x <= paddle2.position.x + PADDLE_WIDTH / 2 &&
        Math.abs(ball.position.z - paddle2.position.z) < PADDLE_HEIGHT / 2 + BALL_RADIUS) {
        ballVelocity.x = -Math.abs(ballVelocity.x) * 1.05;
        ballSpeed *= 1.02;
        ball.position.x = paddle2.position.x - PADDLE_WIDTH / 2 - BALL_RADIUS;

        const hitPos = (ball.position.z - paddle2.position.z) / (PADDLE_HEIGHT / 2);
        ballVelocity.z = hitPos * ballSpeed * 0.8;
    }

    // Scoring
    if (ball.position.x < -ARENA_WIDTH / 2 - 1) {
        score2++;
        score2El.textContent = score2;
        checkWin();
        resetBall(1);
    }
    if (ball.position.x > ARENA_WIDTH / 2 + 1) {
        score1++;
        score1El.textContent = score1;
        checkWin();
        resetBall(-1);
    }
}

function checkWin() {
    if (score1 >= WIN_SCORE) {
        isGameOver = true;
        winText.textContent = 'PLAYER 1 WINS!';
        winText.style.color = '#00d4ff';
        winOverlay.classList.remove('hidden');
    } else if (score2 >= WIN_SCORE) {
        isGameOver = true;
        winText.textContent = 'CPU WINS!';
        winText.style.color = '#ff0066';
        winOverlay.classList.remove('hidden');
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (!isPaused && !isGameOver) {
        updatePaddles();
        updateBall();
    }

    // Subtle camera movement
    camera.position.x = Math.sin(Date.now() * 0.0005) * 0.5;

    renderer.render(scene, camera);
}

// Event handlers
startBtn.addEventListener('click', () => {
    startOverlay.classList.add('hidden');
    isPaused = false;
    resetBall(Math.random() > 0.5 ? 1 : -1);
});

resumeBtn.addEventListener('click', () => {
    isPaused = false;
    pauseOverlay.classList.add('hidden');
});

restartBtn.addEventListener('click', () => {
    score1 = score2 = 0;
    score1El.textContent = score2El.textContent = '0';
    isGameOver = false;
    winOverlay.classList.add('hidden');
    resetBall(Math.random() > 0.5 ? 1 : -1);
});

// Start
animate();

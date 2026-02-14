// Three.js Runner 3D - Ultimate Edition
// Features: Coins, Power-ups, Characters, Obstacles, Achievements

const canvas = document.getElementById('gameCanvas');
const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const bestEl = document.getElementById('best');
const distanceEl = document.getElementById('distance');
const bestDistanceEl = document.getElementById('bestDistance');
const totalCoinsEl = document.getElementById('totalCoins');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const finalScoreEl = document.getElementById('finalScore');
const finalDistanceEl = document.getElementById('finalDistance');
const finalCoinsEl = document.getElementById('finalCoins');
const newRecordEl = document.getElementById('newRecord');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const powerUpIndicator = document.getElementById('powerUpIndicator');
const powerUpIcon = document.getElementById('powerUpIcon');
const powerUpName = document.getElementById('powerUpName');
const powerUpProgress = document.getElementById('powerUpProgress');
const floatingMessage = document.getElementById('floatingMessage');
const charBtns = document.querySelectorAll('.char-btn');

// Game settings
const WIDTH = 900;
const HEIGHT = 500;
const LANE_WIDTH = 3;
const LANES = [-LANE_WIDTH, 0, LANE_WIDTH];
const GROUND_Y = 0;
const JUMP_FORCE = 0.38;
const GRAVITY = 0.016;

// Characters
const CHARACTERS = {
    runner: { name: 'Runner', color: 0x00d4ff, jumpMulti: 1, laneSpeed: 1, jumps: 2, startShield: false },
    speeder: { name: 'Speeder', color: 0x00ff88, jumpMulti: 1, laneSpeed: 1.8, jumps: 2, startShield: false },
    jumper: { name: 'Jumper', color: 0xaa00ff, jumpMulti: 1.15, laneSpeed: 1, jumps: 3, startShield: false },
    tank: { name: 'Tank', color: 0xff6600, jumpMulti: 0.95, laneSpeed: 0.8, jumps: 2, startShield: true }
};

// Power-up types
const POWERUPS = {
    magnet: { icon: '🧲', name: 'MAGNET', duration: 300, color: 0xffff00 },
    shield: { icon: '🛡️', name: 'SHIELD', duration: 400, color: 0x00ff88 },
    speedBoost: { icon: '⚡', name: 'SPEED BOOST', duration: 180, color: 0xff6600 },
    slowMo: { icon: '⏱️', name: 'SLOW MOTION', duration: 250, color: 0xaaaaff },
    superJump: { icon: '🦘', name: 'SUPER JUMP', duration: 300, color: 0xff00ff },
    coinFrenzy: { icon: '💰', name: 'COIN FRENZY', duration: 300, color: 0xffcc00 },
    jetpack: { icon: '🚀', name: 'JETPACK', duration: 240, color: 0x00ffaa }
};

// State
let characterType = 'runner';
let isPlaying = false;
let score = 0;
let coins = 0;
let distance = 0;
let best = parseInt(localStorage.getItem('runner3dBest')) || 0;
let bestDist = parseInt(localStorage.getItem('runner3dBestDist')) || 0;
let totalCoinsCollected = parseInt(localStorage.getItem('runner3dCoins')) || 0;
let gameSpeed = 0.32;
let playerVelocityY = 0;
let jumpsRemaining = 2;
let targetLane = 0;
let obstacles = [];
let groundTiles = [];
let buildings = [];
let coinObjects = [];
let powerUpObjects = [];
let trailParticles = [];

// Power-up state
let activePowerUp = null;
let powerUpTimer = 0;
let hasShield = false;

// Audio
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let isMuted = false;

function initAudio() {
    if (!audioCtx) audioCtx = new AudioContext();
}

function playSound(type) {
    if (isMuted || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    switch (type) {
        case 'coin':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, audioCtx.currentTime);
            osc.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.start(); osc.stop(audioCtx.currentTime + 0.1);
            break;
        case 'powerup':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            osc.start(); osc.stop(audioCtx.currentTime + 0.15);
            break;
        case 'jump':
            osc.type = 'square';
            osc.frequency.setValueAtTime(200, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.start(); osc.stop(audioCtx.currentTime + 0.1);
            break;
        case 'hit':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            osc.start(); osc.stop(audioCtx.currentTime + 0.2);
            break;
    }
}

// Update stats display
bestEl.textContent = best;
bestDistanceEl.textContent = bestDist + 'm';
totalCoinsEl.textContent = totalCoinsCollected;

// Three.js setup
const scene = NeonMaterials.createScene();
scene.fog = new THREE.Fog(0x0a0a12, 20, 80);

const camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 0.1, 200);
camera.position.set(0, 4, 10);
camera.lookAt(0, 1, -20);

const renderer = NeonMaterials.createRenderer(canvas);
renderer.setSize(WIDTH, HEIGHT);

// Lighting
const ambientLight = new THREE.AmbientLight(0x222244, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 10);
scene.add(directionalLight);

// Ground tiles
const groundGeom = new THREE.PlaneGeometry(30, 20);
const groundMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    metalness: 0.8,
    roughness: 0.3
});

function createGroundTile(z) {
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, GROUND_Y, z);
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(20, 20, 0x00ff88, 0x0a3320);
    gridHelper.position.set(0, GROUND_Y + 0.01, z);
    scene.add(gridHelper);

    return { ground, grid: gridHelper, z };
}

// Player
let player = null;
let playerLight = null;
let shieldBubble = null;
let magnetField = null;

function createPlayer() {
    if (player) scene.remove(player);

    const charData = CHARACTERS[characterType];
    const playerGeom = new THREE.BoxGeometry(1.2, 1.8, 1.2);
    const playerMat = NeonMaterials.glow(charData.color);
    player = new THREE.Mesh(playerGeom, playerMat);
    player.position.set(0, 1, 5);
    scene.add(player);

    playerLight = new THREE.PointLight(charData.color, 1, 8);
    player.add(playerLight);

    // Shield bubble
    const shieldGeom = new THREE.SphereGeometry(1.5, 16, 16);
    const shieldMat = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    shieldBubble = new THREE.Mesh(shieldGeom, shieldMat);
    shieldBubble.visible = false;
    player.add(shieldBubble);

    // Magnet field
    const magnetGeom = new THREE.RingGeometry(2.5, 2.8, 32);
    const magnetMat = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    magnetField = new THREE.Mesh(magnetGeom, magnetMat);
    magnetField.rotation.x = Math.PI / 2;
    magnetField.visible = false;
    player.add(magnetField);
}

// Buildings
function createBuilding(x, z) {
    const width = 3 + Math.random() * 4;
    const height = 8 + Math.random() * 20;
    const depth = 3 + Math.random() * 4;

    const geom = new THREE.BoxGeometry(width, height, depth);
    const mat = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        emissive: 0x0a0a12,
        metalness: 0.5,
        roughness: 0.5
    });

    const building = new THREE.Mesh(geom, mat);
    building.position.set(x, height / 2, z);
    scene.add(building);

    // Windows
    const windowRows = Math.floor(height / 2);
    const windowMat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0x00d4ff : 0xff0066
    });

    for (let i = 0; i < windowRows; i++) {
        if (Math.random() > 0.3) {
            const windowGeom = new THREE.BoxGeometry(0.4, 0.6, 0.1);
            const windowMesh = new THREE.Mesh(windowGeom, windowMat.clone());
            windowMesh.position.set(
                (Math.random() - 0.5) * (width - 1),
                -height / 2 + 1 + i * 2,
                depth / 2 + 0.1
            );
            building.add(windowMesh);
        }
    }

    return building;
}

// Coins
function createCoin(x, y, z) {
    const geom = new THREE.TorusGeometry(0.4, 0.15, 8, 16);
    const mat = new THREE.MeshStandardMaterial({
        color: 0xffcc00,
        emissive: 0xffcc00,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2
    });
    const coin = new THREE.Mesh(geom, mat);
    coin.position.set(x, y, z);
    coin.rotation.x = Math.PI / 2;

    const light = new THREE.PointLight(0xffcc00, 0.3, 3);
    coin.add(light);

    scene.add(coin);
    return { mesh: coin, x, y, z };
}

// Power-up objects
function createPowerUpObject(x, z) {
    const types = Object.keys(POWERUPS);
    const type = types[Math.floor(Math.random() * types.length)];
    const data = POWERUPS[type];

    const geom = new THREE.OctahedronGeometry(0.5);
    const mat = new THREE.MeshStandardMaterial({
        color: data.color,
        emissive: data.color,
        emissiveIntensity: 0.5,
        metalness: 0.6,
        roughness: 0.3
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, 1.5, z);

    const light = new THREE.PointLight(data.color, 0.6, 5);
    mesh.add(light);

    scene.add(mesh);
    return { mesh, type, z };
}

// Obstacles
function createObstacle(z) {
    const lane = LANES[Math.floor(Math.random() * LANES.length)];
    const type = Math.random();

    let mesh, height, moving = false, movingDir = 0;

    if (type < 0.35) {
        // Spike
        const geom = new THREE.ConeGeometry(0.6, 1.5, 4);
        const mat = NeonMaterials.glow(NeonMaterials.colors.pink);
        mesh = new THREE.Mesh(geom, mat);
        height = 1.5;
    } else if (type < 0.6) {
        // Block
        const geom = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const mat = NeonMaterials.glow(0xff6600);
        mesh = new THREE.Mesh(geom, mat);
        height = 1.5;
    } else if (type < 0.8) {
        // Tall barrier
        const geom = new THREE.BoxGeometry(1, 3, 1);
        const mat = NeonMaterials.glow(NeonMaterials.colors.purple);
        mesh = new THREE.Mesh(geom, mat);
        height = 3;
    } else {
        // Moving barrier (new!)
        const geom = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        const mat = NeonMaterials.glow(0xff0066);
        mesh = new THREE.Mesh(geom, mat);
        height = 1.2;
        moving = true;
        movingDir = Math.random() > 0.5 ? 1 : -1;
    }

    mesh.position.set(lane, height / 2, z);

    const light = new THREE.PointLight(mesh.material.color.getHex(), 0.5, 5);
    mesh.add(light);

    scene.add(mesh);
    return { mesh, lane, z, height, moving, movingDir, originalLane: lane };
}

// Trail particles
const trailGeom = new THREE.SphereGeometry(0.1, 8, 8);
const trailMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true });

// Floating message
function showMessage(text) {
    floatingMessage.textContent = text;
    floatingMessage.classList.remove('hidden');
    setTimeout(() => floatingMessage.classList.add('hidden'), 1000);
}

// Initialize game
function init() {
    initAudio();

    // Clear previous
    obstacles.forEach(o => scene.remove(o.mesh));
    obstacles = [];
    groundTiles.forEach(g => { scene.remove(g.ground); scene.remove(g.grid); });
    groundTiles = [];
    buildings.forEach(b => scene.remove(b));
    buildings = [];
    coinObjects.forEach(c => scene.remove(c.mesh));
    coinObjects = [];
    powerUpObjects.forEach(p => scene.remove(p.mesh));
    powerUpObjects = [];
    trailParticles.forEach(t => scene.remove(t));
    trailParticles = [];

    const charData = CHARACTERS[characterType];

    score = 0;
    coins = 0;
    distance = 0;
    gameSpeed = 0.32;
    playerVelocityY = 0;
    jumpsRemaining = charData.jumps;
    targetLane = 0;
    activePowerUp = null;
    powerUpTimer = 0;
    hasShield = charData.startShield;

    scoreEl.textContent = score;
    coinsEl.textContent = coins;
    distanceEl.textContent = '0m';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    powerUpIndicator.classList.add('hidden');

    createPlayer();

    // Show shield if tank
    if (hasShield && shieldBubble) {
        shieldBubble.visible = true;
    }

    // Ground tiles
    for (let z = 10; z > -80; z -= 20) {
        groundTiles.push(createGroundTile(z));
    }

    // Buildings
    for (let z = 0; z > -100; z -= 10) {
        buildings.push(createBuilding(-20 - Math.random() * 10, z));
        buildings.push(createBuilding(20 + Math.random() * 10, z));
    }

    isPlaying = true;
}

function update() {
    if (!isPlaying) return;

    const charData = CHARACTERS[characterType];
    const speedMult = activePowerUp === 'slowMo' ? 0.5 : (activePowerUp === 'speedBoost' ? 1.4 : 1);
    const effectiveSpeed = gameSpeed * speedMult;

    // Score & distance
    score++;
    distance += effectiveSpeed * 2;

    if (score % 10 === 0) {
        scoreEl.textContent = Math.floor(score / 10);
        distanceEl.textContent = Math.floor(distance) + 'm';
    }

    // Speed increase
    if (score % 500 === 0) {
        gameSpeed += 0.015;
    }

    // Player physics
    if (activePowerUp === 'jetpack') {
        player.position.y = 4 + Math.sin(score * 0.05) * 0.5;
        playerVelocityY = 0;
    } else {
        playerVelocityY -= GRAVITY * speedMult;
        player.position.y += playerVelocityY;

        if (player.position.y <= 1) {
            player.position.y = 1;
            playerVelocityY = 0;
            jumpsRemaining = charData.jumps;
        }
    }

    // Lane switching (smooth)
    const targetX = LANES[targetLane + 1];
    const laneSpeed = 0.3 * charData.laneSpeed;
    player.position.x += (targetX - player.position.x) * laneSpeed;

    // Power-up timer
    if (activePowerUp) {
        powerUpTimer--;
        powerUpProgress.style.width = (powerUpTimer / POWERUPS[activePowerUp].duration * 100) + '%';

        if (powerUpTimer <= 0) {
            deactivatePowerUp();
        }
    }

    // Magnet visual
    if (activePowerUp === 'magnet' && magnetField) {
        magnetField.visible = true;
        magnetField.rotation.z += 0.05;
    } else if (magnetField) {
        magnetField.visible = false;
    }

    // Spawn coins
    if (score % 40 === 0) {
        const lane = LANES[Math.floor(Math.random() * LANES.length)];
        const y = Math.random() > 0.7 ? 2.5 : 1.5;
        coinObjects.push(createCoin(lane, y, -60));

        // Coin patterns
        if (Math.random() > 0.6) {
            coinObjects.push(createCoin(lane, y, -62));
            coinObjects.push(createCoin(lane, y, -64));
        }
    }

    // Spawn power-ups (rare)
    if (score % 300 === 0 && Math.random() > 0.4) {
        const lane = LANES[Math.floor(Math.random() * LANES.length)];
        powerUpObjects.push(createPowerUpObject(lane, -60));
    }

    // Spawn obstacles
    if (score % 80 === 0) {
        obstacles.push(createObstacle(-60));
    }

    // Update coins
    for (let i = coinObjects.length - 1; i >= 0; i--) {
        const coin = coinObjects[i];
        coin.mesh.position.z += effectiveSpeed;
        coin.mesh.rotation.y += 0.08;

        // Magnet attraction
        if (activePowerUp === 'magnet') {
            const dx = player.position.x - coin.mesh.position.x;
            const dy = player.position.y - coin.mesh.position.y;
            const dz = player.position.z - coin.mesh.position.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < 8) {
                coin.mesh.position.x += dx * 0.1;
                coin.mesh.position.y += dy * 0.1;
                coin.mesh.position.z += dz * 0.05;
            }
        }

        // Remove passed
        if (coin.mesh.position.z > 15) {
            scene.remove(coin.mesh);
            coinObjects.splice(i, 1);
            continue;
        }

        // Collect
        const dist = coin.mesh.position.distanceTo(player.position);
        if (dist < 1.5) {
            const coinValue = activePowerUp === 'coinFrenzy' ? 2 : 1;
            coins += coinValue;
            score += coinValue * 5;
            coinsEl.textContent = coins;
            playSound('coin');

            scene.remove(coin.mesh);
            coinObjects.splice(i, 1);
        }
    }

    // Update power-up objects
    for (let i = powerUpObjects.length - 1; i >= 0; i--) {
        const pu = powerUpObjects[i];
        pu.mesh.position.z += effectiveSpeed;
        pu.mesh.rotation.y += 0.05;
        pu.mesh.rotation.x += 0.03;

        // Remove passed
        if (pu.mesh.position.z > 15) {
            scene.remove(pu.mesh);
            powerUpObjects.splice(i, 1);
            continue;
        }

        // Collect
        const dist = pu.mesh.position.distanceTo(player.position);
        if (dist < 2) {
            activatePowerUp(pu.type);
            scene.remove(pu.mesh);
            powerUpObjects.splice(i, 1);
        }
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.mesh.position.z += effectiveSpeed;

        // Moving obstacles
        if (obs.moving) {
            obs.mesh.position.x += obs.movingDir * 0.08;
            if (obs.mesh.position.x > LANE_WIDTH || obs.mesh.position.x < -LANE_WIDTH) {
                obs.movingDir *= -1;
            }
        }

        // Remove passed
        if (obs.mesh.position.z > 15) {
            scene.remove(obs.mesh);
            obstacles.splice(i, 1);
            continue;
        }

        // Skip collision if jetpack
        if (activePowerUp === 'jetpack') continue;

        // Collision detection
        const dx = Math.abs(player.position.x - obs.mesh.position.x);
        const dz = Math.abs(player.position.z - obs.mesh.position.z);
        const dy = player.position.y - obs.height / 2;

        if (dx < 1 && dz < 1 && dy < obs.height / 2) {
            if (hasShield) {
                hasShield = false;
                if (shieldBubble) shieldBubble.visible = false;
                showMessage('SHIELD BROKEN!');
                scene.remove(obs.mesh);
                obstacles.splice(i, 1);
                playSound('hit');
            } else {
                gameOver();
                return;
            }
        }
    }

    // Update ground tiles
    groundTiles.forEach(tile => {
        tile.z += effectiveSpeed;
        tile.ground.position.z = tile.z;
        tile.grid.position.z = tile.z;
        if (tile.z > 20) tile.z -= 80;
    });

    // Update buildings
    buildings.forEach(b => {
        b.position.z += effectiveSpeed * 0.5;
        if (b.position.z > 20) b.position.z -= 120;
    });

    // Player animation
    if (player.position.y <= 1.1) {
        player.rotation.z = Math.sin(score * 0.1) * 0.05;
    }

    // Trail effect
    if (score % 3 === 0) {
        const charData = CHARACTERS[characterType];
        const trail = new THREE.Mesh(trailGeom, trailMat.clone());
        trail.material.color.setHex(charData.color);
        trail.position.copy(player.position);
        trail.position.z += 0.5;
        trail.userData.life = 20;
        scene.add(trail);
        trailParticles.push(trail);
    }

    // Update trail
    for (let i = trailParticles.length - 1; i >= 0; i--) {
        const p = trailParticles[i];
        p.userData.life--;
        p.material.opacity = p.userData.life / 20;
        p.position.z += effectiveSpeed * 0.5;

        if (p.userData.life <= 0) {
            scene.remove(p);
            trailParticles.splice(i, 1);
        }
    }
}

function activatePowerUp(type) {
    const data = POWERUPS[type];

    activePowerUp = type;
    powerUpTimer = data.duration;

    powerUpIcon.textContent = data.icon;
    powerUpName.textContent = data.name;
    powerUpIndicator.classList.remove('hidden');

    playSound('powerup');
    showMessage(data.icon + ' ' + data.name);

    // Special handling
    if (type === 'shield') {
        hasShield = true;
        if (shieldBubble) shieldBubble.visible = true;
    }
}

function deactivatePowerUp() {
    if (activePowerUp === 'shield') {
        // Shield stays until hit
        return;
    }

    activePowerUp = null;
    powerUpIndicator.classList.add('hidden');

    if (magnetField) magnetField.visible = false;
}

function jump() {
    if (!isPlaying) return;

    const charData = CHARACTERS[characterType];
    const jumpMult = charData.jumpMulti * (activePowerUp === 'superJump' ? 1.4 : 1);

    if (jumpsRemaining > 0) {
        const force = jumpsRemaining === charData.jumps ? JUMP_FORCE : JUMP_FORCE * 0.8;
        playerVelocityY = force * jumpMult;
        jumpsRemaining--;
        playSound('jump');
    }
}

function moveLeft() {
    if (!isPlaying) return;
    if (targetLane > -1) targetLane--;
}

function moveRight() {
    if (!isPlaying) return;
    if (targetLane < 1) targetLane++;
}

function gameOver() {
    isPlaying = false;
    playSound('hit');

    const finalDist = Math.floor(distance);
    const finalScoreValue = Math.floor(score / 10);

    // Update records
    let isNewRecord = false;
    if (finalScoreValue > best) {
        best = finalScoreValue;
        localStorage.setItem('runner3dBest', best);
        bestEl.textContent = best;
        isNewRecord = true;
    }
    if (finalDist > bestDist) {
        bestDist = finalDist;
        localStorage.setItem('runner3dBestDist', bestDist);
        bestDistanceEl.textContent = bestDist + 'm';
        isNewRecord = true;
    }

    // Save total coins
    totalCoinsCollected += coins;
    localStorage.setItem('runner3dCoins', totalCoinsCollected);
    totalCoinsEl.textContent = totalCoinsCollected;

    // Show game over
    finalScoreEl.textContent = finalScoreValue;
    finalDistanceEl.textContent = finalDist + 'm';
    finalCoinsEl.textContent = coins;
    newRecordEl.classList.toggle('hidden', !isNewRecord);
    gameOverScreen.classList.remove('hidden');
}

// Controls
document.addEventListener('keydown', e => {
    switch (e.code) {
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
            e.preventDefault();
            jump();
            break;
        case 'ArrowLeft':
        case 'KeyA':
            e.preventDefault();
            moveLeft();
            break;
        case 'ArrowRight':
        case 'KeyD':
            e.preventDefault();
            moveRight();
            break;
        case 'KeyM':
            isMuted = !isMuted;
            break;
    }
});

// Touch controls
let touchStartX = null;
let touchStartY = null;

canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', e => {
    if (touchStartX === null) {
        jump();
        return;
    }

    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
        jump();
    } else if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < -30) moveLeft();
        else if (dx > 30) moveRight();
    } else {
        if (dy < -30) jump();
    }

    touchStartX = null;
    touchStartY = null;
});

// Character selection
charBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        charBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        characterType = btn.dataset.char;
    });
});

// UI buttons
startBtn.addEventListener('click', init);
restartBtn.addEventListener('click', init);
menuBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    update();

    // Camera effects
    camera.position.y = 4 + Math.sin(Date.now() * 0.001) * 0.2;

    if (activePowerUp === 'speedBoost') {
        camera.fov = 65 + Math.sin(Date.now() * 0.01) * 2;
        camera.updateProjectionMatrix();
    } else if (camera.fov !== 60) {
        camera.fov = 60;
        camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
}

animate();

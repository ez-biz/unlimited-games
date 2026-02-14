// Three.js Space Invaders 3D - Ultimate Edition v2
// Features: Enemy types, power-ups, shields, UFO, waves, combo system, achievements, ship selection, sound

const canvas = document.getElementById('gameCanvas');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const waveEl = document.getElementById('wave');
const comboEl = document.getElementById('combo');
const comboDisplay = document.getElementById('comboDisplay');
const comboText = document.getElementById('comboText');
const powerUpDisplay = document.getElementById('powerUpDisplay');
const powerUpName = document.getElementById('powerUpName');
const startOverlay = document.getElementById('start-overlay');
const pauseOverlay = document.getElementById('pause-overlay');
const gameOverScreen = document.getElementById('game-over');
const gameOverText = document.getElementById('gameOverText');
const finalScoreEl = document.getElementById('finalScore');
const waveBanner = document.getElementById('wave-banner');
const waveBannerNum = document.getElementById('waveBannerNum');
const waveBannerSub = document.getElementById('waveBannerSub');
const highScoreEl = document.getElementById('highScore');
const achievementPopup = document.getElementById('achievementPopup');
const achievementNameEl = document.getElementById('achievementName');
const achievementsModal = document.getElementById('achievements-modal');
const achievementsGrid = document.getElementById('achievementsGrid');
const achievementCount = document.getElementById('achievementCount');
const challengeObjective = document.getElementById('challengeObjective');
const objectiveText = document.getElementById('objectiveText');
const objectiveBar = document.getElementById('objectiveBar');
const startBtn = document.getElementById('startBtn');
const resumeBtn = document.getElementById('resumeBtn');
const restartBtn = document.getElementById('restartBtn');
const quitBtn = document.getElementById('quitBtn');
const menuBtn = document.getElementById('menuBtn');
const achievementsBtn = document.getElementById('achievementsBtn');
const closeAchievementsBtn = document.getElementById('closeAchievementsBtn');
const modeBtns = document.querySelectorAll('.mode-btn');
const shipBtns = document.querySelectorAll('.ship-btn');
const diffBtns = document.querySelectorAll('.diff-btn');

// Game settings
const WIDTH = 900;
const HEIGHT = 550;
const ARENA_WIDTH = 26;
const ARENA_HEIGHT = 18;

// Ship types
const SHIPS = {
    fighter: { speed: 0.28, fireRate: 180, color: 0x00d4ff, bulletSpeed: 0.5, lives: 3 },
    heavy: { speed: 0.18, fireRate: 300, color: 0xff6600, bulletSpeed: 0.4, lives: 4, damage: 2 },
    speeder: { speed: 0.4, fireRate: 120, color: 0x00ff88, bulletSpeed: 0.7, lives: 2 }
};

// Difficulty modifiers
const DIFFICULTIES = {
    easy: { enemySpeed: 0.7, enemyShootMult: 1.5, scoreMult: 0.5 },
    normal: { enemySpeed: 1, enemyShootMult: 1, scoreMult: 1 },
    hard: { enemySpeed: 1.3, enemyShootMult: 0.7, scoreMult: 1.5 },
    insane: { enemySpeed: 1.8, enemyShootMult: 0.4, scoreMult: 2.5 }
};

// Game modes
const MODES = {
    classic: { lives: 3, enemyShootRate: 60, bossEvery: 5 },
    survival: { lives: 1, enemyShootRate: 40, bossEvery: 3 },
    boss: { lives: 3, enemyShootRate: 30, bossEvery: 1 },
    challenge: { lives: 3, enemyShootRate: 50, bossEvery: 5, hasObjective: true }
};

// Achievements
const ACHIEVEMENTS = [
    { id: 'first_blood', name: 'First Blood', icon: '🩸', desc: 'Kill your first enemy', check: s => s.enemiesKilled >= 1 },
    { id: 'combo_5', name: 'Combo Master', icon: '🔥', desc: 'Get a 5x combo', check: s => s.maxCombo >= 5 },
    { id: 'combo_10', name: 'Combo King', icon: '👑', desc: 'Get a 10x combo', check: s => s.maxCombo >= 10 },
    { id: 'wave_5', name: 'Survivor', icon: '🛡️', desc: 'Reach wave 5', check: s => s.wave >= 5 },
    { id: 'wave_10', name: 'Veteran', icon: '🎖️', desc: 'Reach wave 10', check: s => s.wave >= 10 },
    { id: 'score_1000', name: 'Scorer', icon: '💯', desc: 'Score 1000 points', check: s => s.score >= 1000 },
    { id: 'score_5000', name: 'High Scorer', icon: '🏆', desc: 'Score 5000 points', check: s => s.score >= 5000 },
    { id: 'score_10000', name: 'Legend', icon: '⭐', desc: 'Score 10000 points', check: s => s.score >= 10000 },
    { id: 'boss_kill', name: 'Boss Slayer', icon: '💀', desc: 'Defeat a boss', check: s => s.bossesKilled >= 1 },
    { id: 'ufo_hunter', name: 'UFO Hunter', icon: '🛸', desc: 'Destroy a UFO', check: s => s.ufosKilled >= 1 },
    { id: 'accuracy_80', name: 'Sharpshooter', icon: '🎯', desc: '80% accuracy (min 50 shots)', check: s => s.shotsFired >= 50 && (s.enemiesKilled / s.shotsFired) >= 0.8 },
    { id: 'no_damage', name: 'Untouchable', icon: '✨', desc: 'Complete a wave without damage', check: s => s.perfectWave },
    { id: 'power_collector', name: 'Collector', icon: '💎', desc: 'Collect 5 power-ups', check: s => s.powerUpsCollected >= 5 },
    { id: 'bomb_master', name: 'Bomb Master', icon: '💣', desc: 'Kill 10 enemies with one bomb', check: s => s.maxBombKills >= 10 },
    { id: 'speedrun', name: 'Speed Demon', icon: '⚡', desc: 'Clear wave 1 in 30 seconds', check: s => s.wave1Time && s.wave1Time <= 30 }
];

// Challenge objectives
const CHALLENGES = [
    { desc: 'Kill 15 enemies', target: 15, check: s => s.enemiesKilled },
    { desc: 'Get a 5x combo', target: 1, check: s => s.maxCombo >= 5 ? 1 : 0 },
    { desc: 'Destroy the UFO', target: 1, check: s => s.ufosKilled },
    { desc: 'Score 500 points', target: 500, check: s => s.score },
    { desc: 'Kill a boss', target: 1, check: s => s.bossesKilled },
    { desc: 'Collect 3 power-ups', target: 3, check: s => s.powerUpsCollected }
];

// State
let gameMode = 'classic';
let shipType = 'fighter';
let difficulty = 'normal';
let isPlaying = false;
let isPaused = false;
let score = 0;
let lives = 3;
let wave = 1;
let combo = 0;
let maxCombo = 0;
let comboTimer = 0;
let enemies = [];
let playerBullets = [];
let enemyBullets = [];
let particles = [];
const stars = [];
let shields = [];
let powerUps = [];
let ufo = null;
let enemyDirection = 1;
let enemyMoveTimer = 0;
let enemyShootTimer = 0;
let ufoTimer = 0;
let slowMotion = false;
const slowMotionTimer = 0;

// Player state
let activePowerUp = null;
let powerUpTimer = 0;
let shotsFired = 0;
let enemiesKilled = 0;
let bossesKilled = 0;
let ufosKilled = 0;
let powerUpsCollected = 0;
let waveStartTime = 0;
let wave1Time = null;
let perfectWave = true;
let damageTakenThisWave = false;
let maxBombKills = 0;
let currentChallenge = null;

// Saved data
let highScore = parseInt(localStorage.getItem('invadersHighScore')) || 0;
const unlockedAchievements = JSON.parse(localStorage.getItem('invadersAchievements')) || [];
highScoreEl.textContent = highScore;
updateAchievementCount();

// Audio
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let isMuted = false;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
}

function playSound(type) {
    if (isMuted || !audioCtx) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    switch (type) {
        case 'shoot':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
            break;
        case 'explosion':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.2);
            break;
        case 'powerup':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.15);
            break;
        case 'hit':
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
            break;
        case 'combo':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(660, audioCtx.currentTime);
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.3);
            break;
        case 'achievement':
            const osc2 = audioCtx.createOscillator();
            osc2.connect(gainNode);
            oscillator.type = 'sine';
            osc2.type = 'sine';
            oscillator.frequency.setValueAtTime(523, audioCtx.currentTime);
            osc2.frequency.setValueAtTime(659, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            oscillator.start();
            osc2.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
            osc2.stop(audioCtx.currentTime + 0.5);
            break;
    }
}

// Enemy types
const ENEMY_TYPES = {
    basic: { color: 0x00ff88, hp: 1, points: 10, geom: 'tetra', size: 0.6 },
    armored: { color: 0x888888, hp: 2, points: 25, geom: 'box', size: 0.7 },
    fast: { color: 0xffcc00, hp: 1, points: 20, geom: 'octa', size: 0.5 },
    splitter: { color: 0xff00ff, hp: 1, points: 30, geom: 'dodeca', size: 0.6, splits: true },
    healer: { color: 0x00ffaa, hp: 2, points: 40, geom: 'icosa', size: 0.5, heals: true },
    bomber: { color: 0xff3300, hp: 1, points: 35, geom: 'tetra', size: 0.7, explodes: true },
    boss: { color: 0xff0066, hp: 10, points: 200, geom: 'icosa', size: 1.5, isBoss: true }
};

// Power-up types
const POWERUP_TYPES = {
    rapidFire: { color: 0xff6600, name: 'RAPID FIRE', duration: 500, icon: '🔥' },
    spread: { color: 0x00ffff, name: 'SPREAD SHOT', duration: 400, icon: '💠' },
    pierce: { color: 0xff00ff, name: 'PIERCING', duration: 300, icon: '💜' },
    shield: { color: 0x00ff88, name: 'SHIELD', duration: 600, icon: '🛡️' },
    bomb: { color: 0xff0000, name: 'BOMB', duration: 1, icon: '💣' },
    slowmo: { color: 0xaaaaff, name: 'SLOW MOTION', duration: 400, icon: '⏱️' },
    extraLife: { color: 0xff66ff, name: 'EXTRA LIFE', duration: 1, icon: '❤️' },
    magnet: { color: 0xffff00, name: 'MAGNET', duration: 500, icon: '🧲' }
};

// Three.js setup
const scene = NeonMaterials.createScene();
scene.fog = new THREE.Fog(0x0a0a12, 30, 100);

const camera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 0.1, 200);
camera.position.set(0, 5, 28);
camera.lookAt(0, 0, 0);

const renderer = NeonMaterials.createRenderer(canvas);
renderer.setSize(WIDTH, HEIGHT);

// Lighting
NeonMaterials.setupLighting(scene);

// Stars background
function createStars() {
    if (stars.length > 0) return;
    const starGeom = new THREE.SphereGeometry(0.05, 4, 4);

    for (let i = 0; i < 350; i++) {
        const brightness = 0.3 + Math.random() * 0.7;
        const starMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(brightness, brightness, brightness + Math.random() * 0.2),
            transparent: true,
            opacity: Math.random()
        });
        const star = new THREE.Mesh(starGeom, starMat);
        star.position.set(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 60,
            -30 - Math.random() * 50
        );
        star.userData.twinkle = Math.random() * Math.PI * 2;
        star.userData.speed = 0.02 + Math.random() * 0.04;
        scene.add(star);
        stars.push(star);
    }
}

// Player ship
let playerGroup = null;
let thruster = null;
let shieldBubble = null;
let magnetField = null;

function createPlayerShip() {
    if (playerGroup) scene.remove(playerGroup);

    playerGroup = new THREE.Group();
    const shipData = SHIPS[shipType];

    // Main body
    const bodyGeom = new THREE.ConeGeometry(0.9, 2.2, shipType === 'heavy' ? 6 : 4);
    const bodyMat = NeonMaterials.glow(shipData.color);
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.rotation.x = Math.PI / 2;
    body.rotation.z = Math.PI / 4;
    playerGroup.add(body);

    // Wings (vary by ship type)
    const wingWidth = shipType === 'heavy' ? 4 : shipType === 'speeder' ? 2 : 3;
    const wingGeom = new THREE.BoxGeometry(wingWidth, 0.1, 1);
    const wingMat = NeonMaterials.glow(shipData.color);
    const wings = new THREE.Mesh(wingGeom, wingMat);
    wings.position.z = 0.4;
    playerGroup.add(wings);

    // Cockpit
    const cockpitGeom = new THREE.SphereGeometry(0.4, 8, 8);
    const cockpitMat = new THREE.MeshBasicMaterial({ color: 0xaaffff });
    const cockpit = new THREE.Mesh(cockpitGeom, cockpitMat);
    cockpit.position.z = -0.3;
    playerGroup.add(cockpit);

    // Engine glow
    const engineLight = new THREE.PointLight(shipData.color, 1.5, 8);
    engineLight.position.z = 1.2;
    playerGroup.add(engineLight);

    // Thruster
    const thrusterGeom = new THREE.ConeGeometry(0.3, 0.8, 8);
    const thrusterMat = new THREE.MeshBasicMaterial({
        color: shipData.color,
        transparent: true,
        opacity: 0.7
    });
    thruster = new THREE.Mesh(thrusterGeom, thrusterMat);
    thruster.rotation.x = -Math.PI / 2;
    thruster.position.z = 1;
    playerGroup.add(thruster);

    // Shield bubble
    const shieldBubbleGeom = new THREE.SphereGeometry(2, 16, 16);
    const shieldBubbleMat = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
    });
    shieldBubble = new THREE.Mesh(shieldBubbleGeom, shieldBubbleMat);
    shieldBubble.visible = false;
    playerGroup.add(shieldBubble);

    // Magnet field
    const magnetGeom = new THREE.RingGeometry(3, 3.2, 32);
    const magnetMat = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    magnetField = new THREE.Mesh(magnetGeom, magnetMat);
    magnetField.rotation.x = Math.PI / 2;
    magnetField.visible = false;
    playerGroup.add(magnetField);

    playerGroup.position.set(0, -ARENA_HEIGHT / 2 + 1.5, 0);
    scene.add(playerGroup);
}

const player = { get position() { return playerGroup?.position; } };

// Create defensive shields
function createShields() {
    shields.forEach(s => scene.remove(s.mesh));
    shields = [];

    const shieldPositions = [-8, 0, 8];

    shieldPositions.forEach(x => {
        const group = new THREE.Group();
        const blockSize = 0.5;
        const rows = 3;
        const cols = 5;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if ((r === 0 && (c === 0 || c === cols - 1))) continue;

                const geom = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
                const mat = new THREE.MeshStandardMaterial({
                    color: 0x00ff88,
                    emissive: 0x00ff88,
                    emissiveIntensity: 0.3,
                    metalness: 0.5,
                    roughness: 0.5,
                    transparent: true
                });
                const block = new THREE.Mesh(geom, mat);
                block.position.set(
                    (c - cols / 2 + 0.5) * blockSize,
                    (r - rows / 2 + 0.5) * blockSize,
                    0
                );
                block.userData = { hp: 3 };
                group.add(block);
            }
        }

        group.position.set(x, -ARENA_HEIGHT / 2 + 5, 0);
        scene.add(group);
        shields.push({ mesh: group, blocks: group.children.slice() });
    });
}

// Enemy creation
function createEnemy(x, y, type) {
    const typeData = ENEMY_TYPES[type];
    const group = new THREE.Group();

    let geom;
    switch (typeData.geom) {
        case 'tetra': geom = new THREE.TetrahedronGeometry(typeData.size); break;
        case 'box': geom = new THREE.BoxGeometry(typeData.size * 1.2, typeData.size * 0.8, typeData.size); break;
        case 'octa': geom = new THREE.OctahedronGeometry(typeData.size); break;
        case 'dodeca': geom = new THREE.DodecahedronGeometry(typeData.size); break;
        case 'icosa': geom = new THREE.IcosahedronGeometry(typeData.size); break;
        default: geom = new THREE.TetrahedronGeometry(typeData.size);
    }

    const mat = new THREE.MeshStandardMaterial({
        color: typeData.color,
        emissive: typeData.color,
        emissiveIntensity: 0.4,
        metalness: 0.6,
        roughness: 0.3
    });
    const mesh = new THREE.Mesh(geom, mat);
    group.add(mesh);

    // Boss eyes
    if (typeData.isBoss) {
        const eyeGeom = new THREE.SphereGeometry(0.25, 8, 8);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        [-0.5, 0.5].forEach(offsetX => {
            const eye = new THREE.Mesh(eyeGeom, eyeMat);
            eye.position.set(offsetX, 0.4, typeData.size);
            group.add(eye);
        });
    }

    // Healer aura
    if (typeData.heals) {
        const auraGeom = new THREE.RingGeometry(0.8, 1, 16);
        const auraMat = new THREE.MeshBasicMaterial({
            color: 0x00ffaa,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const aura = new THREE.Mesh(auraGeom, auraMat);
        aura.rotation.x = Math.PI / 2;
        group.add(aura);
    }

    // Glow light
    const light = new THREE.PointLight(typeData.color, 0.4, 4);
    group.add(light);

    group.position.set(x, y, 0);
    group.userData = {
        type,
        hp: typeData.hp,
        maxHp: typeData.hp,
        points: typeData.points,
        color: typeData.color,
        splits: typeData.splits,
        isBoss: typeData.isBoss,
        heals: typeData.heals,
        explodes: typeData.explodes,
        healTimer: 0
    };

    scene.add(group);
    return group;
}

function spawnWave() {
    const isBossWave = wave % MODES[gameMode].bossEvery === 0;

    // Reset wave tracking
    damageTakenThisWave = false;
    waveStartTime = Date.now();

    // Show wave banner
    waveBannerNum.textContent = wave;
    waveBannerSub.textContent = isBossWave ? '⚠️ BOSS WAVE ⚠️' : '';
    waveBanner.classList.remove('hidden');
    setTimeout(() => waveBanner.classList.add('hidden'), 1500);

    // Challenge mode objective
    if (gameMode === 'challenge') {
        currentChallenge = CHALLENGES[wave % CHALLENGES.length];
        objectiveText.textContent = `Objective: ${currentChallenge.desc}`;
        challengeObjective.classList.remove('hidden');
    }

    if (isBossWave && gameMode !== 'boss') {
        const boss = createEnemy(0, ARENA_HEIGHT / 2 - 3, 'boss');
        enemies.push(boss);

        for (let i = 0; i < 3 + Math.floor(wave / 2); i++) {
            const x = (Math.random() - 0.5) * ARENA_WIDTH * 0.8;
            const y = ARENA_HEIGHT / 2 - 5 - Math.random() * 2;
            enemies.push(createEnemy(x, y, 'fast'));
        }
    } else if (gameMode === 'boss') {
        const bossCount = Math.min(1 + Math.floor(wave / 2), 4);
        for (let i = 0; i < bossCount; i++) {
            const x = (i - (bossCount - 1) / 2) * 6;
            enemies.push(createEnemy(x, ARENA_HEIGHT / 2 - 3, 'boss'));
        }
    } else {
        const rows = Math.min(2 + Math.floor(wave / 2), 5);
        const cols = Math.min(6 + Math.floor(wave / 2), 11);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = (col - cols / 2 + 0.5) * 2;
                const y = ARENA_HEIGHT / 2 - 2 - row * 1.8;

                let type = 'basic';
                if (wave >= 2 && row === 0) type = 'armored';
                if (wave >= 4 && Math.random() < 0.15) type = 'fast';
                if (wave >= 6 && Math.random() < 0.1) type = 'splitter';
                if (wave >= 8 && Math.random() < 0.08) type = 'healer';
                if (wave >= 10 && Math.random() < 0.05) type = 'bomber';

                enemies.push(createEnemy(x, y, type));
            }
        }
    }

    enemyDirection = 1;
}

// UFO
function spawnUFO() {
    if (ufo) return;

    const group = new THREE.Group();

    const geom = new THREE.TorusGeometry(1, 0.3, 8, 16);
    const mat = new THREE.MeshStandardMaterial({
        color: 0xffcc00,
        emissive: 0xffcc00,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2
    });
    const ring = new THREE.Mesh(geom, mat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    const domeGeom = new THREE.SphereGeometry(0.8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshBasicMaterial({ color: 0xaaffff, transparent: true, opacity: 0.5 });
    const dome = new THREE.Mesh(domeGeom, domeMat);
    dome.rotation.x = -Math.PI / 2;
    group.add(dome);

    const light = new THREE.PointLight(0xffcc00, 1, 10);
    group.add(light);

    group.position.set(-ARENA_WIDTH / 2 - 2, ARENA_HEIGHT / 2 - 1, 0);
    group.userData = { points: 100 + wave * 50 };

    scene.add(group);
    ufo = group;
}

// Power-ups
function spawnPowerUp(x, y, forced = null) {
    const types = Object.keys(POWERUP_TYPES);
    const type = forced || types[Math.floor(Math.random() * types.length)];
    const data = POWERUP_TYPES[type];

    const geom = new THREE.OctahedronGeometry(0.4);
    const mat = new THREE.MeshBasicMaterial({ color: data.color });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, y, 0);
    mesh.userData = { type, ...data };

    const light = new THREE.PointLight(data.color, 0.8, 5);
    mesh.add(light);

    scene.add(mesh);
    powerUps.push(mesh);
}

// Bullets
function createBullet(x, y, isPlayer, angle = 0) {
    const shipData = SHIPS[shipType];
    const geom = new THREE.CylinderGeometry(0.1, 0.1, isPlayer ? 1 : 0.6, 8);
    const color = isPlayer ? (activePowerUp === 'pierce' ? 0xff00ff : 0x00ff88) : 0xff0066;
    const mat = new THREE.MeshBasicMaterial({ color });
    const bullet = new THREE.Mesh(geom, mat);
    bullet.rotation.x = Math.PI / 2;
    bullet.rotation.z = angle;
    bullet.position.set(x, y, 0);
    bullet.userData = {
        angle,
        piercing: activePowerUp === 'pierce',
        damage: shipType === 'heavy' ? 2 : 1,
        speed: isPlayer ? shipData.bulletSpeed : 0.25
    };

    const light = new THREE.PointLight(color, 0.5, 3);
    bullet.add(light);

    scene.add(bullet);
    return bullet;
}

// Explosions
function createExplosion(x, y, color, size = 1) {
    playSound('explosion');
    const count = Math.floor(18 * size);
    for (let i = 0; i < count; i++) {
        const geom = new THREE.SphereGeometry(0.12 * size, 4, 4);
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true });
        const particle = new THREE.Mesh(geom, mat);
        particle.position.set(x, y, 0);
        particle.userData = {
            vx: (Math.random() - 0.5) * 0.5 * size,
            vy: (Math.random() - 0.5) * 0.5 * size,
            vz: (Math.random() - 0.5) * 0.4 * size,
            life: 35 + Math.random() * 25
        };
        scene.add(particle);
        particles.push(particle);
    }
}

// Combo system
function addKill(points) {
    combo++;
    comboTimer = 60; // Reset timer

    // Calculate combo multiplier
    const multiplier = Math.min(1 + (combo - 1) * 0.1, 3); // Max 3x
    const finalPoints = Math.floor(points * multiplier * DIFFICULTIES[difficulty].scoreMult);

    score += finalPoints;
    scoreEl.textContent = score;
    enemiesKilled++;

    if (combo > maxCombo) maxCombo = combo;

    // Update UI
    if (combo >= 2) {
        comboEl.textContent = `x${combo}`;
        comboDisplay.classList.remove('hidden');

        if (combo === 5 || combo === 10 || combo === 15 || combo === 20) {
            playSound('combo');
            comboText.textContent = `COMBO x${combo}!`;
            comboText.classList.remove('hidden');
            setTimeout(() => comboText.classList.add('hidden'), 800);
        }
    }

    checkAchievements();
}

function resetCombo() {
    combo = 0;
    comboDisplay.classList.add('hidden');
}

// Achievement system
function checkAchievements() {
    const stats = {
        score, wave, enemiesKilled, bossesKilled, ufosKilled,
        shotsFired, maxCombo, powerUpsCollected, perfectWave: !damageTakenThisWave,
        maxBombKills, wave1Time
    };

    const newAchievements = [];

    ACHIEVEMENTS.forEach(ach => {
        if (!unlockedAchievements.includes(ach.id) && ach.check(stats)) {
            unlockedAchievements.push(ach.id);
            newAchievements.push(ach);
        }
    });

    if (newAchievements.length > 0) {
        localStorage.setItem('invadersAchievements', JSON.stringify(unlockedAchievements));
        updateAchievementCount();

        // Show popup for first new achievement
        const ach = newAchievements[0];
        playSound('achievement');
        achievementNameEl.textContent = `${ach.icon} ${ach.name}`;
        achievementPopup.classList.remove('hidden');
        setTimeout(() => achievementPopup.classList.add('hidden'), 3000);
    }
}

function updateAchievementCount() {
    achievementCount.textContent = `${unlockedAchievements.length}/${ACHIEVEMENTS.length}`;
}

function showAchievements() {
    achievementsGrid.innerHTML = '';
    ACHIEVEMENTS.forEach(ach => {
        const isUnlocked = unlockedAchievements.includes(ach.id);
        const div = document.createElement('div');
        div.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
        div.innerHTML = `
            <span class="icon">${isUnlocked ? ach.icon : '🔒'}</span>
            <span class="name">${ach.name}</span>
        `;
        div.title = ach.desc;
        achievementsGrid.appendChild(div);
    });
    achievementsModal.classList.remove('hidden');
}

// Input
const keys = {};
document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyP' && isPlaying) togglePause();
    if (e.code === 'KeyM') { isMuted = !isMuted; }
    if (e.code === 'Space') e.preventDefault();
});
document.addEventListener('keyup', e => keys[e.code] = false);

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        document.getElementById('pauseScore').textContent = score;
        document.getElementById('pauseWave').textContent = wave;
    }
    pauseOverlay.classList.toggle('hidden', !isPaused);
}

let lastShot = 0;
function playerShoot() {
    const now = Date.now();
    const shipData = SHIPS[shipType];
    let fireRate = shipData.fireRate;
    if (activePowerUp === 'rapidFire') fireRate *= 0.4;

    if (now - lastShot < fireRate) return;
    lastShot = now;
    shotsFired++;
    playSound('shoot');

    if (activePowerUp === 'spread') {
        playerBullets.push(createBullet(playerGroup.position.x, playerGroup.position.y + 1, true, 0));
        playerBullets.push(createBullet(playerGroup.position.x - 0.3, playerGroup.position.y + 1, true, -0.15));
        playerBullets.push(createBullet(playerGroup.position.x + 0.3, playerGroup.position.y + 1, true, 0.15));
        playerBullets.push(createBullet(playerGroup.position.x - 0.5, playerGroup.position.y + 1, true, -0.3));
        playerBullets.push(createBullet(playerGroup.position.x + 0.5, playerGroup.position.y + 1, true, 0.3));
    } else {
        playerBullets.push(createBullet(playerGroup.position.x, playerGroup.position.y + 1, true));
    }
}

function activateBomb() {
    const killCount = enemies.length;
    enemies.forEach(enemy => {
        createExplosion(enemy.position.x, enemy.position.y, enemy.userData.color, 1.5);
        addKill(enemy.userData.points);
        if (enemy.userData.isBoss) bossesKilled++;
        scene.remove(enemy);
    });
    enemies = [];

    if (killCount > maxBombKills) maxBombKills = killCount;
    checkAchievements();
}

// UI event handlers
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameMode = btn.dataset.mode;
    });
});

shipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        shipBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        shipType = btn.dataset.ship;
    });
});

diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        diffBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        difficulty = btn.dataset.diff;
    });
});

// Game logic
function init() {
    initAudio();

    // Clear
    enemies.forEach(e => scene.remove(e));
    enemies = [];
    playerBullets.forEach(b => scene.remove(b));
    playerBullets = [];
    enemyBullets.forEach(b => scene.remove(b));
    enemyBullets = [];
    particles.forEach(p => scene.remove(p));
    particles = [];
    powerUps.forEach(p => scene.remove(p));
    powerUps = [];
    if (ufo) { scene.remove(ufo); ufo = null; }

    score = 0;
    lives = SHIPS[shipType].lives;
    if (MODES[gameMode].lives) lives = MODES[gameMode].lives;
    wave = 1;
    combo = 0;
    maxCombo = 0;
    activePowerUp = null;
    powerUpTimer = 0;
    shotsFired = 0;
    enemiesKilled = 0;
    bossesKilled = 0;
    ufosKilled = 0;
    powerUpsCollected = 0;
    wave1Time = null;
    perfectWave = true;
    maxBombKills = 0;
    slowMotion = false;

    scoreEl.textContent = score;
    livesEl.textContent = '♥'.repeat(lives);
    waveEl.textContent = wave;
    comboDisplay.classList.add('hidden');
    powerUpDisplay.classList.add('hidden');
    challengeObjective.classList.add('hidden');

    createPlayerShip();
    createStars();
    createShields();
    spawnWave();

    isPlaying = true;
    isPaused = false;
    startOverlay.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    achievementsModal.classList.add('hidden');
}

function update() {
    if (!isPlaying || isPaused) return;

    const speedMult = slowMotion ? 0.3 : 1;
    const diffMult = DIFFICULTIES[difficulty];

    // Player movement
    const speed = SHIPS[shipType].speed * speedMult;
    if (keys['ArrowLeft'] || keys['KeyA']) {
        playerGroup.position.x -= speed;
        playerGroup.rotation.z = 0.15;
    } else if (keys['ArrowRight'] || keys['KeyD']) {
        playerGroup.position.x += speed;
        playerGroup.rotation.z = -0.15;
    } else {
        playerGroup.rotation.z *= 0.85;
    }
    playerGroup.position.x = Math.max(-ARENA_WIDTH / 2 + 1.5, Math.min(ARENA_WIDTH / 2 - 1.5, playerGroup.position.x));

    // Shooting
    if (keys['Space']) playerShoot();

    // Thruster animation
    if (thruster) thruster.scale.y = 0.8 + Math.sin(Date.now() * 0.02) * 0.3;

    // Combo timer
    if (comboTimer > 0) {
        comboTimer -= speedMult;
        if (comboTimer <= 0) resetCombo();
    }

    // Power-up timer
    if (activePowerUp && activePowerUp !== 'bomb' && activePowerUp !== 'extraLife') {
        powerUpTimer -= speedMult;
        if (powerUpTimer <= 0) {
            activePowerUp = null;
            powerUpDisplay.classList.add('hidden');
            if (shieldBubble) shieldBubble.visible = false;
            if (magnetField) magnetField.visible = false;
            slowMotion = false;
        }
    }

    // Magnet effect
    if (activePowerUp === 'magnet' && magnetField) {
        magnetField.visible = true;
        magnetField.rotation.z += 0.05;
    }

    // Update player bullets
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        const bullet = playerBullets[i];
        bullet.position.y += bullet.userData.speed * speedMult;
        bullet.position.x += Math.sin(bullet.userData.angle) * 0.3 * speedMult;

        if (bullet.position.y > ARENA_HEIGHT / 2 + 1) {
            scene.remove(bullet);
            playerBullets.splice(i, 1);
            continue;
        }

        // Hit enemy
        let hitEnemy = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            const dist = bullet.position.distanceTo(enemy.position);
            const hitRadius = enemy.userData.isBoss ? 2 : 1;

            if (dist < hitRadius) {
                enemy.userData.hp -= bullet.userData.damage;
                playSound('hit');

                if (enemy.userData.hp <= 0) {
                    createExplosion(enemy.position.x, enemy.position.y, enemy.userData.color,
                        enemy.userData.isBoss ? 2.5 : 1);
                    addKill(enemy.userData.points);

                    if (enemy.userData.isBoss) {
                        bossesKilled++;
                        spawnPowerUp(enemy.position.x, enemy.position.y);
                    }

                    // Splitter
                    if (enemy.userData.splits) {
                        enemies.push(createEnemy(enemy.position.x - 1, enemy.position.y, 'fast'));
                        enemies.push(createEnemy(enemy.position.x + 1, enemy.position.y, 'fast'));
                    }

                    // Bomber explosion
                    if (enemy.userData.explodes) {
                        // Damage nearby enemies
                        enemies.forEach(e => {
                            if (e !== enemy && e.position.distanceTo(enemy.position) < 3) {
                                e.userData.hp -= 2;
                            }
                        });
                    }

                    // Random power-up drop
                    if (Math.random() < 0.08) {
                        spawnPowerUp(enemy.position.x, enemy.position.y);
                    }

                    scene.remove(enemy);
                    enemies.splice(j, 1);
                } else {
                    enemy.children[0].material.emissiveIntensity = 1;
                    setTimeout(() => {
                        if (enemy.children[0]) enemy.children[0].material.emissiveIntensity = 0.4;
                    }, 100);
                }

                hitEnemy = true;
                if (!bullet.userData.piercing) break;
            }
        }

        if (hitEnemy && !bullet.userData.piercing) {
            scene.remove(bullet);
            playerBullets.splice(i, 1);
            continue;
        }

        // Hit UFO
        if (ufo) {
            const dist = bullet.position.distanceTo(ufo.position);
            if (dist < 1.5) {
                createExplosion(ufo.position.x, ufo.position.y, 0xffcc00, 1.5);
                score += Math.floor(ufo.userData.points * DIFFICULTIES[difficulty].scoreMult);
                scoreEl.textContent = score;
                ufosKilled++;
                spawnPowerUp(ufo.position.x, ufo.position.y);
                checkAchievements();

                scene.remove(ufo);
                ufo = null;
                scene.remove(bullet);
                playerBullets.splice(i, 1);
            }
        }
    }

    // Enemy movement
    enemyMoveTimer += speedMult;
    const moveRate = Math.max(25 - wave * 2 - (10 - Math.min(enemies.length, 10)) * 0.5, 5) / diffMult.enemySpeed;
    if (enemyMoveTimer > moveRate) {
        enemyMoveTimer = 0;

        let shouldDrop = false;
        enemies.forEach(e => {
            if (!e.userData.isBoss) {
                e.position.x += enemyDirection * 0.6;
                if (e.position.x > ARENA_WIDTH / 2 - 2 || e.position.x < -ARENA_WIDTH / 2 + 2) {
                    shouldDrop = true;
                }
            }
        });

        if (shouldDrop) {
            enemyDirection *= -1;
            enemies.forEach(e => {
                e.position.y -= 0.6;
                if (e.position.y < -ARENA_HEIGHT / 2 + 4) {
                    gameOver(false);
                }
            });
        }
    }

    // Enemy animation and abilities
    enemies.forEach(e => {
        e.rotation.y += (e.userData.isBoss ? 0.01 : 0.03) * speedMult;
        e.rotation.z = Math.sin(Date.now() * 0.002 + e.position.x) * 0.1;

        // Boss movement
        if (e.userData.isBoss) {
            e.position.x = Math.sin(Date.now() * 0.001 * speedMult + e.userData.points) * (ARENA_WIDTH / 3);
        }

        // Healer ability
        if (e.userData.heals) {
            e.userData.healTimer++;
            if (e.userData.healTimer > 120) {
                e.userData.healTimer = 0;
                enemies.forEach(other => {
                    if (other !== e && other.position.distanceTo(e.position) < 4) {
                        other.userData.hp = Math.min(other.userData.hp + 1, other.userData.maxHp);
                    }
                });
            }
        }
    });

    // Enemy shooting
    enemyShootTimer += speedMult;
    const shootRate = MODES[gameMode].enemyShootRate * diffMult.enemyShootMult;
    if (enemyShootTimer > shootRate && enemies.length > 0) {
        enemyShootTimer = 0;
        const shooters = enemies.filter(e => !e.userData.isBoss);
        if (shooters.length > 0) {
            const shooter = shooters[Math.floor(Math.random() * shooters.length)];
            enemyBullets.push(createBullet(shooter.position.x, shooter.position.y - 0.5, false));
        }

        enemies.filter(e => e.userData.isBoss).forEach(boss => {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    if (boss.parent) {
                        enemyBullets.push(createBullet(
                            boss.position.x + (Math.random() - 0.5) * 2,
                            boss.position.y - 1,
                            false
                        ));
                    }
                }, i * 100);
            }
        });
    }

    // Update enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        bullet.position.y -= 0.25 * speedMult * diffMult.enemySpeed;

        if (bullet.position.y < -ARENA_HEIGHT / 2 - 1) {
            scene.remove(bullet);
            enemyBullets.splice(i, 1);
            continue;
        }

        // Hit player
        const dist = bullet.position.distanceTo(playerGroup.position);
        if (dist < 1.8) {
            if (activePowerUp === 'shield') {
                scene.remove(bullet);
                enemyBullets.splice(i, 1);
                continue;
            }

            createExplosion(playerGroup.position.x, playerGroup.position.y, SHIPS[shipType].color);
            scene.remove(bullet);
            enemyBullets.splice(i, 1);

            lives--;
            damageTakenThisWave = true;
            resetCombo();
            livesEl.textContent = '♥'.repeat(Math.max(0, lives));

            if (lives <= 0) {
                gameOver(false);
            }
            continue;
        }
    }

    // Update UFO
    if (ufo) {
        ufo.position.x += 0.1 * speedMult;
        ufo.rotation.y += 0.02 * speedMult;
        if (ufo.position.x > ARENA_WIDTH / 2 + 3) {
            scene.remove(ufo);
            ufo = null;
        }
    }

    // Spawn UFO
    ufoTimer += speedMult;
    if (ufoTimer > 500 && !ufo && Math.random() < 0.008) {
        spawnUFO();
        ufoTimer = 0;
    }

    // Update power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const pu = powerUps[i];
        pu.position.y -= 0.05 * speedMult;
        pu.rotation.y += 0.05 * speedMult;
        pu.rotation.x += 0.03 * speedMult;

        // Magnet attraction
        if (activePowerUp === 'magnet') {
            const dx = playerGroup.position.x - pu.position.x;
            const dy = playerGroup.position.y - pu.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 8) {
                pu.position.x += dx * 0.05;
                pu.position.y += dy * 0.05;
            }
        }

        if (pu.position.y < -ARENA_HEIGHT / 2 - 1) {
            scene.remove(pu);
            powerUps.splice(i, 1);
            continue;
        }

        // Collect
        const dist = pu.position.distanceTo(playerGroup.position);
        if (dist < 2) {
            powerUpsCollected++;
            playSound('powerup');

            if (pu.userData.type === 'bomb') {
                activateBomb();
            } else if (pu.userData.type === 'extraLife') {
                lives++;
                livesEl.textContent = '♥'.repeat(lives);
            } else if (pu.userData.type === 'slowmo') {
                slowMotion = true;
                activePowerUp = 'slowmo';
                powerUpTimer = pu.userData.duration;
                powerUpName.textContent = pu.userData.name;
                powerUpDisplay.classList.remove('hidden');
            } else {
                activePowerUp = pu.userData.type;
                powerUpTimer = pu.userData.duration;
                powerUpName.textContent = pu.userData.name;
                powerUpDisplay.classList.remove('hidden');

                if (pu.userData.type === 'shield' && shieldBubble) {
                    shieldBubble.visible = true;
                }
            }

            checkAchievements();
            scene.remove(pu);
            powerUps.splice(i, 1);
        }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.position.x += p.userData.vx * speedMult;
        p.position.y += p.userData.vy * speedMult;
        p.position.z += p.userData.vz * speedMult;
        p.userData.life -= speedMult;
        p.material.opacity = p.userData.life / 60;

        if (p.userData.life <= 0) {
            scene.remove(p);
            particles.splice(i, 1);
        }
    }

    // Stars twinkle
    stars.forEach(star => {
        star.userData.twinkle += star.userData.speed * speedMult;
        star.material.opacity = 0.3 + Math.sin(star.userData.twinkle) * 0.4;
    });

    // Challenge mode objective
    if (gameMode === 'challenge' && currentChallenge) {
        const progress = currentChallenge.check({
            score, enemiesKilled, maxCombo, ufosKilled, bossesKilled, powerUpsCollected
        });
        const pct = Math.min(100, (progress / currentChallenge.target) * 100);
        objectiveBar.style.width = pct + '%';
    }

    // Wave complete
    if (enemies.length === 0) {
        // Track wave 1 time
        if (wave === 1 && !wave1Time) {
            wave1Time = (Date.now() - waveStartTime) / 1000;
        }

        // Perfect wave check
        if (!damageTakenThisWave) {
            perfectWave = true;
            checkAchievements();
        }

        wave++;
        waveEl.textContent = wave;
        spawnWave();
    }
}

function gameOver(won) {
    isPlaying = false;

    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('invadersHighScore', highScore);
        highScoreEl.textContent = highScore;
    }

    checkAchievements();

    gameOverText.textContent = won ? 'VICTORY!' : 'GAME OVER';
    gameOverText.style.color = won ? '#00ff88' : '#ff0066';
    finalScoreEl.textContent = score;

    const accuracy = shotsFired > 0 ? Math.round((enemiesKilled / shotsFired) * 100) : 0;
    document.getElementById('statAccuracy').textContent = accuracy + '%';
    document.getElementById('statEnemies').textContent = enemiesKilled;
    document.getElementById('statMaxCombo').textContent = maxCombo;
    document.getElementById('statWave').textContent = wave;

    gameOverScreen.classList.remove('hidden');
    challengeObjective.classList.add('hidden');
}

function animate() {
    requestAnimationFrame(animate);
    update();

    // Camera effects
    if (particles.length > 8) {
        camera.position.x = (Math.random() - 0.5) * 0.2;
    } else if (slowMotion) {
        camera.position.x = Math.sin(Date.now() * 0.002) * 0.3;
    } else {
        camera.position.x *= 0.92;
    }

    renderer.render(scene, camera);
}

// Event handlers
startBtn.addEventListener('click', init);
resumeBtn.addEventListener('click', () => { isPaused = false; pauseOverlay.classList.add('hidden'); });
restartBtn.addEventListener('click', init);
quitBtn?.addEventListener('click', () => { isPlaying = false; pauseOverlay.classList.add('hidden'); startOverlay.classList.remove('hidden'); });
menuBtn?.addEventListener('click', () => { gameOverScreen.classList.add('hidden'); startOverlay.classList.remove('hidden'); });
achievementsBtn?.addEventListener('click', showAchievements);
closeAchievementsBtn?.addEventListener('click', () => achievementsModal.classList.add('hidden'));

animate();

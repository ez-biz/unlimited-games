// Three.js 2048 3D
const canvas = document.getElementById('gameCanvas');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const newGameBtn = document.getElementById('newGameBtn');
const restartBtn = document.getElementById('restartBtn');
const overlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');

// Game settings
const WIDTH = 600;
const HEIGHT = 500;
const SIZE = 4;
const TILE_SIZE = 1.8;
const TILE_GAP = 0.2;
const TILE_HEIGHT_BASE = 0.4;

// State
let grid = [];
let tileMeshes = [];
let score = 0;
let best = localStorage.getItem('2048best3d') || 0;
const isAnimating = false;
bestEl.textContent = best;

// Tile colors by value
const TILE_COLORS = {
    2: 0x00d4ff,
    4: 0x00ff88,
    8: 0xffcc00,
    16: 0xff9900,
    32: 0xff6600,
    64: 0xff0066,
    128: 0xff00ff,
    256: 0xaa00ff,
    512: 0x6600ff,
    1024: 0x0066ff,
    2048: 0xffffff
};

// Three.js setup
const scene = NeonMaterials.createScene();
const camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1000);
camera.position.set(0, 12, 8);
camera.lookAt(0, 0, 0);

const renderer = NeonMaterials.createRenderer(canvas);
renderer.setSize(WIDTH, HEIGHT);

// Lighting
NeonMaterials.setupLighting(scene);

// Base platform
const offset = (SIZE * (TILE_SIZE + TILE_GAP)) / 2 - TILE_SIZE / 2 - TILE_GAP / 2;
const baseGeom = new THREE.BoxGeometry(
    SIZE * (TILE_SIZE + TILE_GAP) + 0.4,
    0.3,
    SIZE * (TILE_SIZE + TILE_GAP) + 0.4
);
const baseMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.5, roughness: 0.5 });
const base = new THREE.Mesh(baseGeom, baseMat);
base.position.y = -0.2;
scene.add(base);

// Empty cell spots
const spotGeom = new THREE.BoxGeometry(TILE_SIZE, 0.1, TILE_SIZE);
const spotMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3e });
for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
        const spot = new THREE.Mesh(spotGeom, spotMat);
        spot.position.set(
            c * (TILE_SIZE + TILE_GAP) - offset,
            0,
            r * (TILE_SIZE + TILE_GAP) - offset
        );
        scene.add(spot);
    }
}

// Create number texture
function createNumberTexture(num) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 128, 128);
    ctx.font = num >= 1000 ? 'bold 40px Arial' : num >= 100 ? 'bold 50px Arial' : 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = num >= 8 ? '#000' : '#fff';
    ctx.fillText(num.toString(), 64, 64);

    return new THREE.CanvasTexture(canvas);
}

// Create tile mesh
function createTileMesh(value, row, col) {
    const height = TILE_HEIGHT_BASE + Math.log2(value) * 0.1;
    const geom = new THREE.BoxGeometry(TILE_SIZE * 0.9, height, TILE_SIZE * 0.9);
    const color = TILE_COLORS[value] || 0xffffff;

    const mat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.3,
        metalness: 0.4,
        roughness: 0.3
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(
        col * (TILE_SIZE + TILE_GAP) - offset,
        height / 2 + 0.05,
        row * (TILE_SIZE + TILE_GAP) - offset
    );

    // Number on top
    const numTexture = createNumberTexture(value);
    const numGeom = new THREE.PlaneGeometry(TILE_SIZE * 0.7, TILE_SIZE * 0.7);
    const numMat = new THREE.MeshBasicMaterial({ map: numTexture, transparent: true });
    const numMesh = new THREE.Mesh(numGeom, numMat);
    numMesh.rotation.x = -Math.PI / 2;
    numMesh.position.y = height / 2 + 0.01;
    mesh.add(numMesh);

    scene.add(mesh);
    return mesh;
}

function init() {
    // Clear previous tiles
    tileMeshes.forEach(t => scene.remove(t.mesh));
    tileMeshes = [];

    // Init grid
    grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
    score = 0;
    scoreEl.textContent = score;
    overlay.classList.add('hidden');

    addRandomTile();
    addRandomTile();
    renderTiles();
}

function addRandomTile() {
    const empty = [];
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 0) empty.push({ r, c });
        }
    }
    if (empty.length === 0) return false;
    const { r, c } = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return true;
}

function renderTiles() {
    // Remove old meshes
    tileMeshes.forEach(t => scene.remove(t.mesh));
    tileMeshes = [];

    // Create new meshes
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] !== 0) {
                const mesh = createTileMesh(grid[r][c], r, c);
                tileMeshes.push({ mesh, row: r, col: c, value: grid[r][c] });
            }
        }
    }
}

function slide(row) {
    let arr = row.filter(v => v !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            score += arr[i];
            arr[i + 1] = 0;
        }
    }
    arr = arr.filter(v => v !== 0);
    while (arr.length < SIZE) arr.push(0);
    return arr;
}

function move(direction) {
    if (isAnimating) return;

    let moved = false;
    const newGrid = grid.map(r => [...r]);

    if (direction === 'left') {
        for (let r = 0; r < SIZE; r++) {
            const newRow = slide(grid[r]);
            if (newRow.join() !== grid[r].join()) moved = true;
            newGrid[r] = newRow;
        }
    } else if (direction === 'right') {
        for (let r = 0; r < SIZE; r++) {
            const reversed = [...grid[r]].reverse();
            const newRow = slide(reversed).reverse();
            if (newRow.join() !== grid[r].join()) moved = true;
            newGrid[r] = newRow;
        }
    } else if (direction === 'up') {
        for (let c = 0; c < SIZE; c++) {
            const col = grid.map(row => row[c]);
            const newCol = slide(col);
            if (newCol.join() !== col.join()) moved = true;
            for (let r = 0; r < SIZE; r++) newGrid[r][c] = newCol[r];
        }
    } else if (direction === 'down') {
        for (let c = 0; c < SIZE; c++) {
            const col = grid.map(row => row[c]).reverse();
            const newCol = slide(col).reverse();
            const origCol = grid.map(row => row[c]);
            if (newCol.join() !== origCol.join()) moved = true;
            for (let r = 0; r < SIZE; r++) newGrid[r][c] = newCol[r];
        }
    }

    if (moved) {
        grid = newGrid;
        addRandomTile();
        renderTiles();
        scoreEl.textContent = score;

        if (score > best) {
            best = score;
            bestEl.textContent = best;
            localStorage.setItem('2048best3d', best);
        }

        checkGameState();
    }
}

function checkGameState() {
    // Check for 2048
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 2048) {
                overlayTitle.textContent = '🎉 YOU WIN!';
                overlayTitle.style.color = '#00ff88';
                overlayScore.textContent = 'Score: ' + score;
                overlay.classList.remove('hidden');
                return;
            }
        }
    }

    // Check for game over
    if (isGameOver()) {
        overlayTitle.textContent = 'Game Over!';
        overlayTitle.style.color = '#ff0066';
        overlayScore.textContent = 'Score: ' + score;
        overlay.classList.remove('hidden');
    }
}

function isGameOver() {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 0) return false;
            if (c < SIZE - 1 && grid[r][c + 1] === grid[r][c]) return false;
            if (r < SIZE - 1 && grid[r + 1][c] === grid[r][c]) return false;
        }
    }
    return true;
}

// Controls
document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); move('left'); break;
        case 'ArrowRight': case 'd': case 'D': e.preventDefault(); move('right'); break;
        case 'ArrowUp': case 'w': case 'W': e.preventDefault(); move('up'); break;
        case 'ArrowDown': case 's': case 'S': e.preventDefault(); move('down'); break;
    }
});

// Touch support
let touchStartX, touchStartY;
canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', e => {
    if (!touchStartX || !touchStartY) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) move('right');
        else if (dx < -30) move('left');
    } else {
        if (dy > 30) move('down');
        else if (dy < -30) move('up');
    }
    touchStartX = touchStartY = null;
});

newGameBtn.addEventListener('click', init);
restartBtn.addEventListener('click', init);

// Animation
function animate() {
    requestAnimationFrame(animate);

    // Subtle camera rotation
    const time = Date.now() * 0.0003;
    camera.position.x = Math.sin(time) * 2;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

init();
animate();

// Three.js Minesweeper 3D
const canvas = document.getElementById('gameCanvas');
const minesLeftEl = document.getElementById('minesLeft');
const timerEl = document.getElementById('timer');
const overlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayText = document.getElementById('overlay-text');
const restartBtn = document.getElementById('restartBtn');
const diffBtns = document.querySelectorAll('.diff-btn');

// Game settings
const WIDTH = 700;
const HEIGHT = 500;
let GRID_SIZE = 8;
let MINE_COUNT = 10;
const CELL_SIZE = 1;
const CELL_GAP = 0.1;

// State
let grid = [];
let tiles = [];
let gameState = 'playing'; // playing, won, lost
let flagCount = 0;
let revealedCount = 0;
let startTime = null;
let timerInterval = null;

// Three.js setup
const scene = NeonMaterials.createScene();
const camera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 0.1, 1000);

const renderer = NeonMaterials.createRenderer(canvas);
renderer.setSize(WIDTH, HEIGHT);

// Raycaster for mouse picking
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Lighting
NeonMaterials.setupLighting(scene);

// Materials
const materials = {
    hidden: new THREE.MeshStandardMaterial({ color: 0x2a2a3e, metalness: 0.5, roughness: 0.5 }),
    revealed: new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.3, roughness: 0.7 }),
    mine: NeonMaterials.glow(NeonMaterials.colors.pink),
    flag: NeonMaterials.glow(NeonMaterials.colors.cyan),
    numbers: [
        null,
        new THREE.MeshBasicMaterial({ color: 0x00d4ff }), // 1
        new THREE.MeshBasicMaterial({ color: 0x00ff88 }), // 2
        new THREE.MeshBasicMaterial({ color: 0xff6600 }), // 3
        new THREE.MeshBasicMaterial({ color: 0xff0066 }), // 4
        new THREE.MeshBasicMaterial({ color: 0xaa00ff }), // 5
        new THREE.MeshBasicMaterial({ color: 0x00ffff }), // 6
        new THREE.MeshBasicMaterial({ color: 0xffff00 }), // 7
        new THREE.MeshBasicMaterial({ color: 0xff00ff })  // 8
    ]
};

// Create number textures
function createNumberSprite(num) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, 64, 64);

    const colors = ['', '#00d4ff', '#00ff88', '#ff6600', '#ff0066', '#aa00ff', '#00ffff', '#ffff00', '#ff00ff'];
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = colors[num];
    ctx.fillText(num.toString(), 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0.6, 0.6, 1);
    return sprite;
}

function initGame() {
    // Clear previous
    tiles.forEach(t => scene.remove(t.mesh));
    tiles = [];
    grid = [];
    gameState = 'playing';
    flagCount = 0;
    revealedCount = 0;
    minesLeftEl.textContent = MINE_COUNT;
    timerEl.textContent = '0';
    if (timerInterval) clearInterval(timerInterval);
    startTime = null;
    overlay.classList.add('hidden');

    // Create grid data
    for (let r = 0; r < GRID_SIZE; r++) {
        grid[r] = [];
        for (let c = 0; c < GRID_SIZE; c++) {
            grid[r][c] = {
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                adjacentMines: 0
            };
        }
    }

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < MINE_COUNT) {
        const r = Math.floor(Math.random() * GRID_SIZE);
        const c = Math.floor(Math.random() * GRID_SIZE);
        if (!grid[r][c].isMine) {
            grid[r][c].isMine = true;
            minesPlaced++;
        }
    }

    // Calculate adjacent mines
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (!grid[r][c].isMine) {
                grid[r][c].adjacentMines = countAdjacentMines(r, c);
            }
        }
    }

    // Create 3D tiles
    const offset = (GRID_SIZE * (CELL_SIZE + CELL_GAP)) / 2 - CELL_SIZE / 2;
    const tileGeom = new THREE.BoxGeometry(CELL_SIZE, 0.3, CELL_SIZE);

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const mesh = new THREE.Mesh(tileGeom, materials.hidden.clone());
            mesh.position.set(
                c * (CELL_SIZE + CELL_GAP) - offset,
                0,
                r * (CELL_SIZE + CELL_GAP) - offset
            );
            mesh.userData = { row: r, col: c };
            scene.add(mesh);
            tiles.push({ mesh, row: r, col: c });
        }
    }

    // Position camera
    const camDist = GRID_SIZE * 0.8 + 5;
    camera.position.set(0, camDist, camDist * 0.6);
    camera.lookAt(0, 0, 0);
}

function countAdjacentMines(row, col) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            const r = row + dr, c = col + dc;
            if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && grid[r][c].isMine) {
                count++;
            }
        }
    }
    return count;
}

function revealCell(row, col) {
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return;
    const cell = grid[row][col];
    if (cell.isRevealed || cell.isFlagged) return;

    if (!startTime) {
        startTime = Date.now();
        timerInterval = setInterval(() => {
            timerEl.textContent = Math.floor((Date.now() - startTime) / 1000);
        }, 1000);
    }

    cell.isRevealed = true;
    revealedCount++;

    const tile = tiles.find(t => t.row === row && t.col === col);

    if (cell.isMine) {
        // Game over
        tile.mesh.material = materials.mine;
        tile.mesh.position.y = 0.3;
        gameOver(false);
        return;
    }

    // Reveal tile
    tile.mesh.material = materials.revealed;
    tile.mesh.position.y = -0.1;

    if (cell.adjacentMines > 0) {
        const numSprite = createNumberSprite(cell.adjacentMines);
        numSprite.position.set(tile.mesh.position.x, 0.3, tile.mesh.position.z);
        scene.add(numSprite);
        tile.numberSprite = numSprite;
    } else {
        // Flood fill
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr !== 0 || dc !== 0) {
                    revealCell(row + dr, col + dc);
                }
            }
        }
    }

    // Check win
    if (revealedCount === GRID_SIZE * GRID_SIZE - MINE_COUNT) {
        gameOver(true);
    }
}

function toggleFlag(row, col) {
    const cell = grid[row][col];
    if (cell.isRevealed) return;

    const tile = tiles.find(t => t.row === row && t.col === col);

    if (cell.isFlagged) {
        cell.isFlagged = false;
        tile.mesh.material = materials.hidden.clone();
        tile.mesh.scale.y = 1;
        flagCount--;
    } else {
        cell.isFlagged = true;
        tile.mesh.material = materials.flag;
        tile.mesh.scale.y = 1.5;
        flagCount++;
    }

    minesLeftEl.textContent = MINE_COUNT - flagCount;
}

function gameOver(won) {
    gameState = won ? 'won' : 'lost';
    clearInterval(timerInterval);

    // Reveal all mines
    if (!won) {
        tiles.forEach(tile => {
            if (grid[tile.row][tile.col].isMine) {
                tile.mesh.material = materials.mine;
                tile.mesh.position.y = 0.3;
            }
        });
    }

    overlayTitle.textContent = won ? '🎉 YOU WIN!' : '💥 BOOM!';
    overlayTitle.style.color = won ? '#00ff88' : '#ff0066';
    overlayText.textContent = `Time: ${timerEl.textContent}s`;

    setTimeout(() => overlay.classList.remove('hidden'), 500);
}

// Mouse handling
function onMouseClick(e) {
    if (gameState !== 'playing') return;

    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / WIDTH) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / HEIGHT) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(tiles.map(t => t.mesh));

    if (intersects.length > 0) {
        const { row, col } = intersects[0].object.userData;
        if (e.button === 2) {
            toggleFlag(row, col);
        } else {
            revealCell(row, col);
        }
    }
}

canvas.addEventListener('click', onMouseClick);
canvas.addEventListener('contextmenu', e => { e.preventDefault(); onMouseClick(e); });

// Zoom
canvas.addEventListener('wheel', e => {
    camera.position.y += e.deltaY * 0.02;
    camera.position.y = Math.max(5, Math.min(30, camera.position.y));
    camera.position.z = camera.position.y * 0.6;
    camera.lookAt(0, 0, 0);
});

// Difficulty buttons
diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        diffBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        GRID_SIZE = parseInt(btn.dataset.size);
        MINE_COUNT = parseInt(btn.dataset.mines);
        initGame();
    });
});

restartBtn.addEventListener('click', initGame);

// Animation
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

initGame();
animate();

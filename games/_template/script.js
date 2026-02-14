const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const score = 0;
const isGameRunning = true;

// precise game loop using requestAnimationFrame and delta time
let lastTime = 0;

function gameLoop(timestamp) {
    if (!isGameRunning) return;

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
    // Game logic here
}

function draw() {
    // Clear screen
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw something
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText('Game Template Running...', 50, 50);
}

// Start Loop
requestAnimationFrame(gameLoop);

// Input handling
document.addEventListener('keydown', (e) => {
    // console.log(e.code);
});

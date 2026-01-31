// Socket.io connection
const socket = io('http://localhost:3001');

// DOM Elements - Screens
const menuScreen = document.getElementById('menu-screen');
const lobbyScreen = document.getElementById('lobby-screen');
const gameScreen = document.getElementById('game-screen');

// Menu elements
const playerNameInput = document.getElementById('playerName');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomCodeInput = document.getElementById('roomCodeInput');

// Lobby elements
const roomCodeDisplay = document.getElementById('roomCode');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const playersList = document.getElementById('playersList');
const startGameBtn = document.getElementById('startGameBtn');
const waitingHint = document.getElementById('waitingHint');
const lobbySettings = document.getElementById('lobbySettings');

// Game elements
const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const wordHintEl = document.getElementById('wordHint');
const timerEl = document.getElementById('timer');
const roundNumEl = document.getElementById('roundNum');
const totalRoundsEl = document.getElementById('totalRounds');
const scoreboard = document.getElementById('scoreboard');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const drawTools = document.getElementById('drawTools');
const wordSelection = document.getElementById('wordSelection');
const wordChoices = document.getElementById('wordChoices');
const colorPalette = document.getElementById('colorPalette');

// Overlays
const resultsOverlay = document.getElementById('resultsOverlay');
const gameEndOverlay = document.getElementById('gameEndOverlay');
const errorToast = document.getElementById('errorToast');

// State
let currentRoom = null;
let isHost = false;
let isDrawing = false;
let myId = null;
let currentDrawerId = null;
let timerInterval = null;

// Drawing state
let drawing = false;
let lastX = 0;
let lastY = 0;
let brushColor = '#000000';
let brushSize = 8;
let isEraser = false;
let drawHistory = [];

// Color palette
const COLORS = [
    '#000000', '#ffffff', '#808080', '#c0c0c0',
    '#800000', '#ff0000', '#ff6600', '#ffcc00',
    '#808000', '#00ff00', '#008000', '#00ffff',
    '#008080', '#0000ff', '#000080', '#ff00ff',
    '#800080', '#ff69b4', '#a0522d', '#deb887'
];

// Initialize color palette
function initColorPalette() {
    COLORS.forEach((color, i) => {
        const btn = document.createElement('div');
        btn.className = 'color-btn' + (i === 0 ? ' active' : '');
        btn.style.backgroundColor = color;
        btn.dataset.color = color;
        btn.addEventListener('click', () => selectColor(color, btn));
        colorPalette.appendChild(btn);
    });
}

function selectColor(color, btn) {
    brushColor = color;
    isEraser = false;
    document.getElementById('eraserBtn').classList.remove('active');
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// Size buttons
document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        brushSize = parseInt(btn.dataset.size);
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Tool buttons
document.getElementById('eraserBtn').addEventListener('click', (e) => {
    isEraser = !isEraser;
    e.target.classList.toggle('active');
});

document.getElementById('clearBtn').addEventListener('click', () => {
    if (currentDrawerId === myId) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        socket.emit('clearCanvas');
    }
});

document.getElementById('undoBtn').addEventListener('click', () => {
    // Simple undo - TODO: implement proper history
});

// Screen navigation
function showScreen(screen) {
    [menuScreen, lobbyScreen, gameScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

// Show error
function showError(msg) {
    errorToast.textContent = msg;
    errorToast.classList.remove('hidden');
    setTimeout(() => errorToast.classList.add('hidden'), 3000);
}

// =================== MENU ===================

createRoomBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim() || 'Player';
    socket.emit('createRoom', { name });
});

joinRoomBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim() || 'Player';
    const code = roomCodeInput.value.trim().toUpperCase();
    if (!code || code.length < 4) {
        showError('Enter a valid room code!');
        return;
    }
    socket.emit('joinRoom', { name, code });
});

// =================== LOBBY ===================

copyCodeBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentRoom);
    copyCodeBtn.textContent = 'Copied!';
    setTimeout(() => copyCodeBtn.textContent = 'Copy', 2000);
});

startGameBtn.addEventListener('click', () => {
    socket.emit('startGame');
});

function updateLobby(room) {
    roomCodeDisplay.textContent = room.code;

    playersList.innerHTML = '';
    room.players.forEach(p => {
        const card = document.createElement('div');
        card.className = 'player-card' + (p.id === room.host ? ' host' : '');
        card.innerHTML = `
            <div class="avatar">👤</div>
            <div class="name">${p.name}</div>
        `;
        playersList.appendChild(card);
    });

    // Show/hide host controls
    isHost = room.host === myId;
    startGameBtn.classList.toggle('hidden', !isHost);
    waitingHint.classList.toggle('hidden', isHost);
    lobbySettings.classList.toggle('hidden', !isHost);
}

// =================== GAME ===================

function updateScoreboard(players, scores, drawerId) {
    scoreboard.innerHTML = '';
    players.forEach(p => {
        const entry = document.createElement('div');
        entry.className = 'score-entry';
        if (p.id === drawerId) entry.classList.add('drawing');
        entry.innerHTML = `
            <span class="name">${p.id === drawerId ? '🖌️ ' : ''}${p.name}</span>
            <span class="score">${scores[p.id] || 0}</span>
        `;
        scoreboard.appendChild(entry);
    });
}

function addChatMessage(name, message, type = '') {
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + type;
    if (type === 'system') {
        msg.textContent = message;
    } else {
        msg.innerHTML = `<span class="name">${name}:</span> ${message}`;
    }
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Chat input
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && chatInput.value.trim()) {
        socket.emit('guess', chatInput.value.trim());
        chatInput.value = '';
    }
});

// =================== DRAWING ===================

function initCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mouseout', endDraw);

// Touch support
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDraw(getTouchPos(e)); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(getTouchPos(e)); });
canvas.addEventListener('touchend', endDraw);

function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
    };
}

function startDraw(e) {
    if (currentDrawerId !== myId) return;
    drawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function draw(e) {
    if (!drawing || currentDrawerId !== myId) return;

    const x = e.offsetX;
    const y = e.offsetY;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = isEraser ? '#ffffff' : brushColor;
    ctx.lineWidth = brushSize;
    ctx.stroke();

    // Send to server
    socket.emit('draw', {
        x0: lastX, y0: lastY,
        x1: x, y1: y,
        color: isEraser ? '#ffffff' : brushColor,
        size: brushSize
    });

    [lastX, lastY] = [x, y];
}

function endDraw() {
    drawing = false;
}

// Receive drawing from server
socket.on('draw', (data) => {
    ctx.beginPath();
    ctx.moveTo(data.x0, data.y0);
    ctx.lineTo(data.x1, data.y1);
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.size;
    ctx.stroke();
});

socket.on('clearCanvas', () => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// =================== SOCKET EVENTS ===================

socket.on('connect', () => {
    myId = socket.id;
    console.log('Connected:', myId);
});

socket.on('roomCreated', (data) => {
    currentRoom = data.code;
    updateLobby(data.room);
    showScreen(lobbyScreen);
});

socket.on('roomJoined', (data) => {
    currentRoom = data.code;
    updateLobby(data.room);
    showScreen(lobbyScreen);
});

socket.on('playerJoined', (data) => {
    updateLobby({ code: currentRoom, players: data.players, host: data.players[0]?.id });
    addChatMessage('', `${data.player.name} joined!`, 'system');
});

socket.on('playerLeft', (data) => {
    updateLobby({ code: currentRoom, players: data.players, host: data.newHost });
    addChatMessage('', 'A player left', 'system');
});

socket.on('gameStarted', (data) => {
    showScreen(gameScreen);
    totalRoundsEl.textContent = data.room.settings.rounds;
    initCanvas();
    initColorPalette();
});

socket.on('newTurn', (data) => {
    currentDrawerId = data.drawer;
    roundNumEl.textContent = data.round;
    wordHintEl.textContent = '...';

    resultsOverlay.classList.add('hidden');
    wordSelection.classList.add('hidden');
    drawTools.classList.add('hidden');
    chatInput.disabled = (currentDrawerId === myId);

    initCanvas(); // Clear for new turn
});

socket.on('yourTurn', (data) => {
    // Show word selection
    wordChoices.innerHTML = '';
    data.words.forEach(word => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = word;
        btn.addEventListener('click', () => {
            socket.emit('selectWord', word);
            wordSelection.classList.add('hidden');
            drawTools.classList.remove('hidden');
        });
        wordChoices.appendChild(btn);
    });
    wordSelection.classList.remove('hidden');
});

socket.on('roundStart', (data) => {
    currentDrawerId = data.drawer;
    wordHintEl.textContent = data.hint;

    // Timer
    let timeLeft = data.time;
    timerEl.textContent = timeLeft;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 10) timerEl.style.color = '#ff0000';
        if (timeLeft <= 0) clearInterval(timerInterval);
    }, 1000);
    timerEl.style.color = '';

    if (currentDrawerId === myId) {
        drawTools.classList.remove('hidden');
    }
});

socket.on('correctGuess', (data) => {
    addChatMessage(data.playerName, 'guessed the word! +' + data.points, 'correct');
    // Update scoreboard would be nice here
});

socket.on('chat', (data) => {
    addChatMessage(data.name, data.message);
});

socket.on('closeGuess', () => {
    addChatMessage('', 'Close guess!', 'system');
});

socket.on('turnEnd', (data) => {
    clearInterval(timerInterval);
    drawTools.classList.add('hidden');

    document.querySelector('#revealWord strong').textContent = data.word;
    resultsOverlay.classList.remove('hidden');

    setTimeout(() => resultsOverlay.classList.add('hidden'), 5000);
});

socket.on('gameEnd', (data) => {
    const rankings = document.getElementById('finalRankings');
    rankings.innerHTML = '';
    data.rankings.forEach((p, i) => {
        const entry = document.createElement('div');
        entry.className = 'rank-entry';
        entry.innerHTML = `
            <span class="position">#${i + 1}</span>
            <span class="name">${p.name}</span>
            <span class="score">${p.score}</span>
        `;
        rankings.appendChild(entry);
    });
    gameEndOverlay.classList.remove('hidden');
});

document.getElementById('playAgainBtn').addEventListener('click', () => {
    gameEndOverlay.classList.add('hidden');
    showScreen(lobbyScreen);
});

document.getElementById('exitBtn').addEventListener('click', () => {
    location.reload();
});

socket.on('error', (data) => {
    showError(data.message);
});

// Init
initCanvas();

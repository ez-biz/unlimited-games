const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { getRandomWords, generateHint } = require('./words');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Rooms storage
const rooms = new Map();

// Generate room code
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// Create new room
function createRoom(hostId, hostName, settings = {}) {
    const code = generateRoomCode();
    const room = {
        code,
        host: hostId,
        players: [],
        settings: {
            maxPlayers: settings.maxPlayers || 8,
            rounds: settings.rounds || 3,
            drawTime: settings.drawTime || 80,
            wordChoices: settings.wordChoices || 3
        },
        state: 'lobby', // lobby, playing, roundEnd, gameEnd
        currentRound: 0,
        currentDrawer: null,
        currentWord: null,
        wordHint: null,
        turnOrder: [],
        currentTurnIndex: 0,
        scores: {},
        guessedPlayers: new Set(),
        drawData: []
    };
    rooms.set(code, room);
    return room;
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    let currentRoom = null;
    let playerName = null;

    // Create room
    socket.on('createRoom', (data) => {
        playerName = data.name || 'Player';
        const room = createRoom(socket.id, playerName, data.settings);
        room.players.push({ id: socket.id, name: playerName, avatar: data.avatar || 0 });
        room.scores[socket.id] = 0;

        socket.join(room.code);
        currentRoom = room.code;

        socket.emit('roomCreated', { code: room.code, room: sanitizeRoom(room) });
        console.log(`Room ${room.code} created by ${playerName}`);
    });

    // Join room
    socket.on('joinRoom', (data) => {
        const code = data.code.toUpperCase();
        const room = rooms.get(code);

        if (!room) {
            socket.emit('error', { message: 'Room not found!' });
            return;
        }

        if (room.players.length >= room.settings.maxPlayers) {
            socket.emit('error', { message: 'Room is full!' });
            return;
        }

        if (room.state !== 'lobby') {
            socket.emit('error', { message: 'Game already in progress!' });
            return;
        }

        playerName = data.name || 'Player';
        room.players.push({ id: socket.id, name: playerName, avatar: data.avatar || 0 });
        room.scores[socket.id] = 0;

        socket.join(code);
        currentRoom = code;

        socket.emit('roomJoined', { code, room: sanitizeRoom(room) });
        io.to(code).emit('playerJoined', {
            player: { id: socket.id, name: playerName, avatar: data.avatar || 0 },
            players: room.players
        });

        console.log(`${playerName} joined room ${code}`);
    });

    // Start game
    socket.on('startGame', () => {
        const room = rooms.get(currentRoom);
        if (!room || room.host !== socket.id) return;
        if (room.players.length < 2) {
            socket.emit('error', { message: 'Need at least 2 players!' });
            return;
        }

        room.state = 'playing';
        room.currentRound = 1;
        room.turnOrder = room.players.map(p => p.id).sort(() => Math.random() - 0.5);
        room.currentTurnIndex = 0;

        io.to(currentRoom).emit('gameStarted', { room: sanitizeRoom(room) });
        startTurn(room);
    });

    // Word selected by drawer
    socket.on('selectWord', (word) => {
        const room = rooms.get(currentRoom);
        if (!room || room.currentDrawer !== socket.id) return;

        room.currentWord = word;
        room.wordHint = generateHint(word);
        room.guessedPlayers.clear();
        room.drawData = [];

        io.to(currentRoom).emit('roundStart', {
            drawer: room.currentDrawer,
            hint: room.wordHint,
            time: room.settings.drawTime
        });

        // Start timer
        room.timer = setTimeout(() => endTurn(room), room.settings.drawTime * 1000);
    });

    // Drawing data
    socket.on('draw', (data) => {
        const room = rooms.get(currentRoom);
        if (!room || room.currentDrawer !== socket.id) return;

        room.drawData.push(data);
        socket.to(currentRoom).emit('draw', data);
    });

    // Clear canvas
    socket.on('clearCanvas', () => {
        const room = rooms.get(currentRoom);
        if (!room || room.currentDrawer !== socket.id) return;

        room.drawData = [];
        io.to(currentRoom).emit('clearCanvas');
    });

    // Chat/Guess
    socket.on('guess', (message) => {
        const room = rooms.get(currentRoom);
        if (!room || room.state !== 'playing') return;
        if (room.currentDrawer === socket.id) return; // Drawer can't guess
        if (room.guessedPlayers.has(socket.id)) return; // Already guessed

        const guess = message.toLowerCase().trim();
        const word = room.currentWord.toLowerCase();

        if (guess === word) {
            // Correct guess!
            room.guessedPlayers.add(socket.id);

            // Calculate points
            const position = room.guessedPlayers.size;
            const points = Math.max(200, 600 - (position * 100));
            room.scores[socket.id] = (room.scores[socket.id] || 0) + points;
            room.scores[room.currentDrawer] = (room.scores[room.currentDrawer] || 0) + 50;

            io.to(currentRoom).emit('correctGuess', {
                playerId: socket.id,
                playerName: playerName,
                points,
                scores: room.scores
            });

            // Check if everyone guessed
            if (room.guessedPlayers.size >= room.players.length - 1) {
                clearTimeout(room.timer);
                endTurn(room);
            }
        } else {
            // Wrong guess - broadcast as chat
            io.to(currentRoom).emit('chat', {
                playerId: socket.id,
                name: playerName,
                message: message
            });

            // Close guess hint
            if (word.includes(guess) || guess.includes(word.substring(0, 3))) {
                socket.emit('closeGuess');
            }
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);

        if (currentRoom) {
            const room = rooms.get(currentRoom);
            if (room) {
                room.players = room.players.filter(p => p.id !== socket.id);
                delete room.scores[socket.id];

                if (room.players.length === 0) {
                    rooms.delete(currentRoom);
                    console.log(`Room ${currentRoom} deleted (empty)`);
                } else {
                    // Reassign host if needed
                    if (room.host === socket.id) {
                        room.host = room.players[0].id;
                    }

                    io.to(currentRoom).emit('playerLeft', {
                        playerId: socket.id,
                        players: room.players,
                        newHost: room.host
                    });

                    // Handle if current drawer left
                    if (room.currentDrawer === socket.id && room.state === 'playing') {
                        clearTimeout(room.timer);
                        endTurn(room);
                    }
                }
            }
        }
    });
});

function startTurn(room) {
    const drawerId = room.turnOrder[room.currentTurnIndex];
    room.currentDrawer = drawerId;
    room.drawData = [];

    const words = getRandomWords(room.settings.wordChoices);

    // Send word choices to drawer only
    const drawerSocket = io.sockets.sockets.get(drawerId);
    if (drawerSocket) {
        drawerSocket.emit('yourTurn', { words });
    }

    // Notify others
    io.to(room.code).emit('newTurn', {
        drawer: drawerId,
        round: room.currentRound
    });
}

function endTurn(room) {
    io.to(room.code).emit('turnEnd', {
        word: room.currentWord,
        scores: room.scores
    });

    room.currentTurnIndex++;

    // Check if round complete (everyone drew)
    if (room.currentTurnIndex >= room.turnOrder.length) {
        room.currentTurnIndex = 0;
        room.currentRound++;

        // Check if game complete
        if (room.currentRound > room.settings.rounds) {
            endGame(room);
            return;
        }
    }

    // Start next turn after delay
    setTimeout(() => startTurn(room), 5000);
}

function endGame(room) {
    room.state = 'gameEnd';

    // Calculate rankings
    const rankings = room.players
        .map(p => ({ ...p, score: room.scores[p.id] || 0 }))
        .sort((a, b) => b.score - a.score);

    io.to(room.code).emit('gameEnd', { rankings });

    // Reset room for new game
    setTimeout(() => {
        room.state = 'lobby';
        room.currentRound = 0;
        room.scores = {};
        room.players.forEach(p => room.scores[p.id] = 0);
    }, 10000);
}

function sanitizeRoom(room) {
    return {
        code: room.code,
        host: room.host,
        players: room.players,
        settings: room.settings,
        state: room.state,
        currentRound: room.currentRound,
        currentDrawer: room.currentDrawer,
        wordHint: room.wordHint,
        scores: room.scores
    };
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Neon Doodle server running on http://localhost:${PORT}`);
});
